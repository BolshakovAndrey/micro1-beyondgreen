import { OfficialScoredRecordSchema, type OfficialScoredRecord } from "../aggregation.ts";
import type { OfficialExecutionSlot } from "../integration/execution-plan.ts";
import type { OfficialStaticPreflightResult } from "../integration/preflight.ts";
import { createOfficialReplayBundle, replayOfficialBundle, type OfficialReplayBundle } from "../replay.ts";
import type {
  OfficialImmutableArmDecision,
  OfficialNeutralScenarioEnvelope,
  OfficialProcessSlot,
} from "../process/ipc.ts";
import { sha256CanonicalJson } from "../process/ipc.ts";
import {
  finalizeOfficialObservationPair,
  parseOfficialArmDecision,
  parseOfficialNeutralScenario,
  parseOfficialObserverCapture,
  toOfficialProcessSlot,
  type OfficialArm,
  type OfficialObservationPair,
} from "./contracts.ts";
import { OfficialCreateOnceRunWriter } from "./writer.ts";

const ARMS = ["status-quo", "beyondgreen"] as const;

export type OfficialArmHookResult = Readonly<{
  decision: unknown;
  reasoningInvocationCount: 0 | 1;
  retryCount: 0;
}>;

export type OfficialExecutionHooks = Readonly<{
  staticPreflight(repositoryRoot: string): OfficialStaticPreflightResult | Promise<OfficialStaticPreflightResult>;
  hashCandidate(slot: OfficialExecutionSlot): string | Promise<string>;
  executeArm(input: Readonly<{
    slot: OfficialExecutionSlot;
    processSlot: OfficialProcessSlot;
    arm: OfficialArm;
    inputSha256: string;
    attemptOrdinal: 1;
  }>): OfficialArmHookResult | Promise<OfficialArmHookResult>;
  captureObservation(input: Readonly<{
    executionSlot: OfficialExecutionSlot;
    slot: OfficialProcessSlot;
    arm: OfficialArm;
    decisions: readonly [OfficialImmutableArmDecision, OfficialImmutableArmDecision];
    scenario: OfficialNeutralScenarioEnvelope;
    captureOrdinal: 1 | 2;
  }>): unknown | Promise<unknown>;
  releaseNeutralScenario(input: Readonly<{
    executionSlot: OfficialExecutionSlot;
    slot: OfficialProcessSlot;
    decisions: readonly OfficialImmutableArmDecision[];
  }>): unknown | Promise<unknown>;
  beginPostDecisionEvaluation(input: Readonly<{
    decisions: readonly OfficialImmutableArmDecision[];
    pairs: readonly OfficialObservationPair[];
    syntheticOnly: boolean;
  }>): Readonly<{unblindingPerformed: boolean}> | Promise<Readonly<{unblindingPerformed: boolean}>>;
  evaluate(input: Readonly<{
    executionSlot: OfficialExecutionSlot;
    slot: OfficialProcessSlot;
    arm: OfficialArm;
    decisions: readonly [OfficialImmutableArmDecision, OfficialImmutableArmDecision];
    observationPair: OfficialObservationPair;
  }>): unknown | Promise<unknown>;
}>;

export type OfficialExecutionResult = Readonly<{
  schemaVersion: "beyondgreen-official-execution-result@1.0.0";
  decisions: readonly OfficialImmutableArmDecision[];
  captureRecords: readonly unknown[];
  observationPairs: readonly OfficialObservationPair[];
  records: readonly OfficialScoredRecord[];
  replay: OfficialReplayBundle;
  replayDigestMatched: true;
  slotCount: 20;
  armPlanCount: 40;
  captureRecordCount: 80;
  finalizedPairCount: 40;
  syntheticOnly: boolean;
  officialOrScoredRun: boolean;
  unblindingPerformed: boolean;
}>;

