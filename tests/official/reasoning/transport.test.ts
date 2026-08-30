import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { z } from "zod";

import {
  buildCodexExecJsonlCommand,
  CODEX_EXEC_ENGINE_TIMEOUT_MS,
  CODEX_EXEC_FINALIZATION_RESERVE_MS,
  CODEX_EXEC_TOTAL_TIMEOUT_MS,
  createCodexExecDeadlinePlan,
  mapCodexExecFailure,
  parseCodexExecJsonl,
} from "../../../src/official/reasoning/index.ts";

const OutputSchema = z.object({
  schemaVersion: z.literal("test-reasoning-output@1.0.0"),
  decision: z.enum(["accept", "reject", "abstain"]),
}).strict();

const fixtureUrl = (name: string) => new URL(`./fixtures/${name}`, import.meta.url);

test("builder freezes the exact one-call read-only contract without shell execution", () => {
  const command = buildCodexExecJsonlCommand({
    outputSchemaPath: "tests/official/reasoning/fixtures/output-schema.json",
    prompt: "Return the synthetic result.",
  });
  assert.equal(command.executable, "codex");
  assert.deepEqual(command.args, [
    "exec", "--ephemeral", "--ignore-user-config", "--json", "--output-schema",
    "tests/official/reasoning/fixtures/output-schema.json", "--sandbox", "read-only",
    "--model", "gpt-5.6-sol", "-",
  ]);
  assert.equal(command.stdin, "Return the synthetic result.");
  assert.equal(command.shell, false);
  assert.equal(command.invocationLimit, 1);
  assert.equal(command.retryLimit, 0);
  assert.ok(Object.isFrozen(command));
  assert.ok(Object.isFrozen(command.args));
  assert.throws(() => buildCodexExecJsonlCommand({ outputSchemaPath: "../oracle.json", prompt: "x" }), /repository relative/i);
});

test("deadline plan reserves exactly 165 engine seconds plus 15 finalization seconds", () => {
  const plan = createCodexExecDeadlinePlan(1_000);
  assert.equal(CODEX_EXEC_ENGINE_TIMEOUT_MS + CODEX_EXEC_FINALIZATION_RESERVE_MS, CODEX_EXEC_TOTAL_TIMEOUT_MS);
  assert.equal(plan.engineDeadlineAtMs, 166_000);
  assert.equal(plan.totalDeadlineAtMs, 181_000);
  assert.throws(() => createCodexExecDeadlinePlan(Number.NaN), /finite non-negative/i);
});

test("offline JSONL parser accepts one schema-valid final result and explicit token counts", async () => {
  const jsonl = await readFile(fixtureUrl("success.jsonl"), "utf8");
  const parsed = parseCodexExecJsonl(jsonl, OutputSchema);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.deepEqual(parsed.output, { schemaVersion: "test-reasoning-output@1.0.0", decision: "accept" });
  assert.deepEqual(parsed.tokenUsage, { inputTokens: 17, cachedInputTokens: 0, outputTokens: 9 });
  assert.equal(parsed.invocationCount, 1);
  assert.equal(parsed.retryCount, 0);
  assert.equal(parsed.perRunUsdCalculatedOrEstimated, false);
  assert.ok(Object.isFrozen(parsed));
  assert.ok(Object.isFrozen(parsed.output));
});

test("parser and safe error mapping fail closed without retry or substitute model", async () => {
  const transportError = await readFile(fixtureUrl("transport-error.jsonl"), "utf8");
  const streamFailure = parseCodexExecJsonl(transportError, OutputSchema);
  assert.deepEqual(streamFailure, {
    ok: false,
    failure: {
      adapterId: "codex-exec-jsonl-v1",
      outcome: "abstain",
      code: "STREAM_ERROR",
      invocationCount: 1,
      retryAllowed: false,
      substituteModelAllowed: false,
      monetaryCost: "not_applicable_or_not_measured",
      perRunUsdCalculatedOrEstimated: false,
    },
  });
  assert.equal(mapCodexExecFailure({ source: "timeout", phase: "engine" }).code, "ENGINE_TIMEOUT");
  assert.equal(mapCodexExecFailure({ source: "process", safeClass: "transport", exitCode: 1 }).code, "MODEL_TRANSPORT_FAILURE");
  assert.equal(mapCodexExecFailure({ source: "process", safeClass: "authentication", exitCode: 1 }).retryAllowed, false);
});

test("malformed, incomplete, duplicate, and schema-invalid streams are rejected", () => {
  assert.equal(parseCodexExecJsonl("not-json\n", OutputSchema).failure.code, "MALFORMED_JSONL");
  assert.equal(parseCodexExecJsonl('{"type":"thread.started"}\n', OutputSchema).failure.code, "INCOMPLETE_STREAM");

  const duplicate = [
    '{"type":"thread.started"}',
    '{"type":"turn.started"}',
    '{"type":"item.completed","item":{"type":"agent_message","text":"{\\"schemaVersion\\":\\"test-reasoning-output@1.0.0\\",\\"decision\\":\\"accept\\"}"}}',
    '{"type":"item.completed","item":{"type":"agent_message","text":"{\\"schemaVersion\\":\\"test-reasoning-output@1.0.0\\",\\"decision\\":\\"reject\\"}"}}',
    '{"type":"turn.completed"}',
  ].join("\n");
  assert.equal(parseCodexExecJsonl(duplicate, OutputSchema).failure.code, "MULTIPLE_FINAL_OUTPUTS");

  const invalid = [
    '{"type":"thread.started"}',
    '{"type":"turn.started"}',
    '{"type":"item.completed","item":{"type":"agent_message","text":"{\\"decision\\":\\"accept\\"}"}}',
    '{"type":"turn.completed"}',
  ].join("\n");
  assert.equal(parseCodexExecJsonl(invalid, OutputSchema).failure.code, "INVALID_FINAL_OUTPUT");
});
