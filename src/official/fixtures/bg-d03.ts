import { defineOfficialFixtureAdapter } from "../worker-contract.ts";
import { z } from "zod";

const BGD03SnapshotSchema = z.object({
  selected: z.array(z.object({ varietyId: z.string().min(1), packetCount: z.number().int().positive() }).strict()).readonly(),
  occupiedCells: z.number().int(),
  remainingCells: z.number().int(),
  overCapacity: z.boolean(),
}).strict();

const BGD03TranscriptSchema = z.object({
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
      id: z.string().min(1),
      label: z.string().min(1),
      cellsPerPacket: z.number().int().positive(),
    }).strict()).min(1).readonly(),
  }).strict(),
  frames: z.array(z.object({
    operation: z.enum(["initial", "add", "set_packet_count"]),
    arguments: z.array(z.union([z.string(), z.number()])).readonly(),
    result: z.boolean().nullable(),
    snapshot: BGD03SnapshotSchema,
  }).strict()).length(3).readonly(),
}).strict().superRefine((transcript, context) => {
  if (new Set(transcript.finalizedDecisions.map(({ arm }) => arm)).size !== 2) {
    context.addIssue({ code: "custom", path: ["finalizedDecisions"], message: "Both immutable arm decisions are required." });
  }
  const operations = transcript.frames.map(({ operation }) => operation);
  if (operations.join(",") !== "initial,add,set_packet_count") {
    context.addIssue({ code: "custom", path: ["frames"], message: "D03 transcript operations are incomplete or out of order." });
  }
});

export type BGD03ObservationTranscript = z.infer<typeof BGD03TranscriptSchema>;

/** Public constructor data mirrored from the frozen arm-visible D03 legacy scenario. */
export function createBGD03ConstructorArguments(): readonly [
  number,
  readonly Readonly<{id: string; label: string; cellsPerPacket: number}>[],
] {
  return [8, Object.freeze([
    Object.freeze({ id: "basil", label: "Basil", cellsPerPacket: 2 }),
    Object.freeze({ id: "marigold", label: "Marigold", cellsPerPacket: 3 }),
  ])];
}

/** Freeze neutral post-decision observations without importing or constructing a candidate. */
export function captureBGD03ObservationTranscript(input: unknown): BGD03ObservationTranscript {
  const transcript = BGD03TranscriptSchema.parse(input);
  return Object.freeze({
    ...transcript,
    finalizedDecisions: Object.freeze([...transcript.finalizedDecisions]),
    constructorInput: Object.freeze({
      ...transcript.constructorInput,
      varieties: Object.freeze([...transcript.constructorInput.varieties]),
    }),
    frames: Object.freeze(transcript.frames.map((frame) => Object.freeze({
      ...frame,
      arguments: Object.freeze([...frame.arguments]),
      snapshot: Object.freeze({
        ...frame.snapshot,
        selected: Object.freeze([...frame.snapshot.selected]),
      }),
    }))),
  });
}

/** Explicit public symbols compensate for D03's class API and absent mount harness. */
export const BG_D03_ARM_VISIBLE_ACTIONS = Object.freeze(["add", "setPacketCount", "remove", "reset"]);
export const BG_D03_ARM_VISIBLE_OBSERVATIONS = Object.freeze([
  "snapshot.selected", "snapshot.occupiedCells", "snapshot.remainingCells", "snapshot.overCapacity",
]);
export const BG_D03_VISIBLE_ASSERTIONS = Object.freeze(["BG-D03-LEGACY-VISIBLE-BEHAVIOR"]);

const adapterModule = "src/official/fixtures/bg-d03.ts";
const contractModule = "evaluation/arm-visible/BG-D03/contract.ts";

/** Static official adapter for the frozen class-based BG-D03 fixture. */
export const BG_D03_OFFICIAL_ADAPTER = defineOfficialFixtureAdapter({
  fixtureId: "BG-D03",
  membership: "development",
  behaviorClass: "derived_state",
  candidates: ["candidate-a", "candidate-b"].map((candidateId) => {
    const modulePath = `candidates/BG-D03/${candidateId}/TrayPlanner.ts`;
    const candidateModule = { modulePath, exportName: "TrayPlanner", symbolKind: "runtime" } as const;
    return {
      candidateId,
      module: candidateModule,
      construction: {
        kind: "class_constructor",
        binding: candidateModule,
        argumentsFactory: {
          modulePath: adapterModule,
          exportName: "createBGD03ConstructorArguments",
          symbolKind: "runtime",
        },
      },
    };
  }),
  armVisible: {
    rootPath: "evaluation/arm-visible/BG-D03",
    contracts: [{
      binding: { modulePath: contractModule, exportName: "BG_D03_VISIBLE_CONTRACT", symbolKind: "runtime" },
      names: ["BG_D03_VISIBLE_CONTRACT"],
    }],
    invariants: [{
      binding: { modulePath: contractModule, exportName: "BG_D03_VISIBLE_CONTRACT", symbolKind: "runtime" },
      names: ["selection_order", "invalid_action_stability", "reset_empty_selection"],
    }],
    actions: [{
      binding: { modulePath: adapterModule, exportName: "BG_D03_ARM_VISIBLE_ACTIONS", symbolKind: "runtime" },
      names: ["add", "setPacketCount", "remove", "reset"],
    }],
    observations: [{
      binding: { modulePath: adapterModule, exportName: "BG_D03_ARM_VISIBLE_OBSERVATIONS", symbolKind: "runtime" },
      names: ["snapshot.selected", "snapshot.occupiedCells", "snapshot.remainingCells", "snapshot.overCapacity"],
    }],
    visibleAssertions: [{
      binding: { modulePath: adapterModule, exportName: "BG_D03_VISIBLE_ASSERTIONS", symbolKind: "runtime" },
      names: ["BG-D03-LEGACY-VISIBLE-BEHAVIOR"],
    }],
  },
  verifierOnlyRoot: "evaluation/verifier-only/BG-D03",
  observerEntrypoint: {
    modulePath: adapterModule,
    exportName: "captureBGD03ObservationTranscript",
    symbolKind: "runtime",
  },
  evaluatorEntrypoint: {
    modulePath: "src/official/evaluator-only/bg-d03.ts",
    exportName: "evaluateBGD03ObservationTranscript",
    symbolKind: "runtime",
  },
});
