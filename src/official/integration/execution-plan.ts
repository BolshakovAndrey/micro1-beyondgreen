import { z } from "zod";

import type { OfficialFrozenInventoryResult } from "../inventory/index.ts";

const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/u);
const FixtureIdSchema = z.string().regex(/^BG-(?:D0[1-4]|H0[1-6])$/u);
const IdentifierSchema = z.string().min(1).max(160).regex(/^[A-Za-z0-9._:-]+$/u);
const BindingSchema = z.object({
  modulePath: z.string().min(1),
  exportName: IdentifierSchema,
}).strict();

export const OfficialExecutionSlotSchema = z.object({
  ordinal: z.number().int().min(1).max(20),
  slotId: IdentifierSchema,
  fixtureId: FixtureIdSchema,
  candidateId: IdentifierSchema,
  candidate: BindingSchema.extend({ sha256: Sha256Schema }).strict(),
  descriptor: BindingSchema,
  membership: z.enum(["development", "held_out"]),
  behaviorClass: IdentifierSchema,
  arms: z.tuple([z.literal("status-quo"), z.literal("beyondgreen")]).readonly(),
  attemptOrdinal: z.literal(1),
  candidateExecutionAllowed: z.literal(false),
  officialOrScoredRun: z.literal(false),
}).strict().superRefine((slot, context) => {
  if (slot.slotId !== `${slot.fixtureId}:${slot.candidateId}`) {
    context.addIssue({ code: "custom", path: ["slotId"], message: "Slot id must bind the explicit fixture and candidate ids." });
  }
});
export type OfficialExecutionSlot = z.infer<typeof OfficialExecutionSlotSchema>;

export const OfficialExecutionPlanSchema = z.object({
  schemaVersion: z.literal("beyondgreen-official-execution-plan@1.0.0"),
  evaluationVersion: z.literal("eval-v1.1.0"),
  inventorySha256: Sha256Schema,
  slotCount: z.literal(20),
  armsPerSlot: z.literal(2),
  totalArmPlans: z.literal(40),
  slots: z.array(OfficialExecutionSlotSchema).length(20).readonly(),
  candidateExecutionAllowed: z.literal(false),
  officialOrScoredRun: z.literal(false),
  unblindingPerformed: z.literal(false),
  runRecordCreated: z.literal(false),
}).strict().superRefine((plan, context) => {
  const slotIds = plan.slots.map(({ slotId }) => slotId);
  const ordinals = plan.slots.map(({ ordinal }) => ordinal);
  if (new Set(slotIds).size !== 20) {
    context.addIssue({ code: "custom", path: ["slots"], message: "Execution plan requires twenty unique slots." });
  }
  if (ordinals.some((ordinal, index) => ordinal !== index + 1)) {
    context.addIssue({ code: "custom", path: ["slots"], message: "Execution slot ordinals must be contiguous and deterministic." });
  }
});
export type OfficialExecutionPlan = z.infer<typeof OfficialExecutionPlanSchema>;

function deepFreeze<T>(value: T, seen = new WeakSet<object>()): T {
  if (value !== null && typeof value === "object") {
    if (seen.has(value)) return value;
    seen.add(value);
    for (const child of Object.values(value)) deepFreeze(child, seen);
    if (!Object.isFrozen(value)) Object.freeze(value);
  }
  return value;
}

/** Build the static 20-slot/two-arm plan without importing or executing candidates. */
export function createOfficialExecutionPlan(inventory: OfficialFrozenInventoryResult): OfficialExecutionPlan {
  if (inventory.fixtureCount !== 10 || inventory.candidateCount !== 20 || inventory.executionSlotCount !== 20
    || inventory.candidateImportsPerformed || inventory.candidateExecutionPerformed || inventory.verifierContentParsed
    || inventory.officialOrScoredRun || inventory.unblindingPerformed) {
    throw new Error("Official execution plan requires a clean static 10x2 inventory.");
  }
  const sorted = [...inventory.slots].sort((left, right) => {
    const leftId = `${left.fixtureId}:${left.candidateId}`;
    const rightId = `${right.fixtureId}:${right.candidateId}`;
    return leftId === rightId ? 0 : leftId < rightId ? -1 : 1;
  });
  const validated = OfficialExecutionPlanSchema.parse({
    schemaVersion: "beyondgreen-official-execution-plan@1.0.0",
    evaluationVersion: "eval-v1.1.0",
    inventorySha256: inventory.inventorySha256,
    slotCount: 20,
    armsPerSlot: 2,
    totalArmPlans: 40,
    slots: sorted.map((slot, index) => ({
      ordinal: index + 1,
      slotId: `${slot.fixtureId}:${slot.candidateId}`,
      fixtureId: slot.fixtureId,
      candidateId: slot.candidateId,
      candidate: { modulePath: slot.modulePath, exportName: slot.exportName, sha256: slot.candidateSha256 },
      descriptor: slot.descriptor,
      membership: slot.membership,
      behaviorClass: slot.behaviorClass,
      arms: ["status-quo", "beyondgreen"],
      attemptOrdinal: 1,
      candidateExecutionAllowed: false,
      officialOrScoredRun: false,
    })),
    candidateExecutionAllowed: false,
    officialOrScoredRun: false,
    unblindingPerformed: false,
    runRecordCreated: false,
  });
  return deepFreeze(validated);
}
