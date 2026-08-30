import { z } from "zod";

import {
  OfficialScoredRecordSchema,
  type OfficialScoredRecord,
} from "./aggregation.ts";
import type { OfficialFixtureDescriptor } from "./contracts.ts";
import {
  createOfficialReplayBundle,
  replayOfficialBundle,
  type OfficialReplayBundle,
} from "./replay.ts";
import {
  createPreUnblindingRunPlan,
  type PreUnblindingRunPlan,
} from "./runner.ts";

const SyntheticDecisionSchema = z.object({
  arm: z.enum(["status-quo", "beyondgreen"]),
  verdict: z.enum(["accept", "reject", "abstain"]),
  rationale: z.string().min(1),
  decisionSha256: z.string().regex(/^[a-f0-9]{64}$/u),
  immutable: z.literal(true),
}).strict();
export type SyntheticDecision = z.infer<typeof SyntheticDecisionSchema>;

const SyntheticObserverCaptureSchema = z.object({
  arm: z.enum(["status-quo", "beyondgreen"]),
  decisionSha256: z.string().regex(/^[a-f0-9]{64}$/u),
  transcriptSha256: z.string().regex(/^[a-f0-9]{64}$/u),
  immutable: z.literal(true),
}).strict();
export type SyntheticObserverCapture = z.infer<typeof SyntheticObserverCaptureSchema>;

export type SyntheticRehearsalHooks = Readonly<{
  executeArm(arm: SyntheticDecision["arm"], plan: PreUnblindingRunPlan): Promise<unknown>;
  captureAfterDecisions(decision: SyntheticDecision, plan: PreUnblindingRunPlan): Promise<unknown>;
  evaluateAfterCapture(input: Readonly<{
    decision: SyntheticDecision;
    capture: SyntheticObserverCapture;
    plan: PreUnblindingRunPlan;
  }>): Promise<unknown>;
}>;

export type SyntheticOfficialRehearsalResult = Readonly<{
  schemaVersion: "beyondgreen-official-synthetic-rehearsal@1.0.0";
  decisions: readonly SyntheticDecision[];
  captures: readonly SyntheticObserverCapture[];
  records: readonly OfficialScoredRecord[];
  replay: OfficialReplayBundle;
  replayDigestMatched: true;
  syntheticOnly: true;
  realCandidateExecution: false;
  officialOrScoredRun: false;
  unblindingPerformed: false;
}>;

function frozenParse<T>(schema: z.ZodType<T>, input: unknown): T {
  return Object.freeze(schema.parse(input)) as T;
}

/**
 * Rehearse the official phase ordering with injected test-only hooks. This function
 * has no module importer, candidate executor, network adapter, or run-record writer.
 */
export async function rehearseSyntheticOfficialRunner(
  descriptor: OfficialFixtureDescriptor,
  candidateId: string,
  hooks: SyntheticRehearsalHooks,
): Promise<SyntheticOfficialRehearsalResult> {
  const plan = createPreUnblindingRunPlan(descriptor, candidateId);
  const arms = ["status-quo", "beyondgreen"] as const;
  const decisions = Object.freeze(await Promise.all(arms.map(async (arm) => {
    const decision = frozenParse(SyntheticDecisionSchema, await hooks.executeArm(arm, plan));
    if (decision.arm !== arm) throw new Error("Synthetic arm decision is bound to the wrong arm.");
    return decision;
  })));
  if (!decisions.every(({ immutable }) => immutable)) throw new Error("Both arm decisions must be immutable before observation.");

  const captures = Object.freeze(await Promise.all(decisions.map(async (decision) => {
    const capture = frozenParse(
      SyntheticObserverCaptureSchema,
      await hooks.captureAfterDecisions(decision, plan),
    );
    if (capture.arm !== decision.arm || capture.decisionSha256 !== decision.decisionSha256) {
      throw new Error("Synthetic observer capture is not bound to its immutable decision.");
    }
    return capture;
  })));

  const records = Object.freeze(await Promise.all(decisions.map(async (decision, index) => {
    const capture = captures[index]!;
    const record = OfficialScoredRecordSchema.parse(await hooks.evaluateAfterCapture({ decision, capture, plan }));
    if (record.arm !== decision.arm || record.fixtureId !== descriptor.fixtureId || record.candidateId !== candidateId) {
      throw new Error("Synthetic evaluator record is not bound to the fixture, candidate, and arm.");
    }
    return Object.freeze(record);
  })));
  const replay = createOfficialReplayBundle(records);
  const reproduced = replayOfficialBundle(replay);
  if (reproduced.evidenceSha256 !== replay.evidenceSha256) throw new Error("Synthetic replay digest mismatch.");
  return Object.freeze({
    schemaVersion: "beyondgreen-official-synthetic-rehearsal@1.0.0",
    decisions,
    captures,
    records,
    replay,
    replayDigestMatched: true,
    syntheticOnly: true,
    realCandidateExecution: false,
    officialOrScoredRun: false,
    unblindingPerformed: false,
  });
}
