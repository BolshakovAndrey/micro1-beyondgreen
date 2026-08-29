import assert from "node:assert/strict";
import test from "node:test";

import {
  ENGINE_TIMEOUT_MS,
  FROZEN_ARGS,
  OWNER_AUTHORIZED_DIAGNOSTIC_RETRIES,
  PHASE_MODEL_CALL_LIMIT,
  WRAPPER_AUTOMATIC_RETRY_LIMIT,
  buildReplay,
  classifyStderr,
  parseCodexJsonl,
  validateReplay,
} from "./model-probe.ts";

const finalOutput = {
  probe_id: "BG-P05-LIVE-001",
  status: "passed",
  model: "gpt-5.6-sol",
  sandbox: "read-only",
  message: "Schema compliance confirmed.",
};

test("frozen command enforces subscription probe controls", () => {
  assert.deepEqual(FROZEN_ARGS, [
    "exec", "--ephemeral", "--ignore-user-config", "--json", "--output-schema",
    "spikes/phase-0.5/model-output.schema.json", "--sandbox", "read-only", "--model", "gpt-5.6-sol",
  ]);
  assert.equal(PHASE_MODEL_CALL_LIMIT, 2);
  assert.equal(OWNER_AUTHORIZED_DIAGNOSTIC_RETRIES, 1);
  assert.equal(WRAPPER_AUTOMATIC_RETRY_LIMIT, 0);
  assert.equal(ENGINE_TIMEOUT_MS, 165_000);
});

test("stderr classifier emits only a narrow class, hash, and redaction counts", () => {
  const sensitive = [
    "model gpt-5.6-sol is not available",
    "/" + "Users" + "/example/work/repo",
    "person" + "@example.test",
    "project" + "_abcd1234",
    "sk-" + "abcdefghijklmnopqrstuvwxyz",
    "host=" + "workstation-77",
  ].join(" ");
  const result = classifyStderr(sensitive);
  assert.equal(result.safe_class, "model_unavailable");
  assert.deepEqual(result.redaction_counts, {
    absolute_paths: 1,
    emails: 1,
    account_project_ids: 1,
    tokens_or_secrets: 1,
    machine_identifiers: 1,
  });
  assert.equal(result.raw_stderr_persisted_or_disclosed, false);
  assert.equal(result.sanitized_excerpt_persisted, false);
  assert.deepEqual(Object.keys(result).sort(), [
    "raw_stderr_persisted_or_disclosed",
    "redaction_counts",
    "safe_class",
    "sanitized_excerpt_persisted",
    "stderr_sha256",
  ]);
});

test("stderr classifier covers the approved safe enum", () => {
  assert.equal(classifyStderr("authentication required").safe_class, "auth");
  assert.equal(classifyStderr("invalid output schema").safe_class, "schema");
  assert.equal(classifyStderr("unknown option").safe_class, "argument");
  assert.equal(classifyStderr("network connection timeout").safe_class, "network_transport");
  assert.equal(classifyStderr("repository is not trusted").safe_class, "sandbox_repository");
  assert.equal(classifyStderr("unclassified failure").safe_class, "unknown");
});

test("JSONL parser is deterministic and validates one schema output", () => {
  const jsonl = [
    JSON.stringify({ type: "thread.started" }),
    JSON.stringify({ type: "item.completed", item: { type: "agent_message", text: JSON.stringify(finalOutput) } }),
    JSON.stringify({ type: "turn.completed", usage: null }),
  ].join("\n");
  const first = parseCodexJsonl(jsonl);
  const second = parseCodexJsonl(jsonl);
  assert.deepEqual(first.output, finalOutput);
  assert.equal(first.normalized_sha256, second.normalized_sha256);
});

test("malformed, missing, and duplicate final output abstain before reuse", () => {
  assert.throws(() => parseCodexJsonl("not-json"), { code: "INVALID_JSONL" });
  assert.throws(() => parseCodexJsonl(JSON.stringify({ type: "turn.completed" })), { code: "FINAL_MESSAGE_CARDINALITY" });
  const event = JSON.stringify({ type: "item.completed", item: { type: "agent_message", text: JSON.stringify(finalOutput) } });
  assert.throws(() => parseCodexJsonl(`${event}\n${event}`), { code: "FINAL_MESSAGE_CARDINALITY" });
});

test("offline replay hash chain is deterministic and rejects tampering", () => {
  const payloads = [
    { record_type: "header", run_id: "P05-OFFLINE-001" },
    { record_type: "model_request", request_id: "REQ-001", payload: { synthetic: true } },
    { record_type: "model_response", request_id: "REQ-001", payload: finalOutput },
    { record_type: "footer", verdict: "passed" },
  ];
  const first = buildReplay(payloads);
  const second = buildReplay(payloads);
  assert.deepEqual(first, second);
  assert.equal(validateReplay(first), true);
  const tampered = structuredClone(first);
  tampered[2].payload.status = "abstain";
  assert.equal(validateReplay(tampered), false);
});
