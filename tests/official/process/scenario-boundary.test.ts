import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";

import {
  OfficialNeutralScenarioEnvelopeSchema,
  OfficialObserverProcessSuccessSchema,
  OfficialProcessFailureSchema,
  OfficialScenarioProviderProcessSuccessSchema,
  sha256CanonicalJson,
  type OfficialImmutableArmDecision,
} from "../../../src/official/process/ipc.ts";

const PROCESS_ROOT = path.resolve("src/official/process");
const WORKER_ROOT = path.resolve("tests/official/process/workers");
const NODE_MODULES_ROOT = path.resolve("node_modules");
const PACKAGE_JSON = path.resolve("package.json");
const VERIFIER_ROOT = path.resolve("tests/official/fixtures/verifier-only");
const CANDIDATE_ROOT = path.resolve("tests/official/fixtures/candidates");
const FIXTURE_IDS = [
  "BG-D01", "BG-D02", "BG-D03", "BG-D04", "BG-H01",
  "BG-H02", "BG-H03", "BG-H04", "BG-H05", "BG-H06",
] as const;

function runWorker(moduleName: string, request: unknown, allowed: readonly string[]) {
  const result = spawnSync(process.execPath, [
    "--permission",
    ...allowed.flatMap((entry) => ["--allow-fs-read", entry]),
    path.join(WORKER_ROOT, moduleName),
  ], {
    cwd: process.cwd(),
    encoding: "utf8",
    input: `${JSON.stringify(request)}\n`,
  });
  return { ...result, json: JSON.parse(result.stdout.trim()) as unknown };
}

function createDecision(
  fixtureId: typeof FIXTURE_IDS[number],
  candidateId: string,
  arm: "status-quo" | "beyondgreen",
): OfficialImmutableArmDecision {
  const slot = {
    slotId: `${fixtureId}:${candidateId}`,
    fixtureId,
    candidateId,
    candidateSha256: sha256CanonicalJson({ fixtureId, candidateId }),
  };
  const core = {
    schemaVersion: "beyondgreen-official-arm-decision@1.0.0" as const,
    slot,
    arm,
    verdict: "accept" as const,
    rationale: "Synthetic immutable decision.",
    inputSha256: slot.candidateSha256,
    evidenceSha256: sha256CanonicalJson({ fixtureId, candidateId, arm }),
    immutable: true as const,
  };
  return { ...core, decisionSha256: sha256CanonicalJson(core) };
}

const decisions = FIXTURE_IDS.flatMap((fixtureId) => ["candidate-a", "candidate-b"].flatMap((candidateId) => [
  createDecision(fixtureId, candidateId, "status-quo"),
  createDecision(fixtureId, candidateId, "beyondgreen"),
]));
const slot = decisions.find(({ slot: candidateSlot }) => candidateSlot.slotId === "BG-D02:candidate-a")!.slot;
const slotDecisions = decisions.filter(({ slot: candidateSlot }) => candidateSlot.slotId === slot.slotId) as [
  OfficialImmutableArmDecision,
  OfficialImmutableArmDecision,
];

function base(requestId: string) {
  return {
    schemaVersion: "beyondgreen-official-process-ipc@1.0.0" as const,
    requestId,
    evaluationVersion: "eval-v1.1.0" as const,
    slot,
    inputSha256: slot.candidateSha256,
  };
}

test("scenario provider reads verifier material, denies candidates, and releases only after 40 decisions", () => {
  const response = runWorker("synthetic-scenario-provider-worker.ts", {
    ...base("scenario:BG-D02:candidate-a"),
    role: "scenario-provider",
    operation: "release_after_all_decisions",
    decisions,
    payload: {
      allowedVerifierPath: path.join(VERIFIER_ROOT, "oracle.json"),
      boundaryProbePath: path.join(CANDIDATE_ROOT, "candidate-a.mjs"),
    },
  }, [PROCESS_ROOT, WORKER_ROOT, NODE_MODULES_ROOT, PACKAGE_JSON, VERIFIER_ROOT]);
  assert.equal(response.status, 0, response.stderr);
  const scenario = OfficialScenarioProviderProcessSuccessSchema.parse(response.json).scenario;
  assert.equal(scenario.slot.slotId, slot.slotId);
  assert.equal(scenario.decisionSetSha256, sha256CanonicalJson(decisions));

  const early = runWorker("synthetic-scenario-provider-worker.ts", {
    ...base("scenario:too-early"),
    role: "scenario-provider",
    operation: "release_after_all_decisions",
    decisions: slotDecisions,
    payload: {
      allowedVerifierPath: path.join(VERIFIER_ROOT, "oracle.json"),
      boundaryProbePath: path.join(CANDIDATE_ROOT, "candidate-a.mjs"),
    },
  }, [PROCESS_ROOT, WORKER_ROOT, NODE_MODULES_ROOT, PACKAGE_JSON, VERIFIER_ROOT]);
  assert.equal(early.status, 1);
  assert.equal(OfficialProcessFailureSchema.parse(early.json).errorCode, "MALFORMED_IPC");
});

test("scenario-bound observer reads candidate material but physically denies verifier bytes", () => {
  const scenarioResponse = runWorker("synthetic-scenario-provider-worker.ts", {
    ...base("scenario:observer-binding"),
    role: "scenario-provider",
    operation: "release_after_all_decisions",
    decisions,
    payload: {
      allowedVerifierPath: path.join(VERIFIER_ROOT, "oracle.json"),
      boundaryProbePath: path.join(CANDIDATE_ROOT, "candidate-a.mjs"),
    },
  }, [PROCESS_ROOT, WORKER_ROOT, NODE_MODULES_ROOT, PACKAGE_JSON, VERIFIER_ROOT]);
  const scenario = OfficialScenarioProviderProcessSuccessSchema.parse(scenarioResponse.json).scenario;
  const observer = runWorker("synthetic-scenario-bound-observer-worker.ts", {
    ...base("observer:scenario-bound"),
    role: "observer",
    operation: "capture_after_decisions",
    targetArm: "status-quo",
    decisions: slotDecisions,
    scenario,
    payload: {
      allowedCandidatePath: path.join(CANDIDATE_ROOT, "candidate-a.mjs"),
      boundaryProbePath: path.join(VERIFIER_ROOT, "oracle.json"),
    },
  }, [PROCESS_ROOT, WORKER_ROOT, NODE_MODULES_ROOT, PACKAGE_JSON, CANDIDATE_ROOT]);
  assert.equal(observer.status, 0, observer.stderr);
  const capture = OfficialObserverProcessSuccessSchema.parse(observer.json).capture;
  assert.equal((capture.transcript as { verifierReadDenied: boolean }).verifierReadDenied, true);
  assert.equal((capture.transcript as { scenarioSha256: string }).scenarioSha256, scenario.scenarioSha256);
});

test("neutral scenario schema rejects evaluator-shaped payloads", () => {
  const core = {
    schemaVersion: "beyondgreen-official-neutral-scenario@1.0.0" as const,
    slot,
    scenarioId: "scenario:unsafe",
    decisionSetSha256: sha256CanonicalJson(decisions),
    steps: [{ action: "inspect", parameters: { groundTruth: "false_green" } }],
    immutable: true as const,
  };
  assert.equal(OfficialNeutralScenarioEnvelopeSchema.safeParse({
    ...core,
    scenarioSha256: sha256CanonicalJson(core),
  }).success, false);
});
