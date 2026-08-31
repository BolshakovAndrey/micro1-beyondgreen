import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";

import {
  OfficialArmProcessSuccessSchema,
  OfficialEvaluatorProcessSuccessSchema,
  OfficialObserverProcessSuccessSchema,
  OfficialProcessFailureSchema,
  sha256CanonicalJson,
  type OfficialImmutableArmDecision,
  type OfficialObserverCapture,
} from "../../../src/official/process/ipc.ts";

const processSourceRoot = path.resolve("src/official/process");
const workerRoot = path.resolve("tests/official/process/workers");
const nodeModulesRoot = path.resolve("node_modules");
const packageJson = path.resolve("package.json");

function runWorker(moduleName: string, input: unknown | string) {
  const result = spawnSync(process.execPath, [
    "--permission",
    "--allow-fs-read", processSourceRoot,
    "--allow-fs-read", workerRoot,
    "--allow-fs-read", nodeModulesRoot,
    "--allow-fs-read", packageJson,
    path.join(workerRoot, moduleName),
  ], {
    cwd: process.cwd(),
    encoding: "utf8",
    input: typeof input === "string" ? input : `${JSON.stringify(input)}\n`,
  });
  return { ...result, json: JSON.parse(result.stdout.trim()) as unknown };
}

const hash = (label: string): string => sha256CanonicalJson({ label });
const slot = Object.freeze({
  slotId: "BG-D02:candidate-a",
  fixtureId: "BG-D02" as const,
  candidateId: "candidate-a",
  candidateSha256: hash("synthetic-candidate"),
});
const inputSha256 = hash("visible-input");

function requestBase(requestId: string) {
  return {
    schemaVersion: "beyondgreen-official-process-ipc@1.0.0" as const,
    requestId,
    evaluationVersion: "eval-v1.1.0" as const,
    slot,
    inputSha256,
  };
}

function runArm(arm: "status-quo" | "beyondgreen"): OfficialImmutableArmDecision {
  const result = runWorker("synthetic-arm-worker.ts", {
    ...requestBase(`arm-${arm}`),
    role: "arm",
    operation: "decide",
    arm,
    attemptOrdinal: 1,
    payload: {
      verdict: arm === "status-quo" ? "accept" : "reject",
      rationale: `synthetic ${arm} decision`,
      boundaryProbePath: path.resolve("tests/official/process/forbidden/arm-secret.txt"),
    },
  });
  assert.equal(result.status, 0, result.stderr);
  return OfficialArmProcessSuccessSchema.parse(result.json).decision;
}

function runObserver(
  arm: "status-quo" | "beyondgreen",
  decisions: [OfficialImmutableArmDecision, OfficialImmutableArmDecision],
): OfficialObserverCapture {
  const result = runWorker("synthetic-observer-worker.ts", {
    ...requestBase(`observer-${arm}`),
    role: "observer",
    operation: "capture_after_decisions",
    targetArm: arm,
    decisions,
    payload: {
      frames: [{ phase: "post-decision", value: arm.length }],
      boundaryProbePath: path.resolve("tests/official/process/forbidden/observer-secret.txt"),
    },
  });
  assert.equal(result.status, 0, result.stderr);
  return OfficialObserverProcessSuccessSchema.parse(result.json).capture;
}

test("separate role processes enforce decision-before-observation and physical read denial", () => {
  const decisions = [runArm("status-quo"), runArm("beyondgreen")] as const;
  assert.ok(decisions.every(({ immutable }) => immutable));

  for (const arm of ["status-quo", "beyondgreen"] as const) {
    const capture = runObserver(arm, [...decisions]);
    assert.equal((capture.transcript as { boundaryDenied: boolean }).boundaryDenied, true);
    const evaluator = runWorker("synthetic-evaluator-worker.ts", {
      ...requestBase(`evaluator-${arm}`),
      role: "evaluator",
      operation: "evaluate_after_capture",
      targetArm: arm,
      decisions,
      capture,
      payload: {
        groundTruth: arm === "status-quo" ? "preserving" : "false_green",
        reasonCorrectReject: arm === "beyondgreen",
        schemaValidCompleteReport: true,
        boundaryProbePath: path.resolve("tests/official/process/forbidden/evaluator-secret.txt"),
      },
    });
    assert.equal(evaluator.status, 0, evaluator.stderr);
    const result = OfficialEvaluatorProcessSuccessSchema.parse(evaluator.json);
    assert.equal(result.decisionSha256, decisions.find((decision) => decision.arm === arm)!.decisionSha256);
    assert.equal(result.captureSha256, capture.captureSha256);
    assert.equal(result.record.verdict, decisions.find((decision) => decision.arm === arm)!.verdict);
  }
});

test("malformed and incomplete role IPC fails closed without retry", () => {
  const malformed = runWorker("synthetic-arm-worker.ts", "{not-json}\n");
  assert.equal(malformed.status, 1);
  assert.deepEqual(OfficialProcessFailureSchema.parse(malformed.json), {
    schemaVersion: "beyondgreen-official-process-failure@1.0.0",
    requestId: null,
    role: "arm",
    status: "error",
    disposition: "abstain",
    retryAllowed: false,
    errorCode: "MALFORMED_IPC",
    failureStage: null,
    message: "Malformed IPC was rejected before role execution.",
  });

  const statusQuo = runArm("status-quo");
  const incomplete = runWorker("synthetic-observer-worker.ts", {
    ...requestBase("observer-incomplete"),
    role: "observer",
    operation: "capture_after_decisions",
    targetArm: "status-quo",
    decisions: [statusQuo, statusQuo],
    payload: {
      frames: [{}],
      boundaryProbePath: path.resolve("tests/official/process/forbidden/observer-secret.txt"),
    },
  });
  assert.equal(incomplete.status, 1);
  const failure = OfficialProcessFailureSchema.parse(incomplete.json);
  assert.equal(failure.errorCode, "MALFORMED_IPC");
  assert.equal(failure.disposition, "abstain");
  assert.equal(failure.retryAllowed, false);
});