function assertPlan(preflight: OfficialStaticPreflightResult): void {
  const plan = preflight.executionPlan;
  if (preflight.fixtureCount !== 10 || preflight.candidateCount !== 20
    || plan.slotCount !== 20 || plan.armsPerSlot !== 2 || plan.totalArmPlans !== 40
    || plan.slots.length !== 20 || !Object.isFrozen(plan) || !Object.isFrozen(plan.slots)
    || plan.slots.some((slot) => !Object.isFrozen(slot) || !Object.isFrozen(slot.candidate) || !Object.isFrozen(slot.arms))) {
    throw new Error("Official execution requires the deeply immutable static 20-slot/40-arm plan.");
  }
}

function assertDecisionBinding(
  decision: OfficialImmutableArmDecision,
  processSlot: OfficialProcessSlot,
  arm: OfficialArm,
): void {
  if (decision.slot.slotId !== processSlot.slotId || decision.slot.candidateSha256 !== processSlot.candidateSha256
    || decision.arm !== arm || decision.inputSha256 !== processSlot.candidateSha256 || !decision.immutable) {
    throw new Error("Official arm decision is not bound to the immutable slot, input, and arm.");
  }
}

/**
 * Execute the complete official ordering through explicit injected role hooks. Tests
 * use synthetic hooks; the official composition root supplies repository processes.
 */
