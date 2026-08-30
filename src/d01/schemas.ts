/**
 * Defines the D01 runtime evidence contract from candidate ingestion through immutable
 * decisions, capability proofs, post-decision evaluation, and final report evidence.
 */
import { z } from "zod";
import { D01_FIXTURE, type CandidateId } from "./fixture.ts";
import { createFixtureSchemaPrimitives } from "./schema-factory.ts";

const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/u);
/** Validates the complete arm-visible board snapshot captured after each canonical action. */
export const BoardObservationSchema = z.object({
  cardIds: z.array(z.string()).length(D01_FIXTURE.engine.observationItemCount),
  allocations: z.array(z.number().int().nonnegative()).length(D01_FIXTURE.engine.observationItemCount),
  selectedIds: z.array(z.string()).max(D01_FIXTURE.engine.observationItemCount),
  step: z.number().int().positive(),
  actionLog: z.array(z.string()),
}).strict();
const primitives = createFixtureSchemaPrimitives(D01_FIXTURE, BoardObservationSchema);

// Keep the frozen D01 union exact while the factory remains available for injected descriptors.
/** Restricts candidate evidence to descriptor-registered immutable candidate identifiers. */
export const CandidateIdSchema = z.enum(D01_FIXTURE.candidateIds);
/** Restricts records to the two comparison arms supported by the frozen D01 engine. */
export const ArmIdSchema = z.enum(D01_FIXTURE.engine.armIds);
/** Defines the fail-closed decision domain shared by arm decisions and final reports. */
export const VerdictSchema = z.enum(["accept", "reject", "abstain"]);
/** Enumerates auditable rationale categories emitted by the frozen decision policy. */
export const DecisionReasonCodeSchema = z.enum([
  "operational_inconclusive", "compile_failure", "visible_test_failure", "visible_gate_green",
  "incomplete_beyondgreen_evidence", "ordering_contract_violation", "all_checks_green",
]);
/** Requires the exact descriptor-owned visible-test identifier set and ordering. */
export const VisibleTestIdsSchema = primitives.VisibleTestIdsSchema;

/** Binds an ingested candidate to its allowlisted path, manifest, and pre-run digest. */
export const ImmutableCandidateRefSchema = z.object({
  fixtureId: z.literal(D01_FIXTURE.fixtureId), candidateId: CandidateIdSchema, relativePath: z.string().min(1),
  manifestPath: z.string().min(1), expectedSha256: Sha256Schema, sha256Before: Sha256Schema,
}).strict();

/** Restricts risk records to the descriptor-owned categories required by this fixture. */
export const RiskCategorySchema = z.enum(D01_FIXTURE.engine.riskCategories);
/** Validates a complete source-bound risk inventory with one record per required category. */
export const RiskInventorySchema = z.object({
  schemaVersion: z.literal(D01_FIXTURE.schemas.riskInventory), candidateId: CandidateIdSchema,
  sourceSha256: Sha256Schema,
  risks: z.array(z.object({
    id: z.string().min(1), category: RiskCategorySchema,
    status: z.enum(["observed", "not_observed", "not_applicable"]), evidence: z.string().min(1),
  }).strict()).length(D01_FIXTURE.engine.riskCategories.length),
  unsupportedSyntax: z.boolean(), externalImport: z.boolean(),
}).strict();

