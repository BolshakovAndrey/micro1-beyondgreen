import { createHash } from "node:crypto";

import { OfficialScoredRecordSchema, type OfficialScoredRecord } from "../aggregation.ts";
import {
  OfficialArmProcessRequestSchema,
  OfficialArmProcessSuccessSchema,
  OfficialEvaluatorProcessRequestSchema,
  OfficialEvaluatorProcessSuccessSchema,
  OfficialObserverProcessRequestSchema,
  OfficialObserverProcessSuccessSchema,
  OfficialProcessSlotSchema,
  type OfficialImmutableArmDecision,
  type OfficialObserverCapture,
  type OfficialProcessSlot,
} from "../process/ipc.ts";
import { createOfficialReplayBundle, replayOfficialBundle, type OfficialReplayBundle } from "../replay.ts";

type Arm = "status-quo" | "beyondgreen";
type Role = "arm" | "observer" | "evaluator";

export type SyntheticOfficialProcessInvoker = (role: Role, request: unknown) => Promise<unknown>;

export type SyntheticMultiProcessPayloads = Readonly<{
  arm(arm: Arm): unknown;
  observer(arm: Arm): unknown;
  evaluator(arm: Arm): unknown;
}>;

export type SyntheticMultiProcessRehearsalResult = Readonly<{
  schemaVersion: "beyondgreen-official-synthetic-multiprocess@1.0.0";
  slot: OfficialProcessSlot;
  decisions: readonly OfficialImmutableArmDecision[];
  captures: readonly OfficialObserverCapture[];
  records: readonly OfficialScoredRecord[];
  replay: OfficialReplayBundle;
  reportJsonSha256: string;
  reportHtmlSha256: string;
  replayDigestMatched: true;
  processesInvoked: 6;
  syntheticOnly: true;
  candidateImportsPerformed: false;
  candidateExecutionPerformed: false;
  officialOrScoredRun: false;
  unblindingPerformed: false;
}>;

const arms = ["status-quo", "beyondgreen"] as const;

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function assertRequestId(expected: string, actual: string): void {
  if (expected !== actual) throw new Error("Synthetic role response is bound to the wrong request.");
}

/**
 * Exercise the official phase ordering through injected test-only process hooks.
 * This composition has no candidate importer, official run writer, or unblinding path.
 */
export async function rehearseSyntheticOfficialMultiProcess(input: Readonly<{
  slot: OfficialProcessSlot;
  inputSha256: string;
  invoke: SyntheticOfficialProcessInvoker;
  payloads: SyntheticMultiProcessPayloads;
}>): Promise<SyntheticMultiProcessRehearsalResult> {
  const slot = OfficialProcessSlotSchema.parse(input.slot);
  const decisions = Object.freeze(await Promise.all(arms.map(async (arm) => {
    const requestId = `synthetic-arm-${arm}`;
    const request = OfficialArmProcessRequestSchema.parse({
      schemaVersion: "beyondgreen-official-process-ipc@1.0.0",
      requestId,
      evaluationVersion: "eval-v1.1.0",
      slot,
      inputSha256: input.inputSha256,
      role: "arm",
      operation: "decide",
      arm,
      attemptOrdinal: 1,
      payload: input.payloads.arm(arm),
    });
    const result = OfficialArmProcessSuccessSchema.parse(await input.invoke("arm", request));
    assertRequestId(requestId, result.requestId);
    return result.decision;
  })));
  if (decisions.length !== 2 || !decisions.every(({ immutable }) => immutable)) {
    throw new Error("Both immutable arm decisions are required before observation.");
  }

  const captures = Object.freeze(await Promise.all(arms.map(async (arm) => {
    const requestId = `synthetic-observer-${arm}`;
    const request = OfficialObserverProcessRequestSchema.parse({
      schemaVersion: "beyondgreen-official-process-ipc@1.0.0",
      requestId,
      evaluationVersion: "eval-v1.1.0",
      slot,
      inputSha256: input.inputSha256,
      role: "observer",
      operation: "capture_after_decisions",
      targetArm: arm,
      decisions,
      payload: input.payloads.observer(arm),
    });
    const result = OfficialObserverProcessSuccessSchema.parse(await input.invoke("observer", request));
    assertRequestId(requestId, result.requestId);
    return result.capture;
  })));

  const records = Object.freeze(await Promise.all(arms.map(async (arm, index) => {
    const requestId = `synthetic-evaluator-${arm}`;
    const capture = captures[index]!;
    const request = OfficialEvaluatorProcessRequestSchema.parse({
      schemaVersion: "beyondgreen-official-process-ipc@1.0.0",
      requestId,
      evaluationVersion: "eval-v1.1.0",
      slot,
      inputSha256: input.inputSha256,
      role: "evaluator",
      operation: "evaluate_after_capture",
      targetArm: arm,
      decisions,
      capture,
      payload: input.payloads.evaluator(arm),
    });
    const result = OfficialEvaluatorProcessSuccessSchema.parse(await input.invoke("evaluator", request));
    assertRequestId(requestId, result.requestId);
    return Object.freeze(OfficialScoredRecordSchema.parse(result.record));
  })));

  const replay = createOfficialReplayBundle(records);
  const reproduced = replayOfficialBundle(replay);
  if (reproduced.evidenceSha256 !== replay.evidenceSha256
    || reproduced.reportJson !== replay.reportJson || reproduced.reportHtml !== replay.reportHtml) {
    throw new Error("Synthetic multi-process replay/report digest mismatch.");
  }
  return Object.freeze({
    schemaVersion: "beyondgreen-official-synthetic-multiprocess@1.0.0",
    slot,
    decisions,
    captures,
    records,
    replay,
    reportJsonSha256: sha256(replay.reportJson),
    reportHtmlSha256: sha256(replay.reportHtml),
    replayDigestMatched: true,
    processesInvoked: 6,
    syntheticOnly: true,
    candidateImportsPerformed: false,
    candidateExecutionPerformed: false,
    officialOrScoredRun: false,
    unblindingPerformed: false,
  });
}
