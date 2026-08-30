import { z } from "zod";

export const OfficialScoredRecordSchema = z.object({
  evaluationVersion: z.literal("eval-v1.1.0"),
  fixtureId: z.string().regex(/^BG-[DH]0[1-6]$/u),
  candidateId: z.string().min(1),
  arm: z.enum(["status-quo", "beyondgreen"]),
  verdict: z.enum(["accept", "reject", "abstain"]),
  groundTruth: z.enum(["preserving", "false_green"]),
  reasonCorrectReject: z.boolean(),
  schemaValidCompleteReport: z.boolean(),
}).strict();
export type OfficialScoredRecord = z.infer<typeof OfficialScoredRecordSchema>;

export const ArmAggregateSchema = z.object({
  arm: z.enum(["status-quo", "beyondgreen"]),
  total: z.number().int().positive(),
  correctDecisions: z.number().int().nonnegative(),
  falseGreenTotal: z.number().int().nonnegative(),
  reasonCorrectRejects: z.number().int().nonnegative(),
  preservingTotal: z.number().int().nonnegative(),
  preservingBlocked: z.number().int().nonnegative(),
  completedDecisions: z.number().int().nonnegative(),
}).strict();
export type ArmAggregate = z.infer<typeof ArmAggregateSchema>;

/** Recompute frozen v1.1 numerators from immutable evaluator-scored records. */
export function aggregateOfficialRecords(input: readonly unknown[]): readonly ArmAggregate[] {
  const records = input.map((record) => OfficialScoredRecordSchema.parse(record));
  if (records.length === 0) throw new Error("Official aggregation requires at least one immutable record.");
  const identities = records.map(({ arm, fixtureId, candidateId }) => `${arm}:${fixtureId}:${candidateId}`);
  if (new Set(identities).size !== identities.length) throw new Error("Official records contain duplicate arm/candidate identities.");
  return (["status-quo", "beyondgreen"] as const).flatMap((arm) => {
    const armRecords = records.filter((record) => record.arm === arm);
    if (armRecords.length === 0) return [];
    return [ArmAggregateSchema.parse({
      arm,
      total: armRecords.length,
      correctDecisions: armRecords.filter((record) => (
        (record.verdict === "accept" && record.groundTruth === "preserving")
        || (record.verdict === "reject" && record.groundTruth === "false_green")
      )).length,
      falseGreenTotal: armRecords.filter(({ groundTruth }) => groundTruth === "false_green").length,
      reasonCorrectRejects: armRecords.filter((record) => (
        record.groundTruth === "false_green" && record.verdict === "reject" && record.reasonCorrectReject
      )).length,
      preservingTotal: armRecords.filter(({ groundTruth }) => groundTruth === "preserving").length,
      preservingBlocked: armRecords.filter((record) => (
        record.groundTruth === "preserving" && (record.verdict === "reject" || record.verdict === "abstain")
      )).length,
      completedDecisions: armRecords.filter((record) => (
        record.schemaValidCompleteReport && (record.verdict === "accept" || record.verdict === "reject")
      )).length,
    })];
  });
}
