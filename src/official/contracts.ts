import path from "node:path";

import { z } from "zod";

const FixtureIdSchema = z.enum([
  "BG-D02", "BG-D03", "BG-D04",
  "BG-H01", "BG-H02", "BG-H03", "BG-H04", "BG-H05", "BG-H06",
]);

const RepositoryRelativePathSchema = z.string().min(1).superRefine((value, context) => {
  const segments = value.split("/");
  if (path.posix.isAbsolute(value) || /^[A-Za-z]:[\\/]/u.test(value) || value.includes("\\")
    || value.includes("\0") || segments.some((segment) => segment === "" || segment === "." || segment === "..")) {
    context.addIssue({ code: "custom", message: "Path must be canonical and repository relative." });
  }
});

const ExportNameSchema = z.string().regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/u);

/** Explicitly names one runtime or type-only module export without importing it. */
export const ExplicitExportBindingSchema = z.object({
  modulePath: RepositoryRelativePathSchema,
  exportName: ExportNameSchema,
  symbolKind: z.enum(["runtime", "type"]),
}).strict();
export type ExplicitExportBinding = z.infer<typeof ExplicitExportBindingSchema>;

const RuntimeBindingSchema = ExplicitExportBindingSchema.extend({
  symbolKind: z.literal("runtime"),
}).strict();

const ConstructionBindingSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("mount_function"),
    binding: RuntimeBindingSchema,
    candidateArgument: z.literal("component_export"),
  }).strict(),
  z.object({
    kind: z.literal("class_constructor"),
    binding: RuntimeBindingSchema,
    argumentsFactory: RuntimeBindingSchema,
  }).strict(),
]);

const CandidateBindingSchema = z.object({
  candidateId: z.string().min(1),
  module: RuntimeBindingSchema,
  construction: ConstructionBindingSchema,
}).strict();

const NamedSurfaceSchema = z.object({
  binding: ExplicitExportBindingSchema,
  names: z.array(z.string().min(1)).min(1).readonly(),
}).strict();

/** Complete arm-visible surface that a fixture adapter must name without inference. */
export const ArmVisibleSurfaceSchema = z.object({
  rootPath: RepositoryRelativePathSchema,
  contracts: z.array(NamedSurfaceSchema).min(1).readonly(),
  invariants: z.array(NamedSurfaceSchema).min(1).readonly(),
  actions: z.array(NamedSurfaceSchema).min(1).readonly(),
  observations: z.array(NamedSurfaceSchema).min(1).readonly(),
  visibleAssertions: z.array(NamedSurfaceSchema).min(1).readonly(),
}).strict();
export type ArmVisibleSurface = z.infer<typeof ArmVisibleSurfaceSchema>;

/** Fully explicit, pre-unblinding descriptor for one frozen non-D01 fixture. */
export const OfficialFixtureDescriptorSchema = z.object({
  fixtureId: FixtureIdSchema,
  membership: z.enum(["development", "held_out"]),
  behaviorClass: z.enum([
    "queued_batched_updates", "derived_state", "subscription_cleanup", "prop_reset",
    "async_ordering", "identity_stability", "conditional_lifecycle", "external_store", "rollback",
  ]),
  candidates: z.array(CandidateBindingSchema).length(2).readonly(),
  armVisible: ArmVisibleSurfaceSchema,
  verifierOnlyRoot: RepositoryRelativePathSchema,
  observerEntrypoint: RuntimeBindingSchema,
  evaluatorEntrypoint: RuntimeBindingSchema,
}).strict().superRefine((descriptor, context) => {
  const candidateIds = descriptor.candidates.map(({ candidateId }) => candidateId);
  if (new Set(candidateIds).size !== candidateIds.length) {
    context.addIssue({ code: "custom", path: ["candidates"], message: "Candidate ids must be explicit and unique." });
  }
  for (const [index, candidate] of descriptor.candidates.entries()) {
    if (candidate.construction.kind === "class_constructor"
      && (candidate.construction.binding.modulePath !== candidate.module.modulePath
        || candidate.construction.binding.exportName !== candidate.module.exportName)) {
      context.addIssue({
        code: "custom",
        path: ["candidates", index, "construction", "binding"],
        message: "Class-constructor binding must exactly identify the explicit candidate export.",
      });
    }
  }
});
export type OfficialFixtureDescriptor = z.infer<typeof OfficialFixtureDescriptorSchema>;

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

/** Validate and freeze a fixture descriptor before it reaches any role factory. */
export function defineOfficialFixtureDescriptor(input: unknown): OfficialFixtureDescriptor {
  return deepFreeze(OfficialFixtureDescriptorSchema.parse(input));
}

/** Resolve one candidate only by its explicit descriptor id. */
export function officialCandidate(
  descriptor: OfficialFixtureDescriptor,
  candidateId: string,
): OfficialFixtureDescriptor["candidates"][number] {
  const candidate = descriptor.candidates.find((entry) => entry.candidateId === candidateId);
  if (!candidate) throw new Error(`Unknown explicit candidate id ${candidateId} for ${descriptor.fixtureId}.`);
  return candidate;
}
