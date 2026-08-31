import { OfficialScoredRecordSchema } from "../aggregation.ts";
import { sha256CanonicalJson } from "../process/ipc.ts";
import {
  finalizeOfficialObservationPair,
  parseOfficialNeutralScenario,
  parseOfficialObserverCapture,
  toOfficialProcessSlot,
} from "./contracts.ts";
import type { OfficialExecutionHooks } from "./coordinator.ts";
import type { OfficialPostDecisionRecoverySource } from "./post-decision-recovery.ts";

const ARMS = ["status-quo", "beyondgreen"] as const;

export type OfficialEvaluatorRehearsalResult = Readonly<{
  schemaVersion: "beyondgreen-official-evaluator-rehearsal@1.0.0";
  slotCount: 20;
  scenarioCount: 20;
  captureCount: 80;
  pairCount: 40;
  evaluatorRecordCount: 40;
  schemaValidRecordCount: 40;
  frozenGroundTruthMatchCount: 40;
  armExecutionCount: 0;
  modelInvocationCount: 0;
  recordDigest: string;
}>;

/**
 * Exercise the complete production post-decision path without evidence writes.
 * Frozen ground truth is used only as a fail-closed acceptance check after every
 * observer and evaluator result has already been constructed.
 */
export async function executeOfficialEvaluatorRehearsal(input: Readonly<{
  source: OfficialPostDecisionRecoverySource;
  hooks: OfficialExecutionHooks;
  expectedGroundTruth(fixtureId: string, candidateId: string): "preserving" | "false_green";
}>): Promise<OfficialEvaluatorRehearsalResult> {
  const { source, hooks } = input;
  const gate = await hooks.beginPostDecisionEvaluation({
    decisions: source.decisions,
    pairs: Object.freeze([]),
    syntheticOnly: false,
  });
  if (!gate.unblindingPerformed) throw new Error("Evaluator rehearsal requires the approved post-decision gate.");

  let scenarioCount = 0;
  let captureCount = 0;
  let pairCount = 0;
  let frozenGroundTruthMatchCount = 0;
  const recordDigests: string[] = [];
  for (const executionSlot of source.plan.slots) {
    const slot = toOfficialProcessSlot(executionSlot);
    const decisions = source.decisions.filter(({ slot: selected }) => selected.slotId === slot.slotId);
    if (decisions.length !== 2 || decisions[0]?.arm !== "status-quo" || decisions[1]?.arm !== "beyondgreen") {
      throw new Error("Evaluator rehearsal requires the ordered frozen decision pair.");
    }
    const decisionPair = Object.freeze([decisions[0], decisions[1]] as const);
    const scenario = parseOfficialNeutralScenario(await hooks.releaseNeutralScenario({
      executionSlot,
      slot,
      decisions: source.decisions,
    }));
    if (scenario.slot.slotId !== slot.slotId
      || scenario.decisionSetSha256 !== sha256CanonicalJson(source.decisions)) {
      throw new Error("Evaluator rehearsal scenario is not bound to RUN-002 decisions.");
    }
    scenarioCount += 1;

    for (const [armIndex, arm] of ARMS.entries()) {
      const captures = [];
      for (const captureOrdinal of [1, 2] as const) {
        captures.push(parseOfficialObserverCapture(await hooks.captureObservation({
          executionSlot,
          slot,
          arm,
          decisions: decisionPair,
          scenario,
          captureOrdinal,
        })));
        captureCount += 1;
      }
      const observationPair = finalizeOfficialObservationPair({
        slot,
        arm,
        decision: decisionPair[armIndex],
        captures,
      });
      pairCount += 1;
      const record = OfficialScoredRecordSchema.parse(await hooks.evaluate({
        executionSlot,
        slot,
        arm,
        decisions: decisionPair,
        observationPair,
      }));
      if (record.fixtureId !== slot.fixtureId || record.candidateId !== slot.candidateId
        || record.arm !== arm || record.schemaValidCompleteReport !== true) {
        throw new Error("Evaluator rehearsal produced an incomplete or misbound record.");
      }
      const expected = input.expectedGroundTruth(slot.fixtureId, slot.candidateId);
      if (record.groundTruth !== expected) {
        throw new Error(`Frozen ground-truth mismatch for ${slot.slotId}; verifier tuning is forbidden.`);
      }
      frozenGroundTruthMatchCount += 1;
      recordDigests.push(sha256CanonicalJson(record));
    }
  }

  if (scenarioCount !== 20 || captureCount !== 80 || pairCount !== 40
    || recordDigests.length !== 40 || frozenGroundTruthMatchCount !== 40) {
    throw new Error("Evaluator rehearsal did not complete the exact 20/80/40 cardinality.");
  }
  return Object.freeze({
    schemaVersion: "beyondgreen-official-evaluator-rehearsal@1.0.0",
    slotCount: 20,
    scenarioCount: 20,
    captureCount: 80,
    pairCount: 40,
    evaluatorRecordCount: 40,
    schemaValidRecordCount: 40,
    frozenGroundTruthMatchCount: 40,
    armExecutionCount: 0,
    modelInvocationCount: 0,
    recordDigest: sha256CanonicalJson(recordDigests),
  });
}