/** Keeps deterministic compilation/test failures distinct from operational uncertainty. */
export const LegacyGateResultSchema = z.object({
  compileStatus: z.enum(["passed", "failed", "not_run"]), compilePassed: z.boolean(),
  compileDiagnostics: z.array(z.string()), visibleTestIds: VisibleTestIdsSchema,
  visibleStatus: z.enum(["passed", "failed", "not_run"]), visiblePassed: z.boolean(),
  deterministicAssertionFailures: z.array(z.string()), operationalFailures: z.array(z.string()),
  deterministic: z.boolean(), operationalFailure: z.boolean(),
}).strict().superRefine((value, context) => {
  if (value.compilePassed !== (value.compileStatus === "passed")
    || (value.compileStatus === "failed") !== (value.compileDiagnostics.length > 0)) {
    context.addIssue({ code: "custom", message: "Compile status and diagnostics are inconsistent." });
  }
  if (value.visiblePassed !== (value.visibleStatus === "passed")
    || (value.visibleStatus === "failed") !== (value.deterministicAssertionFailures.length > 0)) {
    context.addIssue({ code: "custom", message: "Visible status and deterministic failures are inconsistent." });
  }
  if (value.operationalFailure !== (value.operationalFailures.length > 0)
    || value.deterministic === value.operationalFailure) {
    context.addIssue({ code: "custom", message: "Operational status is inconsistent." });
  }
  if ((value.compileStatus === "not_run" || value.visibleStatus === "not_run")
    && !value.operationalFailure) {
    context.addIssue({ code: "custom", message: "A not-run gate requires an operational failure." });
  }
});

/** Validates an oracle-free, risk-linked probe plan derived from arm-visible contracts. */
export const ProbePlanSchema = z.object({
  schemaVersion: z.literal(D01_FIXTURE.schemas.probePlan), oracleFree: z.literal(true),
  derivation: z.object({
    riskInventorySha256: Sha256Schema,
    invariantContractIds: z.array(z.string().min(1)).min(1),
    seededDefectKnowledgeUsed: z.literal(false),
  }).strict(),
  probes: z.array(z.object({
    id: z.string().min(1), riskIds: z.array(z.string().min(1)).min(1),
    armVisibleContractId: z.string().min(1), armVisibleContract: z.string().min(1), required: z.boolean(),
  }).strict()).min(1),
}).strict().superRefine((value, context) => {
  const ids = value.probes.map((probe) => probe.id);
  if (new Set(ids).size !== ids.length) {
    context.addIssue({ code: "custom", message: "Probe identifiers must be unique." });
  }
});

/** Binds deterministic reasoning input to one immutable candidate and risk inventory. */
export const ReasoningAdapterInputSchema = z.object({
  schemaVersion: z.literal(D01_FIXTURE.schemas.reasoningInput), fixtureId: z.literal(D01_FIXTURE.fixtureId),
  candidateId: CandidateIdSchema, candidateSha256: Sha256Schema, riskInventory: RiskInventorySchema,
}).strict();
/** Restricts reasoning output to the approved synthetic offline plan and evidence class. */
export const ReasoningAdapterOutputSchema = z.object({
  schemaVersion: z.literal(D01_FIXTURE.schemas.reasoningOutput), fixtureId: z.literal(D01_FIXTURE.fixtureId),
  candidateId: CandidateIdSchema, riskInventorySha256: Sha256Schema, probePlan: ProbePlanSchema,
  evidenceClass: z.literal("approved_synthetic_offline"), liveModelResult: z.literal(false),
  officialOrScored: z.literal(false),
}).strict();
/** Captures the fixed replay protocol cardinality and its chained content digests. */
export const ReplayIdentitySchema = z.object({
  protocol: z.literal("offline-replay-jsonl-v1"), schemaVersion: z.literal(D01_FIXTURE.schemas.replayJsonl),
  recordCount: z.literal(4), replaySha256: Sha256Schema, finalChainSha256: Sha256Schema,
  finalOutputSha256: Sha256Schema,
}).strict();
/** Proves that probe reasoning used no live model and remains reproducible offline. */
export const ReasoningEvidenceSchema = z.object({
  engine: z.literal("deterministic_repository_analyzer"), adapter: z.literal("offline-replay-jsonl-v1"),
  modelStatus: z.literal("not_applicable_not_invoked"), liveAdapterStatus: z.literal("unverified_unused"),
  modelInvocationCount: z.literal(0), replayIdentity: ReplayIdentitySchema,
  output: ReasoningAdapterOutputSchema,
}).strict();

