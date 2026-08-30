/** Proves reciprocal BG-H06 filesystem capability denial without exposing oracle data. */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";

function runProbe(probe: string, permitted: readonly string[]): unknown {
  const result = spawnSync(process.execPath, ["--permission", `--allow-fs-read=${permitted.join(",")}`, probe], { cwd: process.cwd(), encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test("BG-H06 arm and evaluator capability profiles deny reciprocal private roots", () => {
  const root = process.cwd();
  assert.deepEqual(runProbe("evaluation/arm-visible/BG-H06/denied-probe.mjs", [path.join(root, "evaluation/arm-visible/BG-H06"), path.join(root, "candidates/BG-H06")]), { allDenied: true, operationCount: 4 });
  assert.deepEqual(runProbe("evaluation/verifier-only/BG-H06/evaluator-denied-probe.mjs", [path.join(root, "evaluation/verifier-only/BG-H06"), path.join(root, "evaluation/arm-visible/BG-H06")]), { allDenied: true, operationCount: 3 });
});
