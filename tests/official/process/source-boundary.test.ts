import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const processSources = [
  "src/official/process/ipc.ts",
  "src/official/process/transport.ts",
  "src/official/process/arm-entrypoint.ts",
  "src/official/process/observer-entrypoint.ts",
  "src/official/process/evaluator-entrypoint.ts",
  "tests/official/process/workers/synthetic-arm-worker.ts",
  "tests/official/process/workers/synthetic-observer-worker.ts",
  "tests/official/process/workers/synthetic-evaluator-worker.ts",
] as const;

test("process stream has no real fixture, candidate, verifier, or D01 imports", () => {
  for (const sourcePath of processSources) {
    const source = readFileSync(sourcePath, "utf8");
    assert.doesNotMatch(source, /\bfrom\s+["'][^"']*(?:candidates|evaluation|fixtures|src\/d01)[^"']*["']/u, sourcePath);
    assert.doesNotMatch(source, /\bimport\s*\([^)]*(?:candidates|evaluation|fixtures|src\/d01)/u, sourcePath);
  }
});