/** Validates oracle-free probe outcomes and one bounded counterexample for any failure. */
export const InternalCheckResultSchema = z.object({
  oracleFree: z.literal(true), deterministic: z.boolean(), oracleAccessAttempted: z.literal(false),
  checks: z.array(z.object({
    probeId: z.string().min(1), passed: z.boolean(), observationSha256: Sha256Schema,
  }).strict()),
  counterexample: z.object({
    probeId: z.string().min(1),
    summary: z.string().min(1),
    differingItems: z.array(z.object({
      id: z.string().min(1), expected: z.number(), actual: z.number(),
    }).strict()).max(5),
    omittedDifferingItemCount: z.number().int().nonnegative(),
    boundedTo: z.literal(5),
  }).strict().nullable(),
  errors: z.array(z.string()),
}).strict().superRefine((value, context) => {
  const ids = value.checks.map((check) => check.probeId);
  if (new Set(ids).size !== ids.length) {
    context.addIssue({ code: "custom", message: "Internal-check probe identifiers must be unique." });
  }
  const failed = value.checks.filter((check) => !check.passed);
  if ((failed.length === 0) !== (value.counterexample === null)
    || (value.counterexample && !failed.some((check) => check.probeId === value.counterexample?.probeId))) {
    context.addIssue({ code: "custom", message: "A failed probe requires exactly one bound bounded counterexample." });
  }
});
/** Records sanitized arm uncertainty under the frozen zero-retry operational policy. */
export const OperationalErrorSchema = z.object({
  errorClass: z.enum(["arm_crash", "arm_timeout", "arm_invalid_json", "arm_invalid_evidence"]),
  sanitizedEvidence: z.string().min(1), retryCount: z.literal(0),
}).strict();

/** Restricts evidence to the three worker capability profiles allowed by process policy. */
export const CapabilityProfileSchema = z.enum(["arm_visible", "candidate_observer", "verifier_only"]);
/** Binds process evidence to one fixed arm and role position in the execution graph. */
export const ExecutionSlotSchema = z.string().regex(
  /^(?:status-quo|beyondgreen):(?:arm|observer:[12]|evaluator)$/u,
);
/** Validates runner-owned sandbox, read-path, network, and launch-binding evidence. */
export const RunnerLaunchEvidenceSchema = z.object({
  schemaVersion: z.literal("beyondgreen-runner-capability@1.1.0"),
  capabilityProfile: CapabilityProfileSchema,
  executionSlot: ExecutionSlotSchema,
  launchBindingSha256: Sha256Schema,
  sandbox: z.literal("macos_sandbox_exec"),
  sandboxPolicyCanonical: z.object({
    platform: z.literal("darwin"),
    executable: z.literal("/usr/bin/sandbox-exec"),
    profile: z.literal("(version 1) (allow default) (deny network*)"),
    nodePermissionModelApplied: z.literal(true),
    networkEgressDenied: z.literal(true),
    hostPathInherited: z.literal(false),
  }).strict(),
  sandboxPolicySha256: Sha256Schema,
  nodePermissionModelApplied: z.literal(true),
  allowedReadPathsCanonical: z.array(z.string().min(1)).min(1),
  allowedReadPathsSha256: Sha256Schema,
  networkEgressDenied: z.literal(true),
  hostPathInherited: z.literal(false),
  childCompleted: z.literal(true),
}).strict();
/** Validates worker-local role identity and reciprocal filesystem access probes. */
export const WorkerProcessEvidenceSchema = z.object({
  role: z.enum(["arm", "candidate_observer", "evaluator"]),
  capabilityProfile: CapabilityProfileSchema,
  executionSlot: ExecutionSlotSchema,
  launchBindingSha256: Sha256Schema,
  processIdentitySha256: Sha256Schema,
  verifierReadAllowed: z.boolean(),
  verifierReadDenied: z.boolean(),
  candidateReadAllowed: z.boolean(),
  candidateReadDenied: z.boolean(),
}).strict().superRefine((value, context) => {
  if (value.verifierReadAllowed === value.verifierReadDenied
    || value.candidateReadAllowed === value.candidateReadDenied) {
    context.addIssue({ code: "custom", message: "Each capability probe requires exactly one allowed/denied outcome." });
  }
});
/** Joins matching runner and worker evidence under a stable capability proof digest. */
export const CapabilityProofSchema = z.object({
  launch: RunnerLaunchEvidenceSchema,
  worker: WorkerProcessEvidenceSchema,
  proofSha256: Sha256Schema,
}).strict();

