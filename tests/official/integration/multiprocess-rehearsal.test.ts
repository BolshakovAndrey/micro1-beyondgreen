import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";

import { rehearseSyntheticOfficialMultiProcess } from "../../../src/official/integration/multiprocess-rehearsal.ts";
import { sha256CanonicalJson } from "../../../src/official/process/ipc.ts";

const processRoot = path.resolve("src/official/process");
const workerRoot = path.resolve("tests/official/process/workers");
const nodeModulesRoot = path.resolve("node_modules");
const packageJson = path.resolve("package.json");
const workerByRole = {
  arm: "synthetic-arm-worker.ts",
  observer: "synthetic-observer-worker.ts",
  evaluator: "synthetic-evaluator-worker.ts",
} as const;

test("fully synthetic child processes preserve two-arm ordering, boundaries, reports, and replay", async () => {
  const events: string[] = [];
  const result = await rehearseSyntheticOfficialMultiProcess({
    slot: {
      slotId: "BG-D02:synthetic-candidate",
      fixtureId: "BG-D02",
      candidateId: "synthetic-candidate",
      candidateSha256: sha256CanonicalJson({ syntheticCandidate: true }),
    },
    inputSha256: sha256CanonicalJson({ syntheticVisibleInput: true }),
    async invoke(role, request) {
      if (role !== "arm") assert.equal(events.filter((event) => event.startsWith("arm:")).length, 2);
      if (role === "evaluator") assert.equal(events.filter((event) => event.startsWith("observer:")).length, 2);
      events.push(`${role}:${(request as {requestId: string}).requestId}`);
      const child = spawnSync(process.execPath, [
        "--permission",
        "--allow-fs-read", processRoot,
        "--allow-fs-read", workerRoot,
        "--allow-fs-read", nodeModulesRoot,
        "--allow-fs-read", packageJson,
        path.join(workerRoot, workerByRole[role]),
      ], {
        cwd: process.cwd(),
        encoding: "utf8",
        input: `${JSON.stringify(request)}\n`,
      });
      assert.equal(child.status, 0, child.stderr);
      return JSON.parse(child.stdout.trim()) as unknown;
    },
    payloads: {
      arm: (arm) => ({
        verdict: arm === "status-quo" ? "accept" : "reject",
        rationale: `synthetic ${arm} rationale`,
        boundaryProbePath: path.resolve("tests/official/process/forbidden/arm-secret.txt"),
      }),
      observer: (arm) => ({
        frames: [{ phase: "post-decision", arm, syntheticOnly: true }],
        boundaryProbePath: path.resolve("tests/official/process/forbidden/observer-secret.txt"),
      }),
      evaluator: (arm) => ({
        groundTruth: "false_green",
        reasonCorrectReject: arm === "beyondgreen",
        schemaValidCompleteReport: true,
        boundaryProbePath: path.resolve("tests/official/process/forbidden/evaluator-secret.txt"),
      }),
    },
  });

  assert.equal(result.decisions.length, 2);
  assert.ok(result.decisions.every(({ immutable }) => immutable));
  assert.equal(result.captures.length, 2);
  assert.ok(result.captures.every(({ immutable }) => immutable));
  assert.equal(result.records.length, 2);
  assert.equal(result.replay.aggregates.length, 2);
  assert.match(result.replay.reportJson, /beyondgreen-official-aggregate@1\.0\.0/u);
  assert.match(result.replay.reportHtml, /<!doctype html>/u);
  assert.match(result.reportJsonSha256, /^[a-f0-9]{64}$/u);
  assert.match(result.reportHtmlSha256, /^[a-f0-9]{64}$/u);
  assert.equal(result.replayDigestMatched, true);
  assert.equal(result.processesInvoked, 6);
  assert.equal(result.candidateImportsPerformed, false);
  assert.equal(result.candidateExecutionPerformed, false);
  assert.equal(result.officialOrScoredRun, false);
  assert.equal(result.unblindingPerformed, false);
});
