import {
  parseOfficialNeutralScenario,
  parseOfficialObserverCapture,
  toOfficialProcessSlot,
} from "./contracts.ts";
import type { OfficialExecutionHooks } from "./coordinator.ts";
import type { OfficialPostDecisionRecoverySource } from "./post-decision-recovery.ts";
import { sha256CanonicalJson } from "../process/ipc.ts";

const ARMS = ["status-quo", "beyondgreen"] as const;

export type OfficialObserverRehearsalResult = Readonly<{
  schemaVersion: "beyondgreen-official-observer-rehearsal@1.0.0";
  slotCount: 20;
  scenarioCount: 20;
  captureCount: 80;
  armExecutionCount: 0;
  modelInvocationCount: 0;
  evaluatorInvocationCount: 0;
  captureDigest: string;
}>;

/**
 * Exercise the production scenario-provider and observer boundaries for every frozen
 * slot without invoking arms, models, evaluators, or writing official evidence.
 */
export async function executeOfficialObserverRehearsal(input: Readonly<{
  source: OfficialPostDecisionRecoverySource;
  hooks: OfficialExecutionHooks;
}>): Promise<OfficialObserverRehearsalResult> {
  const { source, hooks } = input;
  const gate = await hooks.beginPostDecisionEvaluation({
    decisions: source.decisions,
    pairs: Object.freeze([]),
    syntheticOnly: false,
  });
  if (!gate.unblindingPerformed) throw new Error("Observer rehearsal requires the approved post-decision gate.");

  const captures: string[] = [];
  let scenarioCount = 0;
  for (const executionSlot of source.plan.slots) {
    const slot = toOfficialProcessSlot(executionSlot);
    const decisions = source.decisions.filter(({ slot: selected }) => selected.slotId === slot.slotId);
    if (decisions.length !== 2 || decisions[0]?.arm !== "status-quo" || decisions[1]?.arm !== "beyondgreen") {
      throw new Error("Observer rehearsal requires the ordered frozen decision pair.");
    }
    const pair = Object.freeze([decisions[0]!, decisions[1]!] as const);
    const scenario = parseOfficialNeutralScenario(await hooks.releaseNeutralScenario({
      executionSlot,
      slot,
      decisions: source.decisions,
    }));
    if (scenario.slot.slotId !== slot.slotId
      || scenario.decisionSetSha256 !== sha256CanonicalJson(source.decisions)) {
      throw new Error("Observer rehearsal scenario is not bound to RUN-002 decisions.");
    }
    scenarioCount += 1;
    for (const arm of ARMS) {
      for (const captureOrdinal of [1, 2] as const) {
        const capture = parseOfficialObserverCapture(await hooks.captureObservation({
          executionSlot,
          slot,
          arm,
          decisions: pair,
          scenario,
          captureOrdinal,
        }));
        captures.push(capture.captureSha256);
      }
    }
  }
  if (scenarioCount !== 20 || captures.length !== 80) {
    throw new Error("Observer rehearsal did not complete the exact 20/80 cardinality.");
  }
  return Object.freeze({
    schemaVersion: "beyondgreen-official-observer-rehearsal@1.0.0",
    slotCount: 20,
    scenarioCount: 20,
    captureCount: 80,
    armExecutionCount: 0,
    modelInvocationCount: 0,
    evaluatorInvocationCount: 0,
    captureDigest: sha256CanonicalJson(captures),
  });
}
