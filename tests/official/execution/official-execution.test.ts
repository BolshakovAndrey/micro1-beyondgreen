import assert from "node:assert/strict";
import { readdirSync, rmSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  executeOfficialEvaluation,
  type OfficialExecutionHooks,
} from "../../../src/official/execution/index.ts";
import {
  OfficialExecutionPlanSchema,
  type OfficialExecutionSlot,
} from "../../../src/official/integration/execution-plan.ts";
import type { OfficialStaticPreflightResult } from "../../../src/official/integration/preflight.ts";
import { sha256CanonicalJson } from "../../../src/official/process/ipc.ts";

const FIXTURE_IDS = [
  "BG-D01", "BG-D02", "BG-D03", "BG-D04", "BG-H01",
  "BG-H02", "BG-H03", "BG-H04", "BG-H05", "BG-H06",
] as const;

let temporaryOrdinal = 0;

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    for (const child of Object.values(value)) deepFreeze(child);
    if (!Object.isFrozen(value)) Object.freeze(value);
  }
  return value;
}

function createSyntheticPreflight(): OfficialStaticPreflightResult {
  const slots = FIXTURE_IDS.flatMap((fixtureId) => ["candidate-a", "candidate-b"].map((candidateId) => ({
    fixtureId,
    candidateId,
  }))).map(({ fixtureId, candidateId }, index) => ({
    ordinal: index + 1,
    slotId: `${fixtureId}:${candidateId}`,
    fixtureId,
    candidateId,
    candidate: {
      modulePath: `tests/official/synthetic/${fixtureId}/${candidateId}.ts`,
      exportName: "SyntheticCandidate",
      sha256: sha256CanonicalJson({ fixtureId, candidateId }),
    },
    descriptor: {
      modulePath: `tests/official/synthetic/${fixtureId}/descriptor.ts`,
      exportName: "SYNTHETIC_DESCRIPTOR",
    },
    membership: fixtureId.startsWith("BG-D") ? "development" : "held_out",
    behaviorClass: `synthetic_${fixtureId.toLowerCase().replace("-", "_")}`,
    arms: ["status-quo", "beyondgreen"],
    attemptOrdinal: 1,
    candidateExecutionAllowed: false,
    officialOrScoredRun: false,
  }));
  const executionPlan = deepFreeze(OfficialExecutionPlanSchema.parse({
    schemaVersion: "beyondgreen-official-execution-plan@1.0.0",
    evaluationVersion: "eval-v1.1.0",
    inventorySha256: sha256CanonicalJson({ syntheticInventory: true }),
    slotCount: 20,
    armsPerSlot: 2,
    totalArmPlans: 40,
    slots,
    candidateExecutionAllowed: false,
    officialOrScoredRun: false,
    unblindingPerformed: false,
    runRecordCreated: false,
  }));
  return deepFreeze({
    schemaVersion: "beyondgreen-official-static-preflight@1.0.0",
    inventorySha256: executionPlan.inventorySha256,
    fixtureCount: 10,
    candidateCount: 20,
    executionPlan,
    candidateImportsPerformed: false,
    candidateExecutionPerformed: false,
    verifierContentParsed: false,
    officialOrScoredRun: false,
    unblindingPerformed: false,
    readyForSyntheticProcessRehearsal: true,
  });
}

function createDecision(slot: OfficialExecutionSlot, arm: "status-quo" | "beyondgreen", verdict = "accept" as const) {
  const core = {
    schemaVersion: "beyondgreen-official-arm-decision@1.0.0" as const,
    slot: {
      slotId: slot.slotId,
      fixtureId: slot.fixtureId,
      candidateId: slot.candidateId,
      candidateSha256: slot.candidate.sha256,
    },
    arm,
    verdict,
    rationale: verdict === "abstain" ? "Synthetic transport uncertainty." : "Synthetic evidence is complete.",
    inputSha256: slot.candidate.sha256,
    evidenceSha256: sha256CanonicalJson({ fixtureId: slot.fixtureId, candidateId: slot.candidateId, arm, verdict }),
    immutable: true as const,
  };
  return deepFreeze({ ...core, decisionSha256: sha256CanonicalJson(core) });
}

