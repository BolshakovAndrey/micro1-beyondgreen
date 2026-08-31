import assert from "node:assert/strict";
import test from "node:test";

import type { RoleCapabilityPlan } from "../../../src/official/adapters/types.ts";
import {
  finalizeOfficialObservationPair,
} from "../../../src/official/execution/contracts.ts";
import {
  createOfficialProductionExecutionHooks,
  type OfficialProductionSlotBinding,
} from "../../../src/official/execution/production-composition.ts";
import { OfficialExecutionSlotSchema } from "../../../src/official/integration/execution-plan.ts";
import {
  sha256CanonicalJson,
  type OfficialImmutableArmDecision,
  type OfficialNeutralScenarioEnvelope,
  type OfficialProcessSlot,
} from "../../../src/official/process/ipc.ts";

const executionSlot = Object.freeze(OfficialExecutionSlotSchema.parse({
  ordinal: 1,
  slotId: "BG-D02:candidate-a",
  fixtureId: "BG-D02",
  candidateId: "candidate-a",
  candidate: {
    modulePath: "tests/official/fixtures/candidates/candidate-a.mjs",
    exportName: "SyntheticCandidate",
    sha256: sha256CanonicalJson({ candidate: "a" }),
  },
  descriptor: {
    modulePath: "tests/official/test-descriptor.ts",
    exportName: "createTestOfficialDescriptor",
  },
  membership: "development",
  behaviorClass: "synthetic",
  arms: ["status-quo", "beyondgreen"],
  attemptOrdinal: 1,
  candidateExecutionAllowed: false,
  officialOrScoredRun: false,
}));

const processSlot: OfficialProcessSlot = Object.freeze({
  slotId: executionSlot.slotId,
  fixtureId: executionSlot.fixtureId,
  candidateId: executionSlot.candidateId,
  candidateSha256: executionSlot.candidate.sha256,
});

function capability(role: RoleCapabilityPlan["role"]): RoleCapabilityPlan {
  return Object.freeze({
    role,
    fixtureId: executionSlot.fixtureId,
    candidateId: executionSlot.candidateId,
    entrypoint: {
      modulePath: `tests/official/process/workers/synthetic-${role}.ts`,
      exportName: "syntheticEntrypoint",
      symbolKind: "runtime",
    },
    allowReadPaths: Object.freeze(role === "arm" || role === "observer"
      ? ["evaluation/arm-visible/BG-D02", executionSlot.candidate.modulePath]
      : ["evaluation/verifier-only/BG-D02"]),
    denyReadPaths: Object.freeze(role === "arm" || role === "observer"
      ? ["evaluation/verifier-only/BG-D02"]
      : [executionSlot.candidate.modulePath, "evaluation/arm-visible/BG-D02"]),
    networkAllowed: false,
  });
}

const binding: OfficialProductionSlotBinding = Object.freeze({
  arm: Object.freeze({ "status-quo": capability("arm"), beyondgreen: capability("arm") }),
  scenarioProvider: capability("scenario-provider"),
  observer: capability("observer"),
  evaluator: capability("evaluator"),
  armPayload: (arm) => ({ arm }),
  scenarioProviderPayload: () => ({ syntheticOnly: true }),
  observerPayload: (arm, scenario) => ({ arm, scenarioSha256: scenario.scenarioSha256 }),
  evaluatorPayload: (arm) => ({ arm, syntheticOnly: true }),
});

function decision(slot: OfficialProcessSlot, arm: "status-quo" | "beyondgreen"): OfficialImmutableArmDecision {
  const core = {
    schemaVersion: "beyondgreen-official-arm-decision@1.0.0" as const,
    slot,
    arm,
    verdict: arm === "status-quo" ? "accept" as const : "reject" as const,
    rationale: "Synthetic role-process decision.",
    inputSha256: slot.candidateSha256,
    evidenceSha256: sha256CanonicalJson({ slot: slot.slotId, arm }),
    immutable: true as const,
  };
  return Object.freeze({ ...core, decisionSha256: sha256CanonicalJson(core) });
}

function globalDecisions(slotDecisions: readonly OfficialImmutableArmDecision[]): readonly OfficialImmutableArmDecision[] {
  return Object.freeze(Array.from({ length: 40 }, (_, index) => {
    if (index < 2) return slotDecisions[index]!;
    const fixtureId = `BG-H0${((Math.floor(index / 4) % 6) + 1)}` as const;
    const syntheticSlot = {
      slotId: `${fixtureId}:synthetic-${index}`,
      fixtureId,
      candidateId: `synthetic-${index}`,
      candidateSha256: sha256CanonicalJson({ index }),
    };
    return decision(syntheticSlot, index % 2 === 0 ? "status-quo" : "beyondgreen");
  }));
}

