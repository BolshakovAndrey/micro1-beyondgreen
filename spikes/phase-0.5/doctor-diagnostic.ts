#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import dns from "node:dns/promises";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

const REDACTIONS = Object.freeze([
  [ "absolute_paths", /(?:\/Users\/[^\s'\"`]+|\/home\/[^\s'\"`]+|\/private\/var\/[^\s'\"`]+|[A-Za-z]:[\\/]Users[\\/][^\s'\"`]+)/gi, "<REDACTED_ABSOLUTE_PATH>" ],
  [ "emails", /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "<REDACTED_EMAIL>" ],
  [ "account_project_ids", /\b(?:(?:org|proj|project|account)[-_][A-Za-z0-9_-]{4,}|(?:account|project|organization)[ _-]?id\s*[:=]\s*[A-Za-z0-9_-]{4,})\b/gi, "<REDACTED_ACCOUNT_PROJECT_ID>" ],
  [ "tokens_or_secrets", /\b(?:sk-[A-Za-z0-9_-]{12,}|(?:api[_-]?key|access[_-]?token|authorization|bearer|password|secret)\s*[:=]\s*[^\s]+)/gi, "<REDACTED_SECRET>" ],
  [ "machine_identifiers", /\b(?:hostname|machine|host|user(?:name)?)\s*[:=]\s*[^\s]+/gi, "<REDACTED_MACHINE_ID>" ],
]);

export function redactDiagnosticText(raw) {
  let sanitized = String(raw);
  const counts = {};
  for (const [ category, pattern, placeholder ] of REDACTIONS) {
    let count = 0;
    sanitized = sanitized.replace(pattern, () => {
      count += 1;
      return placeholder;
    });
    counts[category] = count;
  }
  return { sanitized, counts };
}

export function classifyDoctorDetail(raw) {
  const folded = String(raw).toLowerCase();
  const rules = [
    [ "unsupported_doctor_mode", /unknown (?:command|subcommand)|unrecognized subcommand|unsupported.*doctor|doctor.*unsupported/, "UNSUPPORTED_DOCTOR", "Installed CLI does not support the requested doctor mode." ],
    [ "dns", /\benotfound\b|\beai_again\b|dns|name resolution|resolve (?:the )?(?:host|hostname)/, "DNS_RESOLUTION", "Codex doctor reported a DNS resolution failure." ],
    [ "tls", /\btls\b|\bssl\b|certificate|\bcert_[a-z_]+\b/, "TLS_CERTIFICATE", "Codex doctor reported a TLS or certificate failure." ],
    [ "http_auth", /\bhttp\s*(?:status\s*)?(?:401|403)\b|unauthorized|forbidden|authentication required|not logged in/, "HTTP_AUTH", "Codex doctor reported an HTTP authentication or authorization failure." ],
    [ "http", /\bhttp\s*(?:status\s*)?[45][0-9]{2}\b|server returned [45][0-9]{2}/, "HTTP_ERROR", "Codex doctor reported a non-success HTTP response." ],
    [ "connection", /\beconnrefused\b|\beconnreset\b|\betimedout\b|connection refused|connection reset|network unreachable|timed? ?out/, "CONNECTION_FAILURE", "Codex doctor reported a connection or timeout failure." ],
    [ "startup", /failed to start|startup|initialization|initialisation|panic|fatal runtime/, "STARTUP_FAILURE", "Codex doctor reported a startup or initialization failure." ],
    [ "configuration", /invalid config|configuration error|failed to (?:load|parse).*config|config.*(?:invalid|error)/, "CONFIGURATION_FAILURE", "Codex doctor reported a configuration failure." ],
  ];
  for (const [ safe_class, pattern, safe_error_code, safe_message ] of rules) {
    if (pattern.test(folded)) return { safe_class, safe_error_code, safe_message };
  }
  return {
    safe_class: "unknown",
    safe_error_code: "UNKNOWN_DOCTOR_FAILURE",
    safe_message: "Codex doctor failed without a safely classifiable diagnostic cause.",
  };
}

export function isAllowlistedOfficialHostname(value) {
  if (typeof value !== "string" || value.includes(":") || value.includes("/") || value.includes("?") || value.includes("#")) return false;
  const hostname = value.toLowerCase();
  if (hostname === "openai.com" || hostname === "chatgpt.com") return true;
  return /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:openai\.com|chatgpt\.com)$/.test(hostname);
}

export function extractAllowlistedFailedHostname(raw) {
  const dnsLines = String(raw).split(/\r?\n/).filter((line) =>
    /\benotfound\b|\beai_again\b|dns|name resolution|resolve (?:the )?(?:host|hostname)/i.test(line));
  for (const line of dnsLines) {
    const candidates = line.match(/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:openai\.com|chatgpt\.com)/gi) ?? [];
    const hostname = candidates.map((item) => item.toLowerCase()).find(isAllowlistedOfficialHostname);
    if (hostname) return hostname;
  }
  return null;
}

async function safeDnsLookup(hostname) {
  if (!hostname) return { attempted: false, hostname: null, pass: false, error_class: "not_attempted_no_allowlisted_hostname" };
  try {
    await dns.lookup(hostname);
    return { attempted: true, hostname, pass: true, error_class: "none" };
  }
  catch (error) {
    const errorClass = [ "ENOTFOUND", "ENODATA" ].includes(error?.code)
      ? "dns_not_found"
      : error?.code === "EAI_AGAIN" ? "dns_temporary_failure" : "dns_unknown";
    return { attempted: true, hostname, pass: false, error_class: errorClass };
  }
}

export function buildSafeDoctorRecord(result, elapsedMs) {
  const stdout = String(result.stdout ?? "");
  const stderr = String(result.stderr ?? "");
  const combined = `${stdout}\n${stderr}`;
  const redacted = redactDiagnosticText(combined);
  const detail = result.status === 0
    ? { safe_class: "passed", safe_error_code: "DOCTOR_OK", safe_message: "Codex doctor completed successfully." }
    : classifyDoctorDetail(combined);
  const failedHostname = detail.safe_class === "dns" ? extractAllowlistedFailedHostname(combined) : null;
  return {
    command: "codex doctor",
    passed: result.status === 0,
    exit_code: result.status ?? null,
    elapsed_ms: elapsedMs,
    ...detail,
    failed_hostname: failedHostname,
    failed_hostname_extraction: failedHostname ? "allowlisted_official_suffix" : "unknown_or_non_allowlisted_redacted",
    stdout_sha256: sha256(stdout),
    stderr_sha256: sha256(stderr),
    combined_output_sha256: sha256(combined),
    redaction_counts: redacted.counts,
    placeholders_applied_before_excerpt_selection: true,
    sanitized_excerpt: null,
    raw_output_persisted_or_disclosed: false,
  };
}

export async function runDoctorDiagnostic(root) {
  const started = Date.now();
  const result = spawnSync("codex", [ "doctor" ], { encoding: "utf8", stdio: [ "ignore", "pipe", "pipe" ] });
  const record = buildSafeDoctorRecord(result, Date.now() - started);
  record.failed_hostname_dns = await safeDnsLookup(record.failed_hostname);
  const evidencePath = path.join(root, "artifacts/phase-0.5-cli-diagnostics.json");
  const evidence = JSON.parse(readFileSync(evidencePath, "utf8"));
  const attempts = evidence.doctor_attempts ?? (evidence.doctor_detail ? [ evidence.doctor_detail ] : []);
  attempts.push(record);
  evidence.doctor_attempts = attempts;
  evidence.doctor_detail = record;
  evidence.doctor_diagnostic_reruns = (evidence.doctor_diagnostic_reruns ?? 0) + 1;
  evidence.model_or_agent_invocations = 0;
  writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  return record;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const root = path.resolve(import.meta.dirname, "../..");
  process.stdout.write(`${JSON.stringify(await runDoctorDiagnostic(root))}\n`);
}