/** Validates a complete arm verdict produced without evaluator feedback and ready to freeze. */
export const ArmDecisionSchema = z.object({
  schemaVersion: z.literal(D01_FIXTURE.schemas.armDecision), fixtureId: z.literal(D01_FIXTURE.fixtureId),
  candidateId: CandidateIdSchema, arm: ArmIdSchema, attemptOrdinal: z.literal(1), evidenceComplete: z.boolean(),
  verdict: VerdictSchema, reasonCode: DecisionReasonCodeSchema, rationale: z.string().min(1), candidateSha256: Sha256Schema,
  legacyGate: LegacyGateResultSchema, riskInventory: RiskInventorySchema.nullable(),
  probePlan: ProbePlanSchema.nullable(), reasoningEvidence: ReasoningEvidenceSchema.nullable(),
  internalChecks: InternalCheckResultSchema.nullable(), operationalError: OperationalErrorSchema.nullable(),
  verifierAccessDenied: z.literal(true), evaluatorFeedbackRoundsBeforeDecision: z.literal(0),
  finalizedBeforeEvaluator: z.literal(true),
}).strict();
/** Describes all oracle-free evidence an isolated arm worker may return to its parent. */
export const ArmWorkerEvidenceSchema = z.object({
  arm: ArmIdSchema,
  candidateId: CandidateIdSchema,
  candidateSha256: Sha256Schema,
  legacyGate: LegacyGateResultSchema,
  riskInventory: RiskInventorySchema.nullable(),
  probePlan: ProbePlanSchema.nullable(),
  reasoningEvidence: ReasoningEvidenceSchema.nullable(),
  internalChecks: InternalCheckResultSchema.nullable(),
  operationalError: OperationalErrorSchema.nullable(),
  verifierAccessDenied: z.literal(true),
}).strict();
/** Couples arm evidence and optional replay text to the worker's local capability account. */
export const ArmWorkerOutputSchema = z.object({
  evidence: ArmWorkerEvidenceSchema, offlineReplayJsonl: z.string().nullable(),
  processEvidence: WorkerProcessEvidenceSchema,
}).strict();
/** Envelopes an immutable arm decision with its decision and capability-proof digests. */
export const FinalizedDecisionSchema = z.object({
  decision: ArmDecisionSchema,
  capabilityProofSha256: Sha256Schema.nullable(),
  decisionSha256: Sha256Schema,
}).strict();

/** Validates post-decision ground-truth scoring bound to decision, observations, and manifest. */
export const EvaluatorResultSchema = z.object({
  schemaVersion: z.literal(D01_FIXTURE.schemas.evaluatorResult), fixtureId: z.literal(D01_FIXTURE.fixtureId),
  candidateId: CandidateIdSchema, arm: ArmIdSchema, decisionSha256: Sha256Schema,
  oracleAcceptedCandidate: z.boolean(), groundTruth: z.enum(["preserving", "false_green"]),
  correctDecision: z.boolean(), reasonCorrectReject: z.boolean(), completedDecision: z.boolean(),
  falseAlarm: z.boolean(), membership: z.literal(D01_FIXTURE.membership),
  evaluatedAfterDecision: z.literal(true), feedbackRoundsBeforeDecision: z.literal(0),
  evaluatorManifestSha256: Sha256Schema, observationPairSha256: Sha256Schema,
  evaluatorInputSha256: Sha256Schema, processEvidence: WorkerProcessEvidenceSchema,
}).strict();