test("production composition enforces decision gate and routes four isolated roles", async () => {
  const roles: string[] = [];
  const hooks = createOfficialProductionExecutionHooks({
    staticPreflight: () => { throw new Error("not used by this bounded contract test"); },
    hashCandidate: () => executionSlot.candidate.sha256,
    resolveSlot: () => binding,
    async launcher({ role, request }) {
      roles.push(role);
      const value = request as any;
      if (role === "arm") {
        return {
          response: {
            schemaVersion: "beyondgreen-official-arm-process-result@1.0.0",
            requestId: value.requestId,
            role,
            status: "ok",
            decision: decision(value.slot, value.arm),
          },
          reasoningInvocationCount: value.arm === "status-quo" ? 0 : 1,
          retryCount: 0,
        };
      }
      if (role === "scenario-provider") {
        const core = {
          schemaVersion: "beyondgreen-official-neutral-scenario@1.0.0" as const,
          slot: value.slot,
          scenarioId: "scenario:synthetic",
          decisionSetSha256: sha256CanonicalJson(value.decisions),
          steps: [{ action: "synthetic-action", parameters: { value: 1 } }],
          immutable: true as const,
        };
        return {
          response: {
            schemaVersion: "beyondgreen-official-scenario-provider-result@1.0.0",
            requestId: value.requestId,
            role,
            status: "ok",
            scenario: { ...core, scenarioSha256: sha256CanonicalJson(core) },
          },
          reasoningInvocationCount: 0,
          retryCount: 0,
        };
      }
      if (role === "observer") {
        const selected = value.decisions.find((entry: OfficialImmutableArmDecision) => entry.arm === value.targetArm)!;
        const transcript = { scenarioSha256: value.scenario.scenarioSha256, syntheticOnly: true };
        const core = {
          schemaVersion: "beyondgreen-official-observer-capture@1.0.0" as const,
          slot: value.slot,
          arm: value.targetArm,
          decisionSha256: selected.decisionSha256,
          transcript,
          transcriptSha256: sha256CanonicalJson(transcript),
          immutable: true as const,
        };
        return {
          response: {
            schemaVersion: "beyondgreen-official-observer-process-result@1.0.0",
            requestId: value.requestId,
            role,
            status: "ok",
            capture: { ...core, captureSha256: sha256CanonicalJson(core) },
          },
          reasoningInvocationCount: 0,
          retryCount: 0,
        };
      }
      return {
        response: {
          schemaVersion: "beyondgreen-official-evaluator-process-result@1.0.0",
          requestId: value.requestId,
          role,
          status: "ok",
          decisionSha256: value.decisions.find((entry: OfficialImmutableArmDecision) => entry.arm === value.targetArm)!.decisionSha256,
          captureSha256: value.capture.captureSha256,
          record: {
            evaluationVersion: "eval-v1.1.0",
            fixtureId: value.slot.fixtureId,
            candidateId: value.slot.candidateId,
            arm: value.targetArm,
            verdict: value.decisions.find((entry: OfficialImmutableArmDecision) => entry.arm === value.targetArm)!.verdict,
            groundTruth: "false_green",
            reasonCorrectReject: value.targetArm === "beyondgreen",
            schemaValidCompleteReport: true,
          },
          evaluatorEvidenceSha256: sha256CanonicalJson({ syntheticOnly: true }),
          immutable: true,
        },
        reasoningInvocationCount: 0,
        retryCount: 0,
      };
    },
  });

  const statusQuo = await hooks.executeArm({
    slot: executionSlot,
    processSlot,
    arm: "status-quo",
    inputSha256: processSlot.candidateSha256,
    attemptOrdinal: 1,
  });
  const beyondGreen = await hooks.executeArm({
    slot: executionSlot,
    processSlot,
    arm: "beyondgreen",
    inputSha256: processSlot.candidateSha256,
    attemptOrdinal: 1,
  });
  const slotDecisions = [statusQuo.decision, beyondGreen.decision] as readonly [
    OfficialImmutableArmDecision,
    OfficialImmutableArmDecision,
  ];
  const allDecisions = globalDecisions(slotDecisions);

  await assert.rejects(hooks.releaseNeutralScenario({
    executionSlot,
    slot: processSlot,
    decisions: allDecisions,
  }), /forbidden before all immutable decisions/iu);
  const gate = await hooks.beginPostDecisionEvaluation({ decisions: allDecisions, pairs: [], syntheticOnly: true });
  assert.equal(gate.unblindingPerformed, false);
  const scenario = await hooks.releaseNeutralScenario({
    executionSlot,
    slot: processSlot,
    decisions: allDecisions,
  }) as OfficialNeutralScenarioEnvelope;
  const first = await hooks.captureObservation({
    executionSlot,
    slot: processSlot,
    arm: "beyondgreen",
    decisions: slotDecisions,
    scenario,
    captureOrdinal: 1,
  });
  const second = await hooks.captureObservation({
    executionSlot,
    slot: processSlot,
    arm: "beyondgreen",
    decisions: slotDecisions,
    scenario,
    captureOrdinal: 2,
  });
  const pair = finalizeOfficialObservationPair({
    slot: processSlot,
    arm: "beyondgreen",
    decision: beyondGreen.decision as OfficialImmutableArmDecision,
    captures: [first, second],
  });
  const record = await hooks.evaluate({
    executionSlot,
    slot: processSlot,
    arm: "beyondgreen",
    decisions: slotDecisions,
    observationPair: pair,
  });
  assert.equal((record as { verdict: string }).verdict, "reject");
  assert.deepEqual(roles, ["arm", "arm", "scenario-provider", "observer", "observer", "evaluator"]);
});

test("production composition rejects capability plans that cross the oracle boundary", async () => {
  const unsafeBinding: OfficialProductionSlotBinding = {
    ...binding,
    arm: {
      ...binding.arm,
      "status-quo": { ...binding.arm["status-quo"], denyReadPaths: [] },
    },
  };
  const hooks = createOfficialProductionExecutionHooks({
    staticPreflight: () => { throw new Error("unused"); },
    hashCandidate: () => executionSlot.candidate.sha256,
    resolveSlot: () => unsafeBinding,
    launcher: () => { throw new Error("launcher must not run"); },
  });
  await assert.rejects(hooks.executeArm({
    slot: executionSlot,
    processSlot,
    arm: "status-quo",
    inputSha256: processSlot.candidateSha256,
    attemptOrdinal: 1,
  }), /deny verifier-only/iu);
});
