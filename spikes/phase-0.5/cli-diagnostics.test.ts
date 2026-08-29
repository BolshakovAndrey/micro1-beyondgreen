import assert from "node:assert/strict";
import test from "node:test";

import { classifyDiagnostic, safeCommandRecord } from "./cli-diagnostics.ts";

test("classifies exact-mode auth without retaining output", () => {
  assert.equal(classifyDiagnostic("exact_mode_authentication", 0, "Logged in using ChatGPT", ""), "auth_chatgpt_passed");
  assert.equal(classifyDiagnostic("exact_mode_authentication", 2, "", "unexpected argument"), "exact_mode_flag_unsupported");
  assert.equal(classifyDiagnostic("exact_mode_authentication", 1, "", "authentication required"), "auth_failed");
});

test("classifies doctor and availability failures", () => {
  assert.equal(classifyDiagnostic("doctor", 0, "healthy", ""), "passed");
  assert.equal(classifyDiagnostic("command_discovery", 0, "network and host options", ""), "passed");
  assert.equal(classifyDiagnostic("doctor", 2, "", "unknown subcommand"), "command_unavailable");
  assert.equal(classifyDiagnostic("doctor", 1, "", "network connection timeout"), "network_transport");
  assert.equal(classifyDiagnostic("doctor", 1, "", "configuration invalid"), "configuration_or_repository");
});

test("safe records retain only hashes, class, booleans, and redaction counts", () => {
  const stdout = "Logged in using ChatGPT person" + "@example.test";
  const stderr = "/" + "Users" + "/example/work host=" + "machine-9";
  const record = safeCommandRecord("exact_mode_authentication", [ "login", "status", "--ignore-user-config" ], {
    status: 0,
    stdout,
    stderr,
  });
  assert.equal(record.safe_class, "auth_chatgpt_passed");
  assert.equal(record.raw_output_persisted_or_disclosed, false);
  assert.equal(record.sanitized_excerpt_persisted, false);
  assert.equal(record.redaction_counts.absolute_paths, 1);
  assert.equal(record.redaction_counts.emails, 1);
  assert.equal(record.redaction_counts.machine_identifiers, 1);
  assert.doesNotMatch(JSON.stringify(record), /example|machine-9/);
});
