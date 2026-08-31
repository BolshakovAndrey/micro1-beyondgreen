import assert from "node:assert/strict";
import test from "node:test";

import {
  PUBLIC_TRANSPORT_CANARY_PROMPT,
  runPublicTransportCanary,
} from "../../../scripts/d00-transport-canary.ts";
import { resolveTask } from "../../../scripts/tasks/registry.ts";
import type { CodexProcessRunner } from "../../../src/official/runtime/codex-transport.ts";

function jsonl(output: unknown): string {
  return [
    { type: "thread.started" },
    { type: "turn.started" },
    { type: "item.completed", item: { type: "agent_message", text: JSON.stringify(output) } },
    { type: "turn.completed" },
  ].map((event) => JSON.stringify(event)).join("\n") + "\n";
}

test("transport:canary is a single production-adapter call with safe output", async () => {
  let calls = 0;
  const runner: CodexProcessRunner = {
    async run({ command }) {
      calls += 1;
      assert.equal(command.stdin, PUBLIC_TRANSPORT_CANARY_PROMPT);
      assert.equal(command.invocationLimit, 1);
      assert.equal(command.retryLimit, 0);
      return {
        stdout: jsonl({
          verdict: "abstain",
          rationale: "Public transport-only health check.",
          evidence: { canary: "public_transport_only", externalDataUsed: false },
        }),
        exitCode: 0,
        timedOut: false,
        spawnError: false,
      };
    },
  };
  const times = [100, 142];
  const summary = await runPublicTransportCanary({ runner, now: () => times.shift()! });
  assert.equal(calls, 1);
  assert.deepEqual(summary, {
    status: "PASS",
    adapter: "codex-exec-jsonl-v1",
    model: "gpt-5.6-sol",
    invocationCount: 1,
    retryCount: 0,
    durationMs: 42,
    schemaValid: true,
    failureCode: null,
    officialOrScoredRun: false,
    unblindingPerformed: false,
    rawOutputPublished: false,
  });
  assert.deepEqual(resolveTask("transport:canary", []).steps[0]?.arguments, ["scripts/d00-transport-canary.ts"]);
});

test("transport:canary reduces nonzero output to a safe failure summary", async () => {
  const runner: CodexProcessRunner = {
    async run() {
      return {
        stdout: "sensitive raw output that must not escape",
        exitCode: 1,
        timedOut: false,
        spawnError: false,
      };
    },
  };
  const summary = await runPublicTransportCanary({ runner, now: () => 500 });
  assert.equal(summary.status, "FAIL");
  assert.equal(summary.failureCode, "NONZERO_EXIT");
  assert.equal(summary.invocationCount, 1);
  assert.equal(summary.retryCount, 0);
  assert.equal(JSON.stringify(summary).includes("sensitive"), false);
});