/** Binds one candidate-only observation capture to its ordinal, source digest, and process. */
export const CandidateObservationOutputSchema = z.object({
  schemaVersion: z.literal(D01_FIXTURE.schemas.observations),
  fixtureId: z.literal(D01_FIXTURE.fixtureId),
  candidateId: CandidateIdSchema,
  candidateSha256: Sha256Schema,
  captureOrdinal: z.union([z.literal(1), z.literal(2)]),
  observations: z.array(BoardObservationSchema).length(D01_FIXTURE.engine.observationRecordCount),
  observationsSha256: Sha256Schema,
  processEvidence: WorkerProcessEvidenceSchema,
}).strict();

/** Requires two identical post-decision captures before any evaluator result is trusted. */
export const PostDecisionObservationPairSchema = z.object({
  first: CandidateObservationOutputSchema.extend({ captureOrdinal: z.literal(1) }),
  second: CandidateObservationOutputSchema.extend({ captureOrdinal: z.literal(2) }),
  deterministic: z.literal(true),
  observationsSha256: Sha256Schema,
  pairSha256: Sha256Schema,
}).strict();

/** Validates measured lifecycle events used to derive K=0 and physical-isolation claims. */
export const ExecutionEventSchema = z.object({
  sequence: z.number().int().positive(),
  monotonicMs: z.number().nonnegative(),
  kind: z.enum([
    "arm_started", "arm_decision_finalized", "all_arm_decisions_finalized",
    "verifier_package_validated", "observation_started", "observation_completed",
    "evaluator_started", "evaluator_completed",
  ]),
  arm: ArmIdSchema.nullable(),
  decisionSha256: Sha256Schema.nullable(),
  executionSlot: ExecutionSlotSchema.nullable(),
  capabilityProfile: z.enum(["parent_no_verifier", "arm_visible", "candidate_observer", "verifier_only"]),
  verifierReadAllowed: z.boolean(),
  candidateReadAllowed: z.boolean(),
  networkDenied: z.literal(true),
  hostPathInherited: z.literal(false),
  capabilityProofSha256: Sha256Schema.nullable(),
}).strict();

/** Restricts report claims to the exact isolation and process-order properties proven by events. */
export const ExecutionClaimsSchema = z.object({
  physicalProcessIsolation: z.literal(true),
  k: z.literal(0),
  armProcessesCouldReadVerifierOnly: z.literal(false),
  evaluatorStartedAfterBothDecisions: z.literal(true),
  candidateExecutedInsideOracleProcess: z.literal(false),
  networkEgressDenied: z.literal(true),
  hostPathInherited: z.literal(false),
  derivedFromMeasuredEvents: z.literal(true),
}).strict();

