/** Produces deterministic oracle-free probe plans and their replayable reasoning evidence. */
import { ARM_VISIBLE_INVARIANTS } from "../../evaluation/arm-visible/BG-D01/contract.ts";
import { canonicalJson, sha256 } from "./canonical-json.ts";
import { D01_FIXTURE } from "./fixture.ts";
import { buildReasoningReplay, validateReasoningReplay } from "./replay-core.ts";
import { deriveProbePlan } from "./risk.ts";
import {
  ReasoningAdapterInputSchema, ReasoningAdapterOutputSchema, ReasoningEvidenceSchema,
  type ReasoningAdapterInput, type ReasoningAdapterOutput, type ReasoningEvidence,
} from "./schemas.ts";

/** Defines a capability-free reasoning boundary that must emit replayable probe evidence. */
export interface ReasoningAdapter {
  readonly id: string;
  execute(input: ReasoningAdapterInput): Readonly<{
    output: ReasoningAdapterOutput;
    replayJsonl: string;
    evidence: ReasoningEvidence;
  }>;
}

/** Exercise the approved synthetic offline adapter; this is never a live model result. */
export const offlineReasoningAdapter: ReasoningAdapter = Object.freeze({
  id: "offline-replay-jsonl-v1",
  execute(inputValue: ReasoningAdapterInput) {
    const input = ReasoningAdapterInputSchema.parse(inputValue);
    const output = ReasoningAdapterOutputSchema.parse({
      schemaVersion: D01_FIXTURE.schemas.reasoningOutput,
      fixtureId: D01_FIXTURE.fixtureId,
      candidateId: input.candidateId,
      riskInventorySha256: sha256(canonicalJson(input.riskInventory)),
      probePlan: deriveProbePlan(input.riskInventory, ARM_VISIBLE_INVARIANTS),
      evidenceClass: "approved_synthetic_offline",
      liveModelResult: false,
      officialOrScored: false,
    });
    const replay = buildReasoningReplay(input, output);
    const validated = validateReasoningReplay(replay.jsonl, {
      candidateId: input.candidateId,
      candidateSha256: input.candidateSha256,
    });
    return Object.freeze({
      output: validated.output,
      replayJsonl: replay.jsonl,
      evidence: ReasoningEvidenceSchema.parse({
        engine: "deterministic_repository_analyzer",
        adapter: "offline-replay-jsonl-v1",
        modelStatus: "not_applicable_not_invoked",
        liveAdapterStatus: "unverified_unused",
        modelInvocationCount: 0,
        replayIdentity: validated.identity,
        output: validated.output,
      }),
    });
  },
});
