import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

export const MODEL_ID = "gpt-5.6-sol";
export const PHASE_MODEL_CALL_LIMIT = 2;
export const OWNER_AUTHORIZED_DIAGNOSTIC_RETRIES = 1;
export const WRAPPER_AUTOMATIC_RETRY_LIMIT = 0;
export const ENGINE_TIMEOUT_MS = 165_000;
export const FROZEN_ARGS = Object.freeze([
  "exec",
  "--ephemeral",
  "--ignore-user-config",
  "--json",
  "--output-schema",
  "spikes/phase-0.5/model-output.schema.json",
  "--sandbox",
  "read-only",
  "--model",
  MODEL_ID,
]);

export const ProbeOutput = z.object({
  probe_id: z.literal("BG-P05-LIVE-001"),
  status: z.enum([ "passed", "abstain" ]),
  model: z.literal(MODEL_ID),
  sandbox: z.literal("read-only"),
  message: z.string().min(1).max(160),
}).strict();

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function countMatches(value, pattern) {
  return [ ...value.matchAll(pattern) ].length;
}

export function classifyStderr(stderr) {
  const value = String(stderr);
  const folded = value.toLowerCase();
  const patterns = {
    absolute_paths: /(?:\/Users\/[^\s:]+|\/home\/[^\s:]+|[A-Za-z]:[\\/]Users[\\/][^\s:]+)/g,
    emails: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    account_project_ids: /\b(?:(?:org|proj|project|account)[-_][A-Za-z0-9_-]{4,}|(?:account|project)[ _-]?id\s*[:=]\s*[A-Za-z0-9_-]{4,})\b/gi,
    tokens_or_secrets: /\b(?:sk-[A-Za-z0-9_-]{12,}|(?:api[_-]?key|access[_-]?token|authorization)\s*[:=]\s*[^\s]+)/gi,
    machine_identifiers: /\b(?:hostname|machine|host)\s*[:=]\s*[^\s]+/gi,
  };
  const redaction_counts = Object.fromEntries(
    Object.entries(patterns).map(([ category, pattern ]) => [ category, countMatches(value, pattern) ]),
  );

  let safe_class = "unknown";
  if (/\b(model).*(unavailable|not available|not found|unsupported|does not exist)|unknown model|model_not_found/.test(folded)) {
    safe_class = "model_unavailable";
  }
  else if (/authentication|unauthorized|not logged in|login required|credential|\b401\b|\b403\b/.test(folded)) {
    safe_class = "auth";
  }
  else if (/output.?schema|json schema|schema validation|invalid schema/.test(folded)) {
    safe_class = "schema";
  }
  else if (/unknown (?:argument|option)|invalid (?:argument|option|value)|usage:/.test(folded)) {
    safe_class = "argument";
  }
  else if (/network|connection|transport|timed? ?out|timeout|dns|tls|socket/.test(folded)) {
    safe_class = "network_transport";
  }
  else if (/sandbox|read-only|permission denied|repository|git repo|workspace/.test(folded)) {
    safe_class = "sandbox_repository";
  }

  return {
    safe_class,
    stderr_sha256: sha256(value),
    redaction_counts,
    sanitized_excerpt_persisted: false,
    raw_stderr_persisted_or_disclosed: false,
  };
}

export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function parseCodexJsonl(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  const events = lines.map((line, index) => {
    try {
      return JSON.parse(line);
    }
    catch {
      throw Object.assign(new Error("invalid JSONL"), { code: "INVALID_JSONL", line: index + 1 });
    }
  });
  const messages = events
    .filter((event) => event.type === "item.completed" && event.item?.type === "agent_message")
    .map((event) => event.item.text)
    .filter((value) => typeof value === "string");
  if (messages.length !== 1) {
    throw Object.assign(new Error("expected one final message"), { code: "FINAL_MESSAGE_CARDINALITY" });
  }
  let output;
  try {
    output = ProbeOutput.parse(JSON.parse(messages[0]));
  }
  catch {
    throw Object.assign(new Error("invalid final output"), { code: "INVALID_FINAL_OUTPUT" });
  }
  return {
    events,
    output,
    event_types: events.reduce((counts, event) => ({ ...counts, [event.type]: (counts[event.type] ?? 0) + 1 }), {}),
    normalized_sha256: sha256(events.map(canonicalJson).join("\n")),
  };
}

export function buildReplay(payloads) {
  let previous = "0".repeat(64);
  return payloads.map((payload, sequence) => {
    const base = {
      schema_version: "beyondgreen-replay-jsonl@1.0.0",
      sequence,
      previous_chain_sha256: previous,
      ...payload,
    };
    const record_sha256 = sha256(canonicalJson(base));
    previous = sha256(`${previous}\n${record_sha256}`);
    return { ...base, record_sha256 };
  });
}

export function validateReplay(records) {
  let previous = "0".repeat(64);
  for (const [ index, record ] of records.entries()) {
    const { record_sha256, ...base } = record;
    if (record.sequence !== index || record.previous_chain_sha256 !== previous) return false;
    if (sha256(canonicalJson(base)) !== record_sha256) return false;
    previous = sha256(`${previous}\n${record_sha256}`);
  }
  return true;
}

export async function runLiveProbe(root, spawnImpl = spawn) {
  const prompt = readFileSync(path.join(root, "spikes/phase-0.5/model-probe-prompt.txt"), "utf8");
  const started = Date.now();
  const child = spawnImpl("codex", FROZEN_ARGS, { cwd: root, stdio: [ "pipe", "pipe", "pipe" ] });
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => { stdout += chunk; });
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  child.stdin.end(prompt);

  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    child.kill("SIGTERM");
  }, ENGINE_TIMEOUT_MS);
  const exitCode = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", resolve);
  });
  clearTimeout(timer);

  const elapsed_ms = Date.now() - started;
  if (timedOut) throw Object.assign(new Error("model timeout"), {
    code: "MODEL_TIMEOUT",
    exit_code: exitCode,
    elapsed_ms,
    diagnostic: { ...classifyStderr(stderr), safe_class: "network_transport" },
  });
  if (exitCode !== 0) throw Object.assign(new Error("model unavailable or transport failed"), {
    code: "MODEL_TRANSPORT_FAILURE",
    exit_code: exitCode,
    elapsed_ms,
    diagnostic: classifyStderr(stderr),
  });
  const parsed = parseCodexJsonl(stdout);
  return {
    schema_version: "beyondgreen-model-probe@1.0.0",
    status: parsed.output.status,
    command: `codex ${FROZEN_ARGS.join(" ")}`,
    calls: 1,
    retries: 0,
    elapsed_ms,
    stdout_sha256: sha256(stdout),
    stderr_diagnostic: classifyStderr(stderr),
    normalized_events_sha256: parsed.normalized_sha256,
    event_types: parsed.event_types,
    output: parsed.output,
    marginal_usd_cost: "not_measured",
    token_usage: "not_measured",
  };
}

export function writeProbeEvidence(root, evidence) {
  writeFileSync(path.join(root, "artifacts/phase-0.5-model-probe.json"), `${JSON.stringify(evidence, null, 2)}\n`);
}
