import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import path from "node:path";

const root = process.cwd();
const armRoot = path.join(root, "evaluation", "arm-visible", "BG-D01");
const probePath = path.join(armRoot, "denied-probe.mjs");
const dependencyRoot = path.join(root, "node_modules");
const packagePath = path.join(root, "package.json");

function runProbe(arm: "status-quo" | "beyondgreen", candidateId: "candidate-a" | "candidate-b") {
  const candidateRoot = path.join(root, "candidates", "BG-D01", candidateId);
  const result = spawnSync(
    process.execPath,
    [
      "--permission",
      `--allow-fs-read=${armRoot}`,
      `--allow-fs-read=${candidateRoot}`,
      `--allow-fs-read=${dependencyRoot}`,
      `--allow-fs-read=${packagePath}`,
      probePath,
    ],
    {
      cwd: armRoot,
      encoding: "utf8",
      env: { PATH: process.env.PATH ?? "", BG_ARM: arm, BG_CANDIDATE: candidateId },
    },
  );
  assert.equal(result.status, 0, `${arm} probe failed without exposing verifier diagnostics`);
  assert.equal(result.stderr, "");
  return JSON.parse(result.stdout) as {
    allDenied: boolean;
    candidateExecutable: boolean;
    candidateReadable: boolean;
    errorProbeIndistinguishable: boolean;
    operationCount: number;
  };
}

test("status-quo process cannot enumerate, read, hash, or error-probe verifier-only", () => {
  for (const candidateId of ["candidate-a", "candidate-b"] as const) {
    assert.deepEqual(runProbe("status-quo", candidateId), {
      allDenied: true,
      candidateExecutable: true,
      candidateReadable: true,
      errorProbeIndistinguishable: true,
      operationCount: 8,
    });
  }
});

test("BeyondGreen process has the same physical verifier denial", () => {
  for (const candidateId of ["candidate-a", "candidate-b"] as const) {
    assert.deepEqual(runProbe("beyondgreen", candidateId), {
      allDenied: true,
      candidateExecutable: true,
      candidateReadable: true,
      errorProbeIndistinguishable: true,
      operationCount: 8,
    });
  }
});
