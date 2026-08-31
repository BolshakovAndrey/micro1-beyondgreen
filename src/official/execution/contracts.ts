import { z } from "zod";

import type { OfficialExecutionSlot } from "../integration/execution-plan.ts";
import {
  OfficialImmutableArmDecisionSchema,
  OfficialNeutralScenarioEnvelopeSchema,
  OfficialObserverCaptureSchema,
  OfficialProcessSlotSchema,
  parseAndFreezeProcessIpc,
  sha256CanonicalJson,
  type OfficialImmutableArmDecision,
  type OfficialNeutralScenarioEnvelope,
  type OfficialObserverCapture,
  type OfficialProcessSlot,
} from "../process/ipc.ts";

const ArmSchema = z.enum(["status-quo", "beyondgreen"]);
const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/u);

const ObservationPairCoreSchema = z.object({
  schemaVersion: z.literal("beyondgreen-official-observation-pair@1.0.0"),
  slot: OfficialProcessSlotSchema,
  arm: ArmSchema,
  decisionSha256: Sha256Schema,
  transcriptSha256: Sha256Schema,
  captures: z.tuple([OfficialObserverCaptureSchema, OfficialObserverCaptureSchema]).readonly(),
  immutable: z.literal(true),
}).strict();

/** Two independently produced, byte-equivalent post-decision captures. */
export const OfficialObservationPairSchema = ObservationPairCoreSchema.extend({
  pairSha256: Sha256Schema,
}).strict().superRefine((pair, context) => {
  for (const [index, capture] of pair.captures.entries()) {
    if (capture.arm !== pair.arm || capture.decisionSha256 !== pair.decisionSha256
      || capture.transcriptSha256 !== pair.transcriptSha256
      || capture.slot.slotId !== pair.slot.slotId
      || capture.slot.candidateSha256 !== pair.slot.candidateSha256) {
      context.addIssue({
        code: "custom",
        path: ["captures", index],
        message: "Each capture must bind the same slot, arm, decision, and transcript.",
      });
    }
  }
  const { pairSha256: _digest, ...core } = pair;
  if (sha256CanonicalJson(core) !== pair.pairSha256) {
    context.addIssue({ code: "custom", path: ["pairSha256"], message: "Observation-pair digest mismatch." });
  }
});
export type OfficialObservationPair = z.infer<typeof OfficialObservationPairSchema>;

export type OfficialArm = z.infer<typeof ArmSchema>;

/** Convert the persisted static slot into the candidate-path-free role identity. */
export function toOfficialProcessSlot(slot: OfficialExecutionSlot): OfficialProcessSlot {
  return parseAndFreezeProcessIpc(OfficialProcessSlotSchema, {
    slotId: slot.slotId,
    fixtureId: slot.fixtureId,
    candidateId: slot.candidateId,
    candidateSha256: slot.candidate.sha256,
  });
}

/** Validate two independent captures and freeze their matching pair. */
export function finalizeOfficialObservationPair(input: Readonly<{
  slot: OfficialProcessSlot;
  arm: OfficialArm;
  decision: OfficialImmutableArmDecision;
  captures: readonly unknown[];
}>): OfficialObservationPair {
  if (input.captures.length !== 2) {
    throw new Error("OBSERVATION_CAPTURE_MISSING: exactly two independent captures are required.");
  }
  let first: OfficialObserverCapture;
  let second: OfficialObserverCapture;
  try {
    first = parseAndFreezeProcessIpc(OfficialObserverCaptureSchema, input.captures[0]);
    second = parseAndFreezeProcessIpc(OfficialObserverCaptureSchema, input.captures[1]);
  } catch {
    throw new Error("OBSERVATION_CAPTURE_MALFORMED: capture schema validation failed.");
  }
  if (first.captureSha256 !== second.captureSha256
    || first.transcriptSha256 !== second.transcriptSha256
    || sha256CanonicalJson(first.transcript) !== sha256CanonicalJson(second.transcript)) {
    throw new Error("OBSERVATION_CAPTURE_DIVERGENCE: independent captures do not match.");
  }
  const core = {
    schemaVersion: "beyondgreen-official-observation-pair@1.0.0" as const,
    slot: input.slot,
    arm: input.arm,
    decisionSha256: input.decision.decisionSha256,
    transcriptSha256: first.transcriptSha256,
    captures: [first, second] as const,
    immutable: true as const,
  };
  return parseAndFreezeProcessIpc(OfficialObservationPairSchema, {
    ...core,
    pairSha256: sha256CanonicalJson(core),
  });
}

/** Strictly parse an arm decision returned by an injected process/runtime hook. */
export function parseOfficialArmDecision(input: unknown): OfficialImmutableArmDecision {
  return parseAndFreezeProcessIpc(OfficialImmutableArmDecisionSchema, input);
}

/** Strictly parse one observer capture before it can enter persisted evidence. */
export function parseOfficialObserverCapture(input: unknown): OfficialObserverCapture {
  return parseAndFreezeProcessIpc(OfficialObserverCaptureSchema, input);
}

/** Strictly parse the only payload allowed to cross verifier-to-observer handoff. */
export function parseOfficialNeutralScenario(input: unknown): OfficialNeutralScenarioEnvelope {
  return parseAndFreezeProcessIpc(OfficialNeutralScenarioEnvelopeSchema, input);
}