function createOutputRoot(label: string): string {
  temporaryOrdinal += 1;
  return path.resolve(`.tmp-official-execution-${process.pid}-${temporaryOrdinal}-${label}`);
}

function syntheticHooks(input: Readonly<{
  captureMode?: "matching" | "divergent" | "missing" | "malformed";
  transportAbstainOrdinal?: number;
  events?: string[];
}> = {}): OfficialExecutionHooks {
  const preflight = createSyntheticPreflight();
  const events = input.events ?? [];
  const transportAbstainOrdinal = input.transportAbstainOrdinal ?? 10;
  const transportAbstainSlotId = preflight.executionPlan.slots.find(
    ({ ordinal }) => ordinal === transportAbstainOrdinal,
  )?.slotId;
  if (!transportAbstainSlotId) throw new Error("Synthetic transport abstention slot is absent.");
  return {
    staticPreflight: () => preflight,
    hashCandidate: (slot) => slot.candidate.sha256,
    executeArm({ slot, arm }) {
      events.push(`decision:${slot.slotId}:${arm}`);
      const transportAbstain = arm === "beyondgreen" && slot.ordinal === transportAbstainOrdinal;
      return {
        decision: createDecision(slot, arm, transportAbstain ? "abstain" : "accept"),
        reasoningInvocationCount: arm === "status-quo" ? 0 : 1,
        retryCount: 0,
      };
    },
    releaseNeutralScenario({ slot, decisions }) {
      assert.equal(decisions.length, 40);
      assert.equal(events.includes("evaluation-gate"), true);
      events.push(`scenario:${slot.slotId}`);
      const core = {
        schemaVersion: "beyondgreen-official-neutral-scenario@1.0.0" as const,
        slot,
        scenarioId: `scenario:${slot.fixtureId}`,
        decisionSetSha256: sha256CanonicalJson(decisions),
        steps: [{ action: "synthetic-action", parameters: { value: slot.fixtureId } }],
        immutable: true as const,
      };
      return deepFreeze({ ...core, scenarioSha256: sha256CanonicalJson(core) });
    },
    captureObservation({ slot, arm, decisions, scenario, captureOrdinal }) {
      assert.equal(events.filter((event) => event.startsWith("decision:")).length, 40);
      assert.equal(events.filter((event) => event.startsWith("scenario:")).length, 20);
      assert.equal(scenario.slot.slotId, slot.slotId);
      events.push(`capture:${slot.slotId}:${arm}:${captureOrdinal}`);
      if (slot.slotId === "BG-D01:candidate-a" && arm === "status-quo") {
        if (input.captureMode === "missing" && captureOrdinal === 2) return undefined;
        if (input.captureMode === "malformed" && captureOrdinal === 2) return { malformed: true };
      }
      const decision = decisions.find((entry) => entry.arm === arm)!;
      const transcript = {
        fixtureId: slot.fixtureId,
        candidateId: slot.candidateId,
        arm,
        frames: input.captureMode === "divergent"
          && slot.slotId === "BG-D01:candidate-a" && arm === "status-quo" && captureOrdinal === 2
          ? ["different"]
          : ["same"],
      };
      const core = {
        schemaVersion: "beyondgreen-official-observer-capture@1.0.0" as const,
        slot,
        arm,
        decisionSha256: decision.decisionSha256,
        transcript,
        transcriptSha256: sha256CanonicalJson(transcript),
        immutable: true as const,
      };
      return deepFreeze({ ...core, captureSha256: sha256CanonicalJson(core) });
    },
    beginPostDecisionEvaluation({ decisions, pairs, syntheticOnly }) {
      assert.equal(decisions.length, 40);
      assert.equal(pairs.length, 0);
      assert.equal(syntheticOnly, true);
      events.push("evaluation-gate");
      return { unblindingPerformed: false };
    },
    evaluate({ slot, arm, observationPair }) {
      assert.equal(events.filter((event) => event.startsWith("capture:")).length, 80);
      events.push(`evaluate:${slot.slotId}:${arm}`);
      return {
        evaluationVersion: "eval-v1.1.0" as const,
        fixtureId: slot.fixtureId,
        candidateId: slot.candidateId,
        arm,
        verdict: arm === "beyondgreen" && slot.slotId === transportAbstainSlotId ? "abstain" as const : "accept" as const,
        groundTruth: slot.candidateId === "candidate-a" ? "preserving" as const : "false_green" as const,
        reasonCorrectReject: false,
        schemaValidCompleteReport: observationPair.immutable,
      };
    },
  };
}

