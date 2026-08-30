import { z } from "zod";
import { AssertionError } from "node:assert";

import {
  assertDerivedStateOracle,
  type OraclePlanner,
  type OraclePlannerConstructor,
} from "../../../evaluation/verifier-only/BG-D03/oracle-assertions.ts";

const SnapshotSchema = z.object({
  selected: z.array(z.object({ varietyId: z.string().min(1), packetCount: z.number().int().positive() }).strict()).readonly(),
  occupiedCells: z.number().int(),
  remainingCells: z.number().int(),
  overCapacity: z.boolean(),
}).strict();

const TranscriptSchema = z.object({
  schemaVersion: z.literal("beyondgreen-bg-d03-observation-transcript@1.0.0"),
  fixtureId: z.literal("BG-D03"),
  candidateId: z.string().min(1),
  finalizedDecisions: z.array(z.object({
    arm: z.enum(["status-quo", "beyondgreen"]),
    decisionSha256: z.string().regex(/^[a-f0-9]{64}$/u),
    immutable: z.literal(true),
  }).strict()).length(2).readonly(),
  constructorInput: z.object({
    capacity: z.number().int().positive(),
    varieties: z.array(z.object({
      id: z.string().min(1), label: z.string().min(1), cellsPerPacket: z.number().int().positive(),
    }).strict()).min(1).readonly(),
  }).strict(),
  frames: z.tuple([
    z.object({ operation: z.literal("initial"), arguments: z.tuple([]), result: z.null(), snapshot: SnapshotSchema }).strict(),
    z.object({ operation: z.literal("add"), arguments: z.tuple([z.string().min(1)]), result: z.boolean(), snapshot: SnapshotSchema }).strict(),
    z.object({ operation: z.literal("set_packet_count"), arguments: z.tuple([z.string().min(1), z.number().int().positive()]), result: z.boolean(), snapshot: SnapshotSchema }).strict(),
  ]).readonly(),
}).strict().superRefine((transcript, context) => {
  if (new Set(transcript.finalizedDecisions.map(({ arm }) => arm)).size !== 2) {
    context.addIssue({ code: "custom", path: ["finalizedDecisions"], message: "Both immutable arm decisions are required." });
  }
});

export type BGD03EvaluatorResult = Readonly<{
  accepted: boolean;
  behaviorClass: "derived_state";
  reasonCorrectReject: boolean;
  violatedInvariantFamily: "derived_state" | null;
}>;

function equal(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

/** Create a verifier-owned class that replays immutable observations, never candidate code. */
export function createTranscriptBackedPlanner(input: unknown): OraclePlannerConstructor {
  const transcript = TranscriptSchema.parse(input);
  return class TranscriptBackedTrayPlanner implements OraclePlanner {
    private cursor = 0;

    constructor(capacity: number, varieties: readonly Readonly<{id: string; label: string; cellsPerPacket: number}>[]) {
      if (capacity !== transcript.constructorInput.capacity || !equal(varieties, transcript.constructorInput.varieties)) {
        throw new Error("Oracle constructor input does not match the immutable transcript.");
      }
    }

    get snapshot(): OraclePlanner["snapshot"] {
      return transcript.frames[this.cursor]!.snapshot;
    }

    add(varietyId: string): boolean {
      const frame = transcript.frames[1];
      if (this.cursor !== 0 || frame.arguments[0] !== varietyId) throw new Error("Transcript add operation mismatch.");
      this.cursor = 1;
      return frame.result;
    }

    setPacketCount(varietyId: string, packetCount: number): boolean {
      const frame = transcript.frames[2];
      if (this.cursor !== 1 || frame.arguments[0] !== varietyId || frame.arguments[1] !== packetCount) {
        throw new Error("Transcript packet-count operation mismatch.");
      }
      this.cursor = 2;
      return frame.result;
    }
  };
}

/** Apply the unchanged verifier oracle to transcript replay and return a reason-correct result. */
export function evaluateBGD03ObservationTranscript(input: unknown): BGD03EvaluatorResult {
  const ReplayPlanner = createTranscriptBackedPlanner(input);
  try {
    assertDerivedStateOracle(ReplayPlanner);
    return Object.freeze({
      accepted: true,
      behaviorClass: "derived_state",
      reasonCorrectReject: false,
      violatedInvariantFamily: null,
    });
  }
  catch (error) {
    if (!(error instanceof AssertionError)) throw error;
    return Object.freeze({
      accepted: false,
      behaviorClass: "derived_state",
      reasonCorrectReject: true,
      violatedInvariantFamily: "derived_state",
    });
  }
}