export async function executeOfficialEvaluation(input: Readonly<{
  repositoryRoot: string;
  outputRoot: string;
  hooks: OfficialExecutionHooks;
  syntheticOnly: boolean;
  provenance: unknown;
}>): Promise<OfficialExecutionResult> {
  const preflight = await input.hooks.staticPreflight(input.repositoryRoot);
  assertPlan(preflight);
  const plan = preflight.executionPlan;
  const writer = new OfficialCreateOnceRunWriter(input.repositoryRoot, input.outputRoot);
  writer.initialize({ preflight, plan, provenance: input.provenance, syntheticOnly: input.syntheticOnly });

  const decisions: OfficialImmutableArmDecision[] = [];
  const decisionsBySlot = new Map<string, readonly [OfficialImmutableArmDecision, OfficialImmutableArmDecision]>();
  for (const slot of plan.slots) {
    const processSlot = toOfficialProcessSlot(slot);
    const slotDecisions: OfficialImmutableArmDecision[] = [];
    for (const arm of ARMS) {
      const before = await input.hooks.hashCandidate(slot);
      if (before !== slot.candidate.sha256) throw new Error("Candidate hash mismatch before arm execution.");
      const result = await input.hooks.executeArm({
        slot,
        processSlot,
        arm,
        inputSha256: slot.candidate.sha256,
        attemptOrdinal: 1,
      });
      const expectedInvocations = arm === "status-quo" ? 0 : 1;
      if (result.reasoningInvocationCount !== expectedInvocations || result.retryCount !== 0) {
        throw new Error("Frozen reasoning invocation and zero-retry policy mismatch.");
      }
      const decision = parseOfficialArmDecision(result.decision);
      assertDecisionBinding(decision, processSlot, arm);
      const after = await input.hooks.hashCandidate(slot);
      if (after !== before) throw new Error("Candidate hash changed during arm execution.");
      writer.writeArmRecord({
        ordinal: slot.ordinal,
        arm,
        decision,
        candidateSha256Before: before,
        candidateSha256After: after,
        reasoningInvocationCount: result.reasoningInvocationCount,
        retryCount: result.retryCount,
      });
      slotDecisions.push(decision);
      decisions.push(decision);
    }
    decisionsBySlot.set(slot.slotId, Object.freeze([
      slotDecisions[0]!,
      slotDecisions[1]!,
    ]) as readonly [OfficialImmutableArmDecision, OfficialImmutableArmDecision]);
  }
  if (decisions.length !== 40 || !decisions.every((decision) => Object.isFrozen(decision) && decision.immutable)) {
    throw new Error("All 40 arm decisions must be immutable before observation.");
  }

  const evaluationGate = await input.hooks.beginPostDecisionEvaluation({
    decisions: Object.freeze([...decisions]),
    pairs: Object.freeze([]),
    syntheticOnly: input.syntheticOnly,
  });
  if (input.syntheticOnly ? evaluationGate.unblindingPerformed : !evaluationGate.unblindingPerformed) {
    throw new Error("Post-decision unblinding state does not match execution mode.");
  }

  const scenariosBySlot = new Map<string, OfficialNeutralScenarioEnvelope>();
  for (const slot of plan.slots) {
    const processSlot = toOfficialProcessSlot(slot);
    const scenario = parseOfficialNeutralScenario(await input.hooks.releaseNeutralScenario({
      executionSlot: slot,
      slot: processSlot,
      decisions: Object.freeze([...decisions]),
    }));
    if (scenario.slot.slotId !== processSlot.slotId
      || scenario.decisionSetSha256 !== sha256CanonicalJson(decisions)) {
      throw new Error("Neutral scenario is not bound to the immutable global decision set and slot.");
    }
    scenariosBySlot.set(slot.slotId, scenario);
  }

  const captureRecords: unknown[] = [];
  const pairs: OfficialObservationPair[] = [];
  for (const slot of plan.slots) {
    const processSlot = toOfficialProcessSlot(slot);
    const slotDecisions = decisionsBySlot.get(slot.slotId)!;
    const scenario = scenariosBySlot.get(slot.slotId)!;
    for (const [armIndex, arm] of ARMS.entries()) {
      const captures: unknown[] = [];
      for (const captureOrdinal of [1, 2] as const) {
        const capture = await input.hooks.captureObservation({
          executionSlot: slot,
          slot: processSlot,
          arm,
          decisions: slotDecisions,
          scenario,
          captureOrdinal,
        });
        // Undefined is the only missing-record sentinel; every other value must
        // pass the strict capture schema during pair finalization.
        if (capture !== undefined) captures.push(capture);
      }
      const pair = finalizeOfficialObservationPair({
        slot: processSlot,
        arm,
        decision: slotDecisions[armIndex]!,
        captures,
      });
      writer.writeObservationPair(slot.ordinal, pair);
      captureRecords.push(
        parseOfficialObserverCapture(pair.captures[0]),
        parseOfficialObserverCapture(pair.captures[1]),
      );
      pairs.push(pair);
    }
  }
  if (captureRecords.length !== 80 || pairs.length !== 40 || !pairs.every(Object.isFrozen)) {
    throw new Error("Official observation cardinality must be 80 captures and 40 immutable pairs.");
  }

  const records: OfficialScoredRecord[] = [];
  for (const slot of plan.slots) {
    const processSlot = toOfficialProcessSlot(slot);
    const slotDecisions = decisionsBySlot.get(slot.slotId)!;
    for (const arm of ARMS) {
      const pair = pairs.find((entry) => entry.slot.slotId === slot.slotId && entry.arm === arm)!;
      const record = Object.freeze(OfficialScoredRecordSchema.parse(await input.hooks.evaluate({
        executionSlot: slot,
        slot: processSlot,
        arm,
        decisions: slotDecisions,
        observationPair: pair,
      })));
      if (record.fixtureId !== slot.fixtureId || record.candidateId !== slot.candidateId || record.arm !== arm) {
        throw new Error("Evaluator record is bound to the wrong slot or arm.");
      }
      writer.writeEvaluatorRecord(slot.ordinal, record);
      records.push(record);
    }
  }
  const replay = createOfficialReplayBundle(Object.freeze(records));
  const reproduced = replayOfficialBundle(replay);
  if (reproduced.evidenceSha256 !== replay.evidenceSha256
    || reproduced.reportJson !== replay.reportJson || reproduced.reportHtml !== replay.reportHtml) {
    throw new Error("Official replay/report digest mismatch.");
  }
  writer.finalize({ replay, records: Object.freeze(records) });
  return Object.freeze({
    schemaVersion: "beyondgreen-official-execution-result@1.0.0",
    decisions: Object.freeze(decisions),
    captureRecords: Object.freeze(captureRecords),
    observationPairs: Object.freeze(pairs),
    records: Object.freeze(records),
    replay,
    replayDigestMatched: true,
    slotCount: 20,
    armPlanCount: 40,
    captureRecordCount: 80,
    finalizedPairCount: 40,
    syntheticOnly: input.syntheticOnly,
    officialOrScoredRun: !input.syntheticOnly,
    unblindingPerformed: evaluationGate.unblindingPerformed,
  });
}
