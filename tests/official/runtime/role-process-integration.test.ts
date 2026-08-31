import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import type { RoleCapabilityPlan } from "../../../src/official/adapters/types.ts";
import {
  OfficialEvaluatorProcessSuccessSchema,
  OfficialObserverProcessSuccessSchema,
  OfficialProcessFailureSchema,
  OfficialScenarioProviderProcessSuccessSchema,
  sha256CanonicalJson,
  type OfficialImmutableArmDecision,
} from "../../../src/official/process/ipc.ts";
import { createMacOsSandboxBackend } from "../../../src/official/runtime/macos-sandbox-backend.ts";
import { createProductionProcessLauncher } from "../../../src/official/runtime/process-launcher.ts";

const ROLE_WORKER = "src/official/runtime/role-process-entrypoint.ts";
const PUBLIC_BINDINGS = "tests/official/runtime/fixtures/public-role-bindings.ts";
const VERIFIER_BINDINGS = "tests/official/runtime/fixtures/verifier-role-bindings.ts";
const fixtureId = "BG-D02" as const;
const slot = Object.freeze({
  slotId: `${fixtureId}:candidate-a`, fixtureId, candidateId: "candidate-a",
  candidateSha256: sha256CanonicalJson({ synthetic: "candidate" }),
});

function decision(arm: "status-quo" | "beyondgreen", selectedSlot = slot): OfficialImmutableArmDecision {
  const core = {
    schemaVersion: "beyondgreen-official-arm-decision@1.0.0" as const,
    slot: selectedSlot, arm, verdict: "accept" as const, rationale: "Synthetic decision.",
    inputSha256: selectedSlot.candidateSha256, evidenceSha256: sha256CanonicalJson({ arm, slotId: selectedSlot.slotId }), immutable: true as const,
  };
  return Object.freeze({ ...core, decisionSha256: sha256CanonicalJson(core) });
}

const slotDecisions = Object.freeze([decision("status-quo"), decision("beyondgreen")]) as readonly [OfficialImmutableArmDecision, OfficialImmutableArmDecision];
const syntheticSlots = [slot, ...Array.from({ length: 19 }, (_, index) => Object.freeze({
  slotId: `BG-H01:synthetic-${index + 1}`,
  fixtureId: "BG-H01",
  candidateId: `synthetic-${index + 1}`,
  candidateSha256: sha256CanonicalJson({ syntheticSlot: index + 1 }),
}))];
const globalDecisions = Object.freeze(syntheticSlots.flatMap((selectedSlot) => [
  decision("status-quo", selectedSlot),
  decision("beyondgreen", selectedSlot),
]));

function requestBase(requestId: string) {
  return { schemaVersion: "beyondgreen-official-process-ipc@1.0.0" as const, requestId, evaluationVersion: "eval-v1.1.0" as const, slot, inputSha256: slot.candidateSha256 };
}

function capability(role: RoleCapabilityPlan["role"]): RoleCapabilityPlan {
  const publicRole = role === "arm" || role === "observer";
  return Object.freeze({
    role, fixtureId, candidateId: "candidate-a",
    entrypoint: { modulePath: ROLE_WORKER, exportName: "main", symbolKind: "runtime" },
    allowReadPaths: [
      "src/official/runtime",
      "src/official/process",
      "node_modules",
      "package.json",
      publicRole ? PUBLIC_BINDINGS : VERIFIER_BINDINGS,
    ],
    denyReadPaths: [publicRole ? VERIFIER_BINDINGS : PUBLIC_BINDINGS],
    networkAllowed: false,
  });
}

test("physical role worker completes status-quo, scenario, observer, and evaluator IPC", { skip: process.platform !== "darwin" }, async () => {
  const work = await mkdtemp(path.join(process.cwd(), ".official-role-integration-"));
  try {
    const launch = createProductionProcessLauncher({ repositoryRoot: process.cwd(), workingDirectoryRoot: work, backend: createMacOsSandboxBackend() });
    const arm = await launch({ role: "arm", capability: capability("arm"), attemptOrdinal: 1, request: {
      ...requestBase("arm:status-quo"), role: "arm", operation: "decide", arm: "status-quo", attemptOrdinal: 1,
      payload: { compilation: "passed", visibleTests: "passed", evidence: { syntheticOnly: true } },
    } });
    assert.equal((arm.response as any).decision.verdict, "accept");

    const scenarioResult = await launch({ role: "scenario-provider", capability: capability("scenario-provider"), attemptOrdinal: 1, request: {
      ...requestBase("scenario:synthetic"), role: "scenario-provider", operation: "release_after_all_decisions", decisions: globalDecisions,
      payload: { provider: { modulePath: VERIFIER_BINDINGS, exportName: "OFFICIAL_SCENARIO_PROVIDER_HANDLER" } },
    } });
    const scenarioFailure = OfficialProcessFailureSchema.safeParse(scenarioResult.response);
    if (scenarioFailure.success) assert.fail(scenarioFailure.data.errorCode);
    const scenario = OfficialScenarioProviderProcessSuccessSchema.parse(scenarioResult.response).scenario;

    const observerResult = await launch({ role: "observer", capability: capability("observer"), attemptOrdinal: 1, request: {
      ...requestBase("observer:synthetic"), role: "observer", operation: "capture_after_decisions", targetArm: "status-quo",
      decisions: slotDecisions, scenario,
      payload: { candidate: { modulePath: PUBLIC_BINDINGS, exportName: "SyntheticCandidate" }, mount: { modulePath: PUBLIC_BINDINGS, exportName: "mountSyntheticCandidate" } },
    } });
    const capture = OfficialObserverProcessSuccessSchema.parse(observerResult.response).capture;

    const evaluatorResult = await launch({ role: "evaluator", capability: capability("evaluator"), attemptOrdinal: 1, request: {
      ...requestBase("evaluator:synthetic"), role: "evaluator", operation: "evaluate_after_capture", targetArm: "status-quo",
      decisions: slotDecisions, capture,
      payload: { evaluator: { modulePath: VERIFIER_BINDINGS, exportName: "OFFICIAL_EVALUATOR_HANDLER" } },
    } });
    const record = OfficialEvaluatorProcessSuccessSchema.parse(evaluatorResult.response).record;
    assert.equal(record.groundTruth, "preserving");
    assert.equal(record.schemaValidCompleteReport, true);

    const failedObserver = await launch({ role: "observer", capability: capability("observer"), attemptOrdinal: 1, request: {
      ...requestBase("observer:missing-export"), role: "observer", operation: "capture_after_decisions", targetArm: "status-quo",
      decisions: slotDecisions, scenario,
      payload: { candidate: { modulePath: PUBLIC_BINDINGS, exportName: "MissingCandidate" }, mount: { modulePath: PUBLIC_BINDINGS, exportName: "mountSyntheticCandidate" } },
    } });
    const safeFailure = OfficialProcessFailureSchema.parse(failedObserver.response);
    assert.equal(safeFailure.errorCode, "HANDLER_FAILURE");
    assert.equal(safeFailure.failureStage, "LOAD_CANDIDATE");
    assert.equal(JSON.stringify(safeFailure).includes("MissingCandidate"), false);
  } finally {
    await rm(work, { recursive: true, force: true });
  }
});
