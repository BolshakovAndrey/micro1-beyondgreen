#!/usr/bin/env node

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { classifyStderr } from "./model-probe.ts";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function classifyDiagnostic(label, exitCode, stdout, stderr) {
  const combined = `${stdout}\n${stderr}`;
  const folded = combined.toLowerCase();
  let safe_class = exitCode === 0 ? "passed" : "unknown";
  if (label === "exact_mode_authentication") {
    if (exitCode === 0 && /logged in using chatgpt/.test(folded)) safe_class = "auth_chatgpt_passed";
    else if (exitCode === 0 && /logged in using (?:an )?api key/.test(folded)) safe_class = "auth_api_key_passed";
    else if (/unexpected argument|unknown (?:argument|option)|invalid (?:argument|option)/.test(folded)) safe_class = "exact_mode_flag_unsupported";
    else if (/not logged in|login required|authentication|unauthorized/.test(folded)) safe_class = "auth_failed";
  }
  else if (exitCode === 0) {
    safe_class = "passed";
  }
  else if (/unknown (?:command|subcommand)|unrecognized subcommand|usage:/.test(folded) && exitCode !== 0) {
    safe_class = "command_unavailable";
  }
  else if (/network|connection|timeout|dns|tls|socket/.test(folded)) {
    safe_class = "network_transport";
  }
  else if (/configuration|config|sandbox|repository|workspace/.test(folded) && exitCode !== 0) {
    safe_class = "configuration_or_repository";
  }
  return safe_class;
}

export function safeCommandRecord(label, args, result) {
  const stdout = String(result.stdout ?? "");
  const stderr = String(result.stderr ?? "");
  const combinedDiagnostic = classifyStderr(`${stdout}\n${stderr}`);
  return {
    label,
    command: `codex ${args.join(" ")}`,
    passed: result.status === 0,
    exit_code: result.status ?? null,
    safe_class: classifyDiagnostic(label, result.status, stdout, stderr),
    stdout_sha256: sha256(stdout),
    stderr_sha256: sha256(stderr),
    redaction_counts: combinedDiagnostic.redaction_counts,
    raw_output_persisted_or_disclosed: false,
    sanitized_excerpt_persisted: false,
  };
}

function execute(args) {
  return spawnSync("codex", args, { encoding: "utf8", stdio: [ "ignore", "pipe", "pipe" ] });
}

export function runCliDiagnostics(root) {
  const versionResult = execute([ "--version" ]);
  const versionText = `${versionResult.stdout ?? ""}\n${versionResult.stderr ?? ""}`;
  const cliVersion = versionText.match(/codex-cli\s+([0-9]+(?:\.[0-9]+){2})/i)?.[1] ?? "unknown";

  const helpResult = execute([ "--help" ]);
  const helpText = `${helpResult.stdout ?? ""}\n${helpResult.stderr ?? ""}`;
  const advertised = {
    doctor: /^\s*doctor\b/im.test(helpText),
    usage: /^\s*usage\b/im.test(helpText),
    limits: /^\s*limits?\b/im.test(helpText),
    status: /^\s*status\b/im.test(helpText),
  };

  const records = [
    safeCommandRecord("cli_version", [ "--version" ], versionResult),
    safeCommandRecord("command_discovery", [ "--help" ], helpResult),
    safeCommandRecord("exact_mode_authentication", [ "login", "status", "--ignore-user-config" ], execute([ "login", "status", "--ignore-user-config" ])),
    safeCommandRecord("doctor", [ "doctor" ], execute([ "doctor" ])),
  ];

  const optional = [ "usage", "limits", "status" ].find((name) => advertised[name]);
  if (optional) {
    records.push(safeCommandRecord("subscription_usage_or_limit", [ optional ], execute([ optional ])));
  }

  const evidence = {
    schema_version: "beyondgreen-cli-diagnostics@1.0.0",
    completed_at_utc: new Date().toISOString(),
    scope: "non_model_cli_diagnostics_only",
    cli_version: cliVersion,
    model_or_agent_invocations: 0,
    raw_output_persisted_or_disclosed: false,
    command_availability: advertised,
    subscription_usage_or_limit_diagnostic: optional ? "executed" : "not_advertised_by_cli_help",
    records,
  };
  writeFileSync(path.join(root, "artifacts/phase-0.5-cli-diagnostics.json"), `${JSON.stringify(evidence, null, 2)}\n`);
  return evidence;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const root = path.resolve(import.meta.dirname, "../..");
  const evidence = runCliDiagnostics(root);
  process.stdout.write(`${JSON.stringify({
    schema_version: evidence.schema_version,
    cli_version: evidence.cli_version,
    command_availability: evidence.command_availability,
    subscription_usage_or_limit_diagnostic: evidence.subscription_usage_or_limit_diagnostic,
    results: evidence.records.map(({ label, passed, exit_code, safe_class, stdout_sha256, stderr_sha256, redaction_counts }) => ({
      label, passed, exit_code, safe_class, stdout_sha256, stderr_sha256, redaction_counts,
    })),
  })}\n`);
}