/** Validates the complete immutable vertical-slice evidence bundle before serialization. */
export const D01EvidenceSchema = z.object({
  schemaVersion: z.literal(D01_FIXTURE.schemas.evidence), evaluationVersion: z.literal(D01_FIXTURE.run.evaluationVersion),
  runId: z.literal(D01_FIXTURE.run.id), runType: z.literal(D01_FIXTURE.run.type),
  officialOrScored: z.literal(false), fixtureId: z.literal(D01_FIXTURE.fixtureId), candidateId: CandidateIdSchema,
  membership: z.literal(D01_FIXTURE.membership),
  sessionBoundary: z.literal(D01_FIXTURE.run.sessionBoundary),
  candidate: ImmutableCandidateRefSchema.extend({ sha256After: Sha256Schema, unchanged: z.literal(true) }),
  armVisibleManifestSha256: Sha256Schema, verifierOnlyManifestSha256: Sha256Schema,
  decisions: z.object({ statusQuo: FinalizedDecisionSchema, beyondGreen: FinalizedDecisionSchema }).strict(),
  observationPairs: z.object({
    statusQuo: PostDecisionObservationPairSchema,
    beyondGreen: PostDecisionObservationPairSchema,
  }).strict(),
  evaluatorResults: z.object({ statusQuo: EvaluatorResultSchema, beyondGreen: EvaluatorResultSchema }).strict(),
  offlineReplayJsonl: z.string().min(1).nullable(), replayIdentity: ReplayIdentitySchema.nullable(),
  executionEvents: z.array(ExecutionEventSchema).min(9),
  capabilityProofs: z.array(CapabilityProofSchema).min(6),
  executionOrder: z.array(z.string().min(1)).min(3),
  oracleBoundary: ExecutionClaimsSchema,
  timing: z.object({
    startedAtUtc: z.string().datetime({ offset: true }),
    endedAtUtc: z.string().datetime({ offset: true }),
    durationMs: z.number().nonnegative(),
  }).strict(),
  resources: z.object({
    billing: z.literal("fixed_subscription"), monetaryCost: z.literal("not_applicable_or_not_measured"),
    perRunUsdCalculatedOrEstimated: z.literal(false), perRunUsdCapProjected: z.literal(false),
    reasoningEngine: z.literal("deterministic_repository_analyzer"),
    reasoningAdapter: z.literal("offline-replay-jsonl-v1"), modelStatus: z.literal("not_applicable_not_invoked"),
    liveAdapterStatus: z.literal("unverified_unused"), modelInvocationCount: z.literal(0),
    tokens: z.literal("not_measured"), humanTime: z.literal("not_measured"), runtime: z.literal("measured"),
    automaticRetries: z.literal(0), timeoutSeconds: z.literal(180), engineBudgetSeconds: z.literal(165),
    finalizationReserveSeconds: z.literal(15), independentDeadlinePerArm: z.literal(true),
    sharedDeadlineAcrossArms: z.literal(false), nodeVersion: z.string().min(1),
  }).strict(),
  limitations: z.array(z.string().min(1)).min(1),
}).strict().superRefine((value, context) => {
  const proofByDigest = new Map(value.capabilityProofs.map((proof) => [proof.proofSha256, proof]));
  for (const finalized of [value.decisions.statusQuo, value.decisions.beyondGreen]) {
    const proof = finalized.capabilityProofSha256
      ? proofByDigest.get(finalized.capabilityProofSha256)
      : undefined;
    if (!proof || proof.worker.role !== "arm" || proof.worker.capabilityProfile !== "arm_visible"
      || proof.worker.executionSlot !== `${finalized.decision.arm}:arm`) {
      context.addIssue({ code: "custom", message: "Every finalized arm decision requires bound arm capability evidence." });
    }
  }
  const expectedProcessEvidence = [
    [value.observationPairs.statusQuo.first.processEvidence, "status-quo:observer:1", "candidate_observer", "candidate_observer"],
    [value.observationPairs.statusQuo.second.processEvidence, "status-quo:observer:2", "candidate_observer", "candidate_observer"],
    [value.observationPairs.beyondGreen.first.processEvidence, "beyondgreen:observer:1", "candidate_observer", "candidate_observer"],
    [value.observationPairs.beyondGreen.second.processEvidence, "beyondgreen:observer:2", "candidate_observer", "candidate_observer"],
    [value.evaluatorResults.statusQuo.processEvidence, "status-quo:evaluator", "evaluator", "verifier_only"],
    [value.evaluatorResults.beyondGreen.processEvidence, "beyondgreen:evaluator", "evaluator", "verifier_only"],
  ] as const;
  const proofBySlot = new Map(value.capabilityProofs.map((proof) => [proof.worker.executionSlot, proof.worker]));
  if (expectedProcessEvidence.some(([processEvidence, executionSlot, role, capabilityProfile]) => {
    const proved = proofBySlot.get(executionSlot);
    return processEvidence.executionSlot !== executionSlot
      || processEvidence.role !== role
      || processEvidence.capabilityProfile !== capabilityProfile
      || !proved
      || JSON.stringify(proved) !== JSON.stringify(processEvidence);
  })) {
    context.addIssue({
      code: "custom",
      message: "Observation or evaluator output is not positionally bound to its expected proof, role, profile, and slot.",
    });
  }
});

/** Re-exports the descriptor-owned candidate identifier alongside runtime-inferred types. */
export type { CandidateId } from "./fixture.ts";
/**
 * Identifies a supported comparison arm after boundary input passes {@link ArmIdSchema}.
 * Runtime callers must parse untrusted values through that schema so unsupported arm
 * labels cannot enter evidence records, worker execution slots, or decision binding.
 */
