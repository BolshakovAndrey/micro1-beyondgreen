/** Creates descriptor-owned primitive schemas while requiring fixture observations explicitly. */
import { z } from "zod";

/** Provides only descriptor fields required to construct reusable primitive schemas. */
export type FixtureSchemaDescriptor = Readonly<{
  fixtureId: string;
  candidateIds: readonly [string, ...string[]];
  armVisible: Readonly<{ visibleAssertionIds: readonly string[] }>;
  engine: Readonly<{
    armIds: readonly ["status-quo", "beyondgreen"];
    riskCategories: readonly [string, ...string[]];
    observationItemCount: number;
    observationRecordCount: number;
    replayRecordTypes: readonly ["header", "reasoning_request", "reasoning_response", "footer"];
  }>;
}>;

/** Create descriptor-owned primitive schemas while requiring fixture observations as an explicit injection. */
export function createFixtureSchemaPrimitives<
  const Descriptor extends FixtureSchemaDescriptor,
  const ObservationSchema extends z.ZodType,
>(descriptor: Descriptor, observationSchema: ObservationSchema) {
  const CandidateIdSchema = z.enum(descriptor.candidateIds);
  const RiskCategorySchema = z.enum(descriptor.engine.riskCategories);
  const VisibleTestIdsSchema = z.array(z.string().min(1))
    .length(descriptor.armVisible.visibleAssertionIds.length)
    .superRefine((value, context) => {
      if (value.some((id, index) => id !== descriptor.armVisible.visibleAssertionIds[index])) {
        context.addIssue({ code: "custom", message: "Visible-test identifiers do not match descriptor order." });
      }
    });
  return Object.freeze({
    fixtureId: descriptor.fixtureId,
    candidateIds: Object.freeze([...descriptor.candidateIds]),
    armIds: Object.freeze([...descriptor.engine.armIds]),
    riskCategories: Object.freeze([...descriptor.engine.riskCategories]),
    observationItemCount: descriptor.engine.observationItemCount,
    observationRecordCount: descriptor.engine.observationRecordCount,
    replayRecordTypes: Object.freeze([...descriptor.engine.replayRecordTypes]),
    CandidateIdSchema,
    RiskCategorySchema,
    VisibleTestIdsSchema,
    ObservationSchema: observationSchema,
  });
}
