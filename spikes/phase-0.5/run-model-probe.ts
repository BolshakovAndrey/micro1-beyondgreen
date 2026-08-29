#!/usr/bin/env node

import path from "node:path";
import { readFileSync } from "node:fs";
import { runLiveProbe, writeProbeEvidence } from "./model-probe.ts";

const root = path.resolve(import.meta.dirname, "../..");
const evidencePath = path.join(root, "artifacts/phase-0.5-model-probe.json");
const previous = JSON.parse(readFileSync(evidencePath, "utf8"));
const firstAttempt = previous.attempts?.[0] ?? {
  attempt: 1,
  purpose: "initial_live_feasibility_probe",
  completed_at_utc: previous.completed_at_utc,
  status: previous.status,
  error_code: previous.error_code,
  process_exit_code: previous.process_exit_code,
  stderr_sha256: previous.stderr_sha256,
  elapsed_seconds: previous.wrapper_elapsed_seconds,
  calls: 1,
  model_retries: 0,
  transport_retries: 0,
  substitute_model_used: false,
  raw_stderr_persisted_or_disclosed: false,
};

try {
  const evidence = await runLiveProbe(root);
  const combined = {
    schema_version: "beyondgreen-model-probe@1.1.0",
    status: evidence.status,
    command: evidence.command,
    model: "gpt-5.6-sol",
    total_calls: 2,
    owner_authorized_diagnostic_retries: 1,
    automatic_retries: 0,
    substitute_model_used: false,
    attempts: [ firstAttempt, {
      attempt: 2,
      purpose: "owner_authorized_privacy_safe_diagnostic_retry",
      completed_at_utc: new Date().toISOString(),
      ...evidence,
    } ],
  };
  writeProbeEvidence(root, combined);
  process.stdout.write(`${JSON.stringify({ status: combined.status, attempt: 2, total_calls: 2, retries: 1 })}\n`);
  process.exitCode = evidence.status === "passed" ? 0 : 1;
}
catch (error) {
  const attempt = {
    attempt: 2,
    purpose: "owner_authorized_privacy_safe_diagnostic_retry",
    completed_at_utc: new Date().toISOString(),
    status: "abstain",
    error_code: error?.code ?? "MODEL_PROBE_FAILURE",
    process_exit_code: error?.exit_code ?? null,
    elapsed_ms: error?.elapsed_ms ?? null,
    stderr_diagnostic: error?.diagnostic ?? {
      safe_class: "unknown",
      stderr_sha256: null,
      redaction_counts: {},
      sanitized_excerpt_persisted: false,
      raw_stderr_persisted_or_disclosed: false,
    },
    calls: 1,
    model_retries: 0,
    transport_retries: 0,
    substitute_model_used: false,
  };
  const combined = {
    schema_version: "beyondgreen-model-probe@1.1.0",
    status: "abstain",
    command: previous.command,
    model: "gpt-5.6-sol",
    total_calls: 2,
    owner_authorized_diagnostic_retries: 1,
    automatic_retries: 0,
    substitute_model_used: false,
    attempts: [ firstAttempt, attempt ],
    required_action: "stop_for_repository_owner_review_no_third_call",
  };
  writeProbeEvidence(root, combined);
  process.stdout.write(`${JSON.stringify({
    status: "abstain",
    attempt: 2,
    total_calls: 2,
    retries: 1,
    safe_class: attempt.stderr_diagnostic.safe_class,
    exit_code: attempt.process_exit_code,
    stderr_sha256: attempt.stderr_diagnostic.stderr_sha256,
    elapsed_ms: attempt.elapsed_ms,
    redaction_counts: attempt.stderr_diagnostic.redaction_counts,
  })}\n`);
  process.exitCode = 1;
}
