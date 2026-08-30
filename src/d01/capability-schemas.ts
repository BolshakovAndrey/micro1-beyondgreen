/**
 * Defines runtime-validated evidence schemas that bind sandbox launch policy to each
 * worker's independently reported role, execution slot, and filesystem capabilities.
 */
import { z } from "zod";

const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/u);

/** Restricts workers to the three capability profiles permitted by the process policy. */
export const CapabilityProfileSchema = z.enum(["arm_visible", "candidate_observer", "verifier_only"]);
/** Binds evidence to one arm-specific worker position in the fixed execution graph. */
export const ExecutionSlotSchema = z.string().regex(
  /^(?:status-quo|beyondgreen):(?:arm|observer:[12]|evaluator)$/u,
);
/** Validates runner-owned proof of sandbox, path, network, and launch-binding policy. */
export const RunnerLaunchEvidenceSchema = z.object({
  schemaVersion: z.literal("beyondgreen-runner-capability@1.1.0"),
  capabilityProfile: CapabilityProfileSchema,
  executionSlot: ExecutionSlotSchema,
  launchBindingSha256: Sha256Schema,
  sandbox: z.literal("macos_sandbox_exec"),
  sandboxPolicyCanonical: z.object({
    platform: z.literal("darwin"), executable: z.literal("/usr/bin/sandbox-exec"),
    profile: z.literal("(version 1) (allow default) (deny network*)"),
    nodePermissionModelApplied: z.literal(true), networkEgressDenied: z.literal(true),
    hostPathInherited: z.literal(false),
  }).strict(),
  sandboxPolicySha256: Sha256Schema,
  nodePermissionModelApplied: z.literal(true),
  allowedReadPathsCanonical: z.array(z.string().min(1)).min(1),
  allowedReadPathsSha256: Sha256Schema,
  networkEgressDenied: z.literal(true), hostPathInherited: z.literal(false), childCompleted: z.literal(true),
}).strict();
/** Validates process-local role and reciprocal filesystem capability probe results. */
export const WorkerProcessEvidenceSchema = z.object({
  role: z.enum(["arm", "candidate_observer", "evaluator"]),
  capabilityProfile: CapabilityProfileSchema,
  executionSlot: ExecutionSlotSchema,
  launchBindingSha256: Sha256Schema,
  processIdentitySha256: Sha256Schema,
  verifierReadAllowed: z.boolean(), verifierReadDenied: z.boolean(),
  candidateReadAllowed: z.boolean(), candidateReadDenied: z.boolean(),
}).strict().superRefine((value, context) => {
  if (value.verifierReadAllowed === value.verifierReadDenied
    || value.candidateReadAllowed === value.candidateReadDenied) {
    context.addIssue({ code: "custom", message: "Each capability probe requires exactly one allowed/denied outcome." });
  }
});
/** Joins runner and worker evidence under one content digest for later decision binding. */
export const CapabilityProofSchema = z.object({
  launch: RunnerLaunchEvidenceSchema, worker: WorkerProcessEvidenceSchema, proofSha256: Sha256Schema,
}).strict();
/** Validates measured process-order events from which isolation and K=0 claims are derived. */
export const ExecutionEventSchema = z.object({
  sequence: z.number().int().positive(), monotonicMs: z.number().nonnegative(),
  kind: z.enum([
    "arm_started", "arm_decision_finalized", "all_arm_decisions_finalized",
    "verifier_package_validated", "observation_started", "observation_completed",
    "evaluator_started", "evaluator_completed",
  ]),
  arm: z.enum(["status-quo", "beyondgreen"]).nullable(),
  decisionSha256: Sha256Schema.nullable(), executionSlot: ExecutionSlotSchema.nullable(),
  capabilityProfile: z.enum(["parent_no_verifier", "arm_visible", "candidate_observer", "verifier_only"]),
  verifierReadAllowed: z.boolean(), candidateReadAllowed: z.boolean(),
  networkDenied: z.literal(true), hostPathInherited: z.literal(false),
  capabilityProofSha256: Sha256Schema.nullable(),
}).strict();

/** Runtime-validated runner account of the exact sandbox policy used for a child launch. */
export type RunnerLaunchEvidence = z.infer<typeof RunnerLaunchEvidenceSchema>;
/** Runtime-validated worker account of its role, identity, and accessible path classes. */
export type WorkerProcessEvidence = z.infer<typeof WorkerProcessEvidenceSchema>;
/** Digest-bound agreement between independent runner and worker capability evidence. */
export type CapabilityProof = z.infer<typeof CapabilityProofSchema>;
/** Measured lifecycle event used to prove process ordering and oracle isolation. */
export type ExecutionEvent = z.infer<typeof ExecutionEventSchema>;