export type ArmId = z.infer<typeof ArmIdSchema>;
/** Runtime-validated immutable candidate reference inferred from its ingestion schema. */
export type ImmutableCandidateRef = z.infer<typeof ImmutableCandidateRefSchema>;
/** Runtime-validated typed source-risk inventory used to derive oracle-free probes. */
export type RiskInventory = z.infer<typeof RiskInventorySchema>;
/** Runtime-validated compilation and visible-test gate result with explicit uncertainty. */
export type LegacyGateResult = z.infer<typeof LegacyGateResultSchema>;
/** Runtime-validated set of required risk-linked checks available to an arm worker. */
export type ProbePlan = z.infer<typeof ProbePlanSchema>;
/** Runtime-validated immutable input to the deterministic reasoning adapter. */
export type ReasoningAdapterInput = z.infer<typeof ReasoningAdapterInputSchema>;
/** Runtime-validated oracle-free output produced by the deterministic reasoning adapter. */
export type ReasoningAdapterOutput = z.infer<typeof ReasoningAdapterOutputSchema>;
/** Runtime-validated proof that reasoning output is synthetic and replayable offline. */
export type ReasoningEvidence = z.infer<typeof ReasoningEvidenceSchema>;
/** Runtime-validated cryptographic identity of the fixed four-record replay stream. */
export type ReplayIdentity = z.infer<typeof ReplayIdentitySchema>;
/** Runtime-validated oracle-free probe outcomes and their bounded counterexample. */
export type InternalCheckResult = z.infer<typeof InternalCheckResultSchema>;
/** Runtime-validated sanitized arm failure recorded under a zero-retry policy. */
export type OperationalError = z.infer<typeof OperationalErrorSchema>;
/** Runtime-validated runner account of the exact policy applied to a worker launch. */
export type RunnerLaunchEvidence = z.infer<typeof RunnerLaunchEvidenceSchema>;
/** Runtime-validated worker account of its role and actual filesystem capabilities. */
export type WorkerProcessEvidence = z.infer<typeof WorkerProcessEvidenceSchema>;
/** Runtime-validated agreement between launch policy and worker-local capability probes. */
export type CapabilityProof = z.infer<typeof CapabilityProofSchema>;
/** Runtime-validated arm verdict produced before the evaluator is allowed to start. */
export type ArmDecision = z.infer<typeof ArmDecisionSchema>;
/** Runtime-validated evidence payload returned by an isolated arm worker. */
export type ArmWorkerEvidence = z.infer<typeof ArmWorkerEvidenceSchema>;
/** Runtime-validated arm-worker envelope including replay and process evidence. */
export type ArmWorkerOutput = z.infer<typeof ArmWorkerOutputSchema>;
/** Runtime-validated immutable decision envelope bound to its capability proof. */
export type FinalizedDecision = z.infer<typeof FinalizedDecisionSchema>;
/** Runtime-validated post-decision scoring result owned by the isolated evaluator. */
export type EvaluatorResult = z.infer<typeof EvaluatorResultSchema>;
/** Runtime-validated arm-visible board snapshot used for candidate observation. */
export type BoardObservationRecord = z.infer<typeof BoardObservationSchema>;
/** Runtime-validated output of one candidate-only post-decision observation process. */
export type CandidateObservationOutput = z.infer<typeof CandidateObservationOutputSchema>;
/** Runtime-validated deterministic pair of independent candidate observations. */
export type PostDecisionObservationPair = z.infer<typeof PostDecisionObservationPairSchema>;
/** Runtime-validated measured lifecycle event used for execution claim derivation. */
export type ExecutionEvent = z.infer<typeof ExecutionEventSchema>;
/** Runtime-validated physical-isolation and K=0 claims derived from measured events. */
export type ExecutionClaims = z.infer<typeof ExecutionClaimsSchema>;
/** Runtime-validated complete evidence bundle consumed by JSON and HTML reporting. */
export type D01Evidence = z.infer<typeof D01EvidenceSchema>;