test("full synthetic execution preserves 20/40/80/40 after a slot-10 transport abstention", async () => {
  const outputRoot = createOutputRoot("success");
  const events: string[] = [];
  try {
    const result = await executeOfficialEvaluation({
      repositoryRoot: process.cwd(),
      outputRoot,
      hooks: syntheticHooks({ events }),
      syntheticOnly: true,
      provenance: { syntheticOnly: true },
    });
    assert.equal(result.slotCount, 20);
    assert.equal(result.armPlanCount, 40);
    assert.equal(result.captureRecordCount, 80);
    assert.equal(result.finalizedPairCount, 40);
    assert.equal(result.records.length, 40);
    assert.equal(result.replayDigestMatched, true);
    assert.equal(result.officialOrScoredRun, false);
    assert.equal(result.unblindingPerformed, false);
    assert.equal(result.decisions.filter(({ verdict }) => verdict === "abstain").length, 1);
    assert.equal(result.decisions.find(({ verdict }) => verdict === "abstain")?.slot.slotId, "BG-H01:candidate-b");
    assert.equal(result.records.filter(({ verdict }) => verdict === "abstain").length, 1);
    assert.ok(result.decisions.every(Object.isFrozen));
    assert.ok(result.observationPairs.every(Object.isFrozen));
    assert.equal(events.filter((event) => event.startsWith("decision:")).length, 40);
    assert.equal(events.filter((event) => event.startsWith("scenario:")).length, 20);
    assert.equal(events.filter((event) => event.startsWith("capture:")).length, 80);
    assert.equal(events.filter((event) => event.startsWith("evaluate:")).length, 40);
    assert.equal(readdirSync(path.join(outputRoot, "arm-records")).length, 40);
    assert.equal(readdirSync(path.join(outputRoot, "observer-records")).length, 80);
    assert.equal(readdirSync(path.join(outputRoot, "evaluator-records")).length, 40);
  } finally {
    rmSync(outputRoot, { recursive: true, force: true });
  }
});

for (const [captureMode, expected] of [
  ["divergent", /OBSERVATION_CAPTURE_DIVERGENCE/u],
  ["missing", /OBSERVATION_CAPTURE_MISSING/u],
  ["malformed", /OBSERVATION_CAPTURE_MALFORMED/u],
] as const) {
  test(`synthetic ${captureMode} capture fails closed before evaluator`, async () => {
    const outputRoot = createOutputRoot(captureMode);
    const events: string[] = [];
    try {
      await assert.rejects(executeOfficialEvaluation({
        repositoryRoot: process.cwd(),
        outputRoot,
        hooks: syntheticHooks({ captureMode, events }),
        syntheticOnly: true,
        provenance: { syntheticOnly: true },
      }), expected);
      assert.equal(events.filter((event) => event.startsWith("evaluate:")).length, 0);
      assert.equal(events.includes("evaluation-gate"), true);
    } finally {
      rmSync(outputRoot, { recursive: true, force: true });
    }
  });
}

test("existing output root fails before any arm execution", async () => {
  const outputRoot = createOutputRoot("collision");
  const events: string[] = [];
  const { mkdirSync } = await import("node:fs");
  mkdirSync(outputRoot);
  try {
    await assert.rejects(executeOfficialEvaluation({
      repositoryRoot: process.cwd(),
      outputRoot,
      hooks: syntheticHooks({ events }),
      syntheticOnly: true,
      provenance: { syntheticOnly: true },
    }));
    assert.equal(events.length, 0);
  } finally {
    rmSync(outputRoot, { recursive: true, force: true });
  }
});
