import assert from "node:assert/strict";
import { mkdtemp, realpath, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  createCodexExecJsonlTransport,
  type CodexProcessRunner,
} from "../../../src/official/runtime/codex-transport.ts";

function jsonl(output: unknown): string {
  return [
    { type: "thread.started" },
    { type: "turn.started" },
    { type: "item.completed", item: { type: "agent_message", text: JSON.stringify(output) } },
    { type: "turn.completed" },
  ].map((event) => JSON.stringify(event)).join("\n") + "\n";
}

test("transport runs one oracle-free prompt in a disposable repository and removes it", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "bg-codex-transport-"));
  let observedCwd = "";
  let calls = 0;
  const runner: CodexProcessRunner = {
    async run({ command, cwd }) {
      calls += 1;
      observedCwd = cwd;
      assert.equal(command.invocationLimit, 1);
      assert.equal(command.retryLimit, 0);
      assert.equal(command.stdin, "Public candidate evidence only.");
      assert.ok(await realpath(path.join(cwd, ".git")));
      assert.ok(await realpath(path.join(cwd, "schemas", "arm-output.json")));
      return {
        stdout: jsonl({ verdict: "reject", rationale: "Synthetic defect evidence.", evidence: { probe: "failed" } }),
        exitCode: 0,
        timedOut: false,
        spawnError: false,
      };
    },
  };
  try {
    const transport = createCodexExecJsonlTransport({ workingDirectoryRoot: root, runner });
    const result = await transport.invoke({
      request: {} as never,
      prompt: "Public candidate evidence only.",
      outputSchemaPath: "schemas/arm-output.json",
    });
    assert.equal(result.ok, true);
    assert.equal(calls, 1);
    await assert.rejects(realpath(observedCwd));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("transport maps timeout and process failure to abstain without retry", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "bg-codex-transport-failure-"));
  try {
    for (const result of [
      { stdout: "", exitCode: null, timedOut: true, spawnError: false },
      { stdout: "", exitCode: null, timedOut: false, spawnError: true },
      { stdout: "", exitCode: 66, timedOut: false, spawnError: false },
    ]) {
      const transport = createCodexExecJsonlTransport({
        workingDirectoryRoot: root,
        runner: { async run() { return result; } },
      });
      const parsed = await transport.invoke({ request: {} as never, prompt: "x", outputSchemaPath: "schema.json" });
      assert.equal(parsed.ok, false);
      if (!parsed.ok) {
        assert.equal(parsed.failure.retryAllowed, false);
        assert.equal(parsed.failure.substituteModelAllowed, false);
      }
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
