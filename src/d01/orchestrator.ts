/**
 * Orchestrates the unscored D01 vertical slice across isolated arm, observer, and
 * evaluator processes while enforcing immutable decisions, K=0, and bounded deadlines.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { performance } from "node:perf_hooks";

import { canonicalJson, sha256 } from "./canonical-json.ts";
import {
  bindCapabilityProof,
  canonicalAllowedReadPaths,
  canonicalAllowedReadPathsSha256,
  createLaunchBindingSha256,
  deriveExpectedExecutionPolicies,
  NETWORK_DENY_PROFILE,
  SANDBOX_POLICY_CANONICAL,
  SANDBOX_POLICY_SHA256,
  type ExpectedExecutionPolicy,
  type ExecutionSlot,
  type RunnerLaunchContract,
} from "./capability.ts";
import { deriveExecutionClaims } from "./execution.ts";
import type { PackageBinding } from "./fixture.ts";
import {
  createFixtureExecutionPlan, executeFixtureEngineBinding, type FixtureEngineBindings,
} from "./engine.ts";
import { D01_ENGINE } from "./runtime.ts";
import { validateReasoningReplay } from "./replay-core.ts";
import {
  LegacyGateResultSchema,
  type ArmId, type CandidateId, type EvaluatorResult, type FinalizedDecision,
  type ImmutableCandidateRef, type OperationalError, type CandidateObservationOutput,
  type ExecutionEvent, type PostDecisionObservationPair,
} from "./schemas.ts";

/** Maximum wall-clock allowance for one arm or its independent finalization phase. */
export const TOTAL_TIMEOUT_MS = 180_000;
/** Portion of an arm's deadline reserved for evidence-producing engine work. */
export const ENGINE_BUDGET_MS = 165_000;
/** Reserved window for report finalization or post-decision evaluator integrity work. */
export const FINALIZATION_RESERVE_MS = 15_000;

/** Supplies monotonic milliseconds for deadlines and measured execution ordering. */
export interface MonotonicClock { now(): number }
/** Supplies epoch milliseconds used only for report timestamps and elapsed metadata. */
export interface WallClock { now(): number }
/** Describes a fully policy-bound worker launch accepted by the process runner. */
export interface ProcessRequest {
  readonly repositoryRoot: string;
  readonly arguments: readonly string[];
  readonly allowedReadPaths: readonly string[];
  readonly timeoutMs: number;
  readonly input?: string;
  readonly capabilityProfile: "arm_visible" | "candidate_observer" | "verifier_only";
  readonly executionSlot: ExecutionSlot;
  readonly launchBindingSha256: string;
  readonly sandboxPolicyCanonical: typeof SANDBOX_POLICY_CANONICAL;
  readonly sandboxPolicySha256: string;
  readonly allowedReadPathsCanonical: readonly string[];
  readonly allowedReadPathsSha256: string;
  readonly denyNetwork: true;
  readonly inheritHostPath: false;
}
/** Returns bounded worker output together with runner-owned launch evidence. */
export interface ProcessResult {
  readonly status: number | null;
  readonly stdout: string;
  readonly errorCode?: string;
  readonly launchEvidence?: unknown;
}
/** Abstracts the synchronous sandbox transport for production and adversarial tests. */
export type ProcessRunner = (request: ProcessRequest) => ProcessResult;

/** Signals integrity failures that invalidate evaluation rather than becoming an arm verdict. */
export class D01IntegrityError extends Error {}

/** Exposes only remaining engine and total time, preventing deadline extension by callers. */
export interface TotalDeadline {
  readonly remainingEngineMs: () => number;
  readonly remainingTotalMs: () => number;
}

interface FinalizationDeadline { readonly remainingTotalMs: () => number }

/** Share one monotonic 165-second engine budget and 15-second finalization reserve. */
export function createTotalDeadline(clock: MonotonicClock, startedAt = clock.now()): TotalDeadline {
  const remaining = (limit: number) => Math.max(0, Math.floor(startedAt + limit - clock.now()));
  return Object.freeze({
    remainingEngineMs: () => Math.min(remaining(ENGINE_BUDGET_MS), remaining(TOTAL_TIMEOUT_MS)),
    remainingTotalMs: () => remaining(TOTAL_TIMEOUT_MS),
  });
}

/** Give one finalized arm an independent 15-second evaluator integrity window. */
function createFinalizationDeadline(clock: MonotonicClock, startedAt = clock.now()): FinalizationDeadline {
  return Object.freeze({
    remainingTotalMs: () => Math.max(0, Math.floor(startedAt + FINALIZATION_RESERVE_MS - clock.now())),
  });
}

function createBoundProcessRequest(input: Readonly<{
  repositoryRoot: string;
  arguments: readonly string[];
  allowedReadPaths: readonly string[];
  timeoutMs: number;
  input?: string;
  capabilityProfile: ProcessRequest["capabilityProfile"];
  executionSlot: ExecutionSlot;
  subjectSha256: string;
}>, expectedPolicy: ExpectedExecutionPolicy): Readonly<{ request: ProcessRequest; contract: RunnerLaunchContract }> {
  const allowedReadPathsCanonical = canonicalAllowedReadPaths(input.repositoryRoot, input.allowedReadPaths);
  const allowedReadPathsSha256 = canonicalAllowedReadPathsSha256(input.repositoryRoot, input.allowedReadPaths);
  if (input.executionSlot !== expectedPolicy.executionSlot
    || input.capabilityProfile !== expectedPolicy.capabilityProfile
    || canonicalJson(allowedReadPathsCanonical) !== canonicalJson(expectedPolicy.allowedReadPathsCanonical)
    || allowedReadPathsSha256 !== expectedPolicy.allowedReadPathsSha256) {
    throw new Error("Process request does not match the exact expected execution-slot policy.");
  }
  const launchBindingSha256 = createLaunchBindingSha256({
    capabilityProfile: input.capabilityProfile,
    executionSlot: input.executionSlot,
    sandboxPolicySha256: SANDBOX_POLICY_SHA256,
    allowedReadPathsSha256,
    subjectSha256: input.subjectSha256,
  });
  const contract = Object.freeze({
    capabilityProfile: input.capabilityProfile,
    executionSlot: input.executionSlot,
    launchBindingSha256,
    sandboxPolicyCanonical: SANDBOX_POLICY_CANONICAL,
    sandboxPolicySha256: SANDBOX_POLICY_SHA256,
    allowedReadPathsCanonical,
    allowedReadPathsSha256,
  });
  const { subjectSha256: _subjectSha256, ...requestInput } = input;
  return Object.freeze({
    contract,
    request: Object.freeze({
      ...requestInput,
      arguments: Object.freeze([...input.arguments, launchBindingSha256]),
      launchBindingSha256,
      sandboxPolicyCanonical: SANDBOX_POLICY_CANONICAL,
      sandboxPolicySha256: SANDBOX_POLICY_SHA256,
      allowedReadPathsCanonical,
      allowedReadPathsSha256,
      denyNetwork: true as const,
      inheritHostPath: false as const,
    }),
  });
}

/** Execute one bounded worker request using the production sandbox transport. */
export const defaultProcessRunner: ProcessRunner = (request) => {
  if (process.platform !== "darwin") {
    return { status: null, stdout: "", errorCode: "NETWORK_SANDBOX_UNAVAILABLE" };
  }
  const canonicalPaths = canonicalAllowedReadPaths(request.repositoryRoot, request.allowedReadPaths);
  if (canonicalJson(request.sandboxPolicyCanonical) !== canonicalJson(SANDBOX_POLICY_CANONICAL)
    || request.sandboxPolicySha256 !== SANDBOX_POLICY_SHA256
    || canonicalJson(canonicalPaths) !== canonicalJson(request.allowedReadPathsCanonical)
    || sha256(canonicalJson(canonicalPaths)) !== request.allowedReadPathsSha256) {
    return { status: null, stdout: "", errorCode: "RUNNER_POLICY_DIGEST_MISMATCH" };
  }
  const result = spawnSync("/usr/bin/sandbox-exec", [
    "-p",
    NETWORK_DENY_PROFILE,
    process.execPath,
    "--permission",
    ...request.allowedReadPaths.map((allowedPath) => (
      `--allow-fs-read=${path.resolve(request.repositoryRoot, allowedPath)}`
    )),
    ...request.arguments,
  ], {
    cwd: request.repositoryRoot,
    encoding: "utf8",
    env: {},
    input: request.input,
    maxBuffer: 4 * 1024 * 1024,
    timeout: request.timeoutMs,
  });
  return {
    status: result.status,
    stdout: result.stdout,
    errorCode: (result.error as NodeJS.ErrnoException | undefined)?.code,
    launchEvidence: result.status === null ? undefined : {
      schemaVersion: "beyondgreen-runner-capability@1.1.0",
      capabilityProfile: request.capabilityProfile,
      executionSlot: request.executionSlot,
      launchBindingSha256: request.launchBindingSha256,
      sandbox: "macos_sandbox_exec",
      sandboxPolicyCanonical: SANDBOX_POLICY_CANONICAL,
      sandboxPolicySha256: request.sandboxPolicySha256,
      nodePermissionModelApplied: true,
      allowedReadPathsCanonical: request.allowedReadPathsCanonical,
      allowedReadPathsSha256: request.allowedReadPathsSha256,
      networkEgressDenied: true,
      hostPathInherited: false,
      childCompleted: true,
    },
  };
};

/** Validate the complete verifier package against frozen, code-owned digests. */
function validateVerifierPackage(engine: FixtureEngineBindings, repositoryRoot: string): string {
  try { return engine.runtime.validatePackage(repositoryRoot, engine.descriptor.verifierOnly); }
  catch (error) { throw new D01IntegrityError("Frozen verifier package validation failed.", { cause: error }); }
}

function unavailableGate(engine: FixtureEngineBindings, error: OperationalError) {
  return LegacyGateResultSchema.parse({
    compileStatus: "not_run" as const,
    compilePassed: false,
    compileDiagnostics: [],
    visibleTestIds: engine.descriptor.armVisible.visibleAssertionIds,
    visibleStatus: "not_run" as const,
    visiblePassed: false,
    deterministicAssertionFailures: [],
    operationalFailures: [error.sanitizedEvidence],
    deterministic: false,
    operationalFailure: true,
  });
}

function operationalAbstain(
  engine: FixtureEngineBindings,
  arm: ArmId,
  candidate: ImmutableCandidateRef,
  errorClass: OperationalError["errorClass"],
): Readonly<{ finalized: FinalizedDecision; replayJsonl: null; capabilityProof: null }> {
  const error: OperationalError = {
    errorClass,
    sanitizedEvidence: `The isolated ${arm} arm did not produce trustworthy evidence (${errorClass}).`,
    retryCount: 0,
  };
  return Object.freeze({
    finalized: engine.runtime.finalizeDecision(engine.runtime.decide({
      arm,
      candidate,
      legacyGate: unavailableGate(engine, error),
      riskInventory: null,
      probePlan: null,
      reasoningEvidence: null,
      internalChecks: null,
      operationalError: error,
      verifierAccessDenied: true,
    })),
    replayJsonl: null,
    capabilityProof: null,
  });
}

/** Run an arm once; arm uncertainty becomes immutable abstention without a retry. */
export function runArmProcess(
  repositoryRoot: string,
  arm: ArmId,
  candidate: ImmutableCandidateRef,
  deadline: TotalDeadline,
  runner: ProcessRunner = defaultProcessRunner,
): Readonly<{ finalized: FinalizedDecision; replayJsonl: string | null; capabilityProof: import("./schemas.ts").CapabilityProof | null }> {
  return runFixtureArmProcess(D01_ENGINE, repositoryRoot, arm, candidate, deadline, runner);
}

/** Run one arm through an injected fixture engine and the real bounded process transport. */
export function runFixtureArmProcess(
  engine: FixtureEngineBindings,
  repositoryRoot: string,
  arm: ArmId,
  candidate: ImmutableCandidateRef,
  deadline: TotalDeadline,
  runner: ProcessRunner = defaultProcessRunner,
): Readonly<{ finalized: FinalizedDecision; replayJsonl: string | null; capabilityProof: import("./schemas.ts").CapabilityProof | null }> {
  const timeoutMs = deadline.remainingEngineMs();
  if (timeoutMs <= 0) return operationalAbstain(engine, arm, candidate, "arm_timeout");
  const fixture = engine.descriptor;
  const descriptor = engine.runtime.describeCandidate(candidate.candidateId);
  const enginePlan = createFixtureExecutionPlan(engine, candidate.candidateId);
  const armPlan = enginePlan.arms.find((item) => item.arm === arm);
  if (!armPlan) return operationalAbstain(engine, arm, candidate, "arm_invalid_evidence");
  const policies = deriveExpectedExecutionPolicies(engine.descriptor, repositoryRoot, candidate.candidateId);
  const candidateRoot = path.dirname(descriptor.sourcePath);
  let result: ProcessResult;
  let expectedLaunchContract: RunnerLaunchContract | undefined;
  try {
    const launch = createBoundProcessRequest({
      repositoryRoot,
      arguments: armPlan.workerArguments,
      allowedReadPaths: [
        fixture.scripts.armWorker, "src/d01", fixture.armVisible.rootPath, candidateRoot,
        descriptor.manifestPath, fixture.armVisible.manifestPath, "node_modules", "package.json",
      ],
      timeoutMs,
      capabilityProfile: "arm_visible",
      executionSlot: `${arm}:arm`,
      subjectSha256: candidate.sha256Before,
    }, policies.get(`${arm}:arm`)!);
    result = runner(launch.request);
    expectedLaunchContract = launch.contract;
  }
  catch {
    return operationalAbstain(engine, arm, candidate, "arm_crash");
  }
  if (result.errorCode === "ETIMEDOUT") return operationalAbstain(engine, arm, candidate, "arm_timeout");
  if (result.status !== 0) return operationalAbstain(engine, arm, candidate, "arm_crash");
  let parsed: unknown;
  try { parsed = JSON.parse(result.stdout); }
  catch { return operationalAbstain(engine, arm, candidate, "arm_invalid_json"); }
  try {
    const output = executeFixtureEngineBinding(engine, {
      kind: "parse_arm_output", value: parsed,
    }) as import("./schemas.ts").ArmWorkerOutput;
    if (!expectedLaunchContract) throw new Error("Runner launch contract is missing.");
    const capabilityProof = bindCapabilityProof(result.launchEvidence, output.processEvidence, expectedLaunchContract, "arm");
    const evidence = output.evidence;
    if (evidence.arm !== arm || evidence.candidateId !== candidate.candidateId
      || evidence.candidateSha256 !== candidate.sha256Before) {
      throw new Error("Arm evidence is not bound to the requested arm and immutable candidate.");
    }
    if (arm === "beyondgreen") {
      if (evidence.reasoningEvidence) {
        if (!output.offlineReplayJsonl || !evidence.riskInventory || !evidence.probePlan) {
          throw new Error("Incomplete BeyondGreen replay evidence.");
        }
        const replay = executeFixtureEngineBinding(engine, {
          kind: "replay_reasoning", value: output.offlineReplayJsonl,
        }) as ReturnType<typeof validateReasoningReplay>;
        if (replay.input.candidateId !== candidate.candidateId
          || replay.input.candidateSha256 !== candidate.sha256Before) {
          throw new Error("Replay evidence identifies a different immutable candidate.");
        }
        if (canonicalJson(replay.identity) !== canonicalJson(evidence.reasoningEvidence.replayIdentity)
          || canonicalJson(replay.input.riskInventory) !== canonicalJson(evidence.riskInventory)
          || canonicalJson(replay.output) !== canonicalJson(evidence.reasoningEvidence.output)
          || canonicalJson(replay.output.probePlan) !== canonicalJson(evidence.probePlan)) {
          throw new Error("Replay evidence does not bind the decision inputs and output.");
        }
      }
      else if (output.offlineReplayJsonl !== null) {
        throw new Error("Replay exists without reasoning evidence.");
      }
    }
    else if (output.offlineReplayJsonl !== null || evidence.reasoningEvidence !== null
      || evidence.riskInventory !== null || evidence.probePlan !== null || evidence.internalChecks !== null) {
      throw new Error("Status-quo arm returned reasoning evidence.");
    }
    const decision = engine.runtime.decide({
      arm,
      candidate,
      legacyGate: evidence.legacyGate,
      riskInventory: evidence.riskInventory,
      probePlan: evidence.probePlan,
      reasoningEvidence: evidence.reasoningEvidence,
      internalChecks: evidence.internalChecks,
      operationalError: evidence.operationalError,
      verifierAccessDenied: evidence.verifierAccessDenied,
    });
    return Object.freeze({
      finalized: engine.runtime.finalizeDecision(decision, capabilityProof.proofSha256),
      replayJsonl: output.offlineReplayJsonl,
      capabilityProof,
    });
  }
  catch {
    return operationalAbstain(engine, arm, candidate, "arm_invalid_evidence");
  }
}

/** Capture post-decision behavior in a process that cannot read verifier-only files. */
function runCandidateObservationProcess(
  engine: FixtureEngineBindings,
  repositoryRoot: string,
  decision: FinalizedDecision,
  deadline: FinalizationDeadline,
  runner: ProcessRunner,
  captureOrdinal: 1 | 2,
): Readonly<{ capture: CandidateObservationOutput; capabilityProof: import("./schemas.ts").CapabilityProof }> {
  const timeoutMs = deadline.remainingTotalMs();
  if (timeoutMs <= 0) throw new D01IntegrityError("D01 deadline expired before candidate observation.");
  const candidateId = decision.decision.candidateId;
  const fixture = engine.descriptor;
  const enginePlan = createFixtureExecutionPlan(engine, candidateId);
  const armPlan = enginePlan.arms.find((item) => item.arm === decision.decision.arm);
  if (!armPlan) throw new D01IntegrityError("Candidate observation arm plan is missing.");
  const observationArguments = armPlan.observationArguments[captureOrdinal - 1]!;
  const executionSlot = `${decision.decision.arm}:observer:${captureOrdinal}` as const;
  const policies = deriveExpectedExecutionPolicies(engine.descriptor, repositoryRoot, candidateId);
  const candidateDescriptor = engine.runtime.describeCandidate(candidateId);
  const launch = createBoundProcessRequest({
    repositoryRoot,
    arguments: observationArguments,
    allowedReadPaths: [
      fixture.scripts.observerWorker, "src/d01", fixture.armVisible.rootPath,
      path.dirname(candidateDescriptor.sourcePath),
      candidateDescriptor.manifestPath, "node_modules", "package.json",
    ],
    timeoutMs,
    capabilityProfile: "candidate_observer",
    executionSlot,
    subjectSha256: decision.decisionSha256,
  }, policies.get(executionSlot)!);
  const result = runner(launch.request);
  if (result.status !== 0 || result.errorCode) {
    throw new D01IntegrityError("Candidate observation process did not complete.");
  }
  try {
    const observations = executeFixtureEngineBinding(engine, {
      kind: "parse_observation", value: JSON.parse(result.stdout),
    }) as CandidateObservationOutput;
    const capabilityProof = bindCapabilityProof(
      result.launchEvidence, observations.processEvidence, launch.contract, "candidate_observer",
    );
    if (observations.candidateId !== candidateId
      || observations.candidateSha256 !== decision.decision.candidateSha256
      || observations.captureOrdinal !== captureOrdinal) {
      throw new Error("Candidate observations are not bound to the finalized decision.");
    }
    return Object.freeze({ capture: observations, capabilityProof });
  }
  catch (error) {
    throw new D01IntegrityError("Candidate observation evidence is invalid.", { cause: error });
  }
}

type EvaluatorProcessOptions = Readonly<{
  expectedManifestSha256?: string;
  onObservationPair?: (pair: PostDecisionObservationPair) => void;
  onCapabilityProof?: (proof: import("./schemas.ts").CapabilityProof) => void;
  onEvent?: (kind: "observation_started" | "observation_completed" | "evaluator_started" | "evaluator_completed",
    capabilityProfile: "candidate_observer" | "verifier_only",
    executionSlot: ExecutionSlot,
    capabilityProof?: import("./schemas.ts").CapabilityProof) => void;
}>;

/** Evaluate one immutable D01 arm decision after two deterministic candidate observations. */
export function runEvaluatorProcess(
  repositoryRoot: string,
  decision: FinalizedDecision,
  deadline: FinalizationDeadline,
  runner: ProcessRunner,
  options: EvaluatorProcessOptions = {},
): EvaluatorResult {
  return runFixtureEvaluatorProcess(D01_ENGINE, repositoryRoot, decision, deadline, runner, options);
}

/** Run observations and evaluator through the injected fixture engine after decision immutability. */
export function runFixtureEvaluatorProcess(
  engine: FixtureEngineBindings,
  repositoryRoot: string,
  decision: FinalizedDecision,
  deadline: FinalizationDeadline,
  runner: ProcessRunner,
  options: EvaluatorProcessOptions = {},
): EvaluatorResult {
  const fixture = engine.descriptor;
  const finalized = engine.runtime.verifyFinalizedDecision(decision);
  const expectedManifestSha256 = options.expectedManifestSha256 ?? validateVerifierPackage(engine, repositoryRoot);
  options.onEvent?.("observation_started", "candidate_observer", `${finalized.decision.arm}:observer:1`);
  const firstResult = runCandidateObservationProcess(engine, repositoryRoot, finalized, deadline, runner, 1);
  const first = firstResult.capture;
  options.onCapabilityProof?.(firstResult.capabilityProof);
  options.onEvent?.("observation_completed", "candidate_observer",
    firstResult.capabilityProof.worker.executionSlot as ExecutionSlot,
    firstResult.capabilityProof);
  options.onEvent?.("observation_started", "candidate_observer", `${finalized.decision.arm}:observer:2`);
  const secondResult = runCandidateObservationProcess(engine, repositoryRoot, finalized, deadline, runner, 2);
  const second = secondResult.capture;
  options.onCapabilityProof?.(secondResult.capabilityProof);
  options.onEvent?.("observation_completed", "candidate_observer",
    secondResult.capabilityProof.worker.executionSlot as ExecutionSlot,
    secondResult.capabilityProof);
  let observations;
  try { observations = engine.runtime.finalizeObservationPair(first, second); }
  catch (error) { throw new D01IntegrityError("Post-decision observations were nondeterministic.", { cause: error }); }
  options.onObservationPair?.(observations);
  const timeoutMs = deadline.remainingTotalMs();
  if (timeoutMs <= 0) throw new D01IntegrityError("D01 total deadline expired before evaluator finalization.");
  let result: ProcessResult;
  let expectedLaunchContract: RunnerLaunchContract | undefined;
  try {
    options.onEvent?.("evaluator_started", "verifier_only", `${finalized.decision.arm}:evaluator`);
    const policies = deriveExpectedExecutionPolicies(
      engine.descriptor, repositoryRoot, finalized.decision.candidateId,
    );
    const launch = createBoundProcessRequest({
      repositoryRoot,
      arguments: [executeFixtureEngineBinding(engine, { kind: "evaluator_worker" }) as string,
        finalized.decision.arm],
      allowedReadPaths: [
        fixture.scripts.evaluatorWorker, "src/d01", fixture.armVisible.rootPath,
        fixture.verifierOnly.rootPath, fixture.verifierOnly.manifestPath,
        "node_modules", "package.json",
      ],
      input: JSON.stringify({ decision: finalized, observations }),
      timeoutMs,
      capabilityProfile: "verifier_only",
      executionSlot: `${finalized.decision.arm}:evaluator`,
      subjectSha256: finalized.decisionSha256,
    }, policies.get(`${finalized.decision.arm}:evaluator`)!);
    result = runner(launch.request);
    expectedLaunchContract = launch.contract;
  }
  catch (error) {
    throw new D01IntegrityError("Independent evaluator process failed integrity checks.", { cause: error });
  }
  if (result.status !== 0 || result.errorCode) throw new D01IntegrityError("Independent evaluator did not complete.");
  try {
    const evaluated = executeFixtureEngineBinding(engine, {
      kind: "parse_evaluator", value: JSON.parse(result.stdout),
    }) as EvaluatorResult;
    if (!expectedLaunchContract) throw new Error("Evaluator launch contract is missing.");
    const evaluatorProof = bindCapabilityProof(
      result.launchEvidence, evaluated.processEvidence, expectedLaunchContract, "evaluator",
    );
    options.onCapabilityProof?.(evaluatorProof);
    if (evaluated.decisionSha256 !== finalized.decisionSha256
      || evaluated.arm !== finalized.decision.arm
      || evaluated.candidateId !== finalized.decision.candidateId
      || evaluated.evaluatorManifestSha256 !== expectedManifestSha256
      || evaluated.observationPairSha256 !== observations.pairSha256
      || evaluated.evaluatorInputSha256 !== engine.runtime.evaluatorInputSha256(
        finalized, observations, expectedManifestSha256,
      )) {
      throw new Error("Evaluator result is not bound to the finalized decision and frozen manifest.");
    }
    options.onEvent?.("evaluator_completed", "verifier_only",
      evaluatorProof.worker.executionSlot as ExecutionSlot, evaluatorProof);
    return evaluated;
  }
  catch (error) { throw new D01IntegrityError("Independent evaluator evidence is invalid.", { cause: error }); }
}

/** Injects clocks and process transport without widening production worker capabilities. */
export interface VerticalSliceDependencies {
  readonly clock?: MonotonicClock;
  readonly wallClock?: WallClock;
  readonly processRunner?: ProcessRunner;
  readonly packageValidator?: (repositoryRoot: string, binding: PackageBinding) => string;
}

/** Execute the approved unscored slice with a full independent deadline for each arm. */
export function runD01VerticalSlice(
  repositoryRoot: string,
  candidateIdInput: string = D01_ENGINE.descriptor.candidateIds[1],
  dependencies: VerticalSliceDependencies = {},
) {
  return runFixtureVerticalSlice(D01_ENGINE, repositoryRoot, candidateIdInput, dependencies);
}

/** Execute the complete real pipeline for one injected fixture engine. */
export function runFixtureVerticalSlice(
  engine: FixtureEngineBindings,
  repositoryRoot: string,
  candidateIdInput: string = engine.descriptor.candidateIds[1] ?? engine.descriptor.candidateIds[0],
  dependencies: VerticalSliceDependencies = {},
) {
  const fixture = engine.descriptor;
  const enginePlan = createFixtureExecutionPlan(engine, candidateIdInput);
  const candidateId = executeFixtureEngineBinding(engine, {
    kind: "parse_candidate", value: enginePlan.candidateId,
  }) as CandidateId;
  const clock = dependencies.clock ?? { now: () => performance.now() };
  const wallClock = dependencies.wallClock ?? { now: () => Date.now() };
  const runner = dependencies.processRunner ?? defaultProcessRunner;
  const packageValidator = dependencies.packageValidator ?? engine.runtime.validatePackage;
  const startedAtUtcMs = wallClock.now();
  const startedAtMonotonicMs = clock.now();
  const executionEvents: ExecutionEvent[] = [];
  const capabilityProofs: import("./schemas.ts").CapabilityProof[] = [];
  const recordEvent = (
    kind: ExecutionEvent["kind"],
    arm: ArmId | null,
    capabilityProfile: ExecutionEvent["capabilityProfile"],
    verifierReadAllowed: boolean,
    candidateReadAllowed: boolean,
    executionSlot: ExecutionEvent["executionSlot"],
    decisionSha256: string | null = null,
    capabilityProof: import("./schemas.ts").CapabilityProof | null = null,
  ) => {
    const worker = capabilityProof?.worker;
    const launch = capabilityProof?.launch;
    executionEvents.push({
      sequence: executionEvents.length + 1,
      monotonicMs: Math.max(0, clock.now() - startedAtMonotonicMs),
      kind,
      arm,
      decisionSha256,
      executionSlot: worker?.executionSlot ?? executionSlot,
      capabilityProfile: worker?.capabilityProfile ?? capabilityProfile,
      verifierReadAllowed: worker?.verifierReadAllowed ?? verifierReadAllowed,
      candidateReadAllowed: worker?.candidateReadAllowed ?? candidateReadAllowed,
      networkDenied: launch?.networkEgressDenied ?? true,
      hostPathInherited: launch?.hostPathInherited ?? false,
      capabilityProofSha256: capabilityProof?.proofSha256 ?? null,
    });
  };
  packageValidator(repositoryRoot, fixture.armVisible as PackageBinding);
  const candidate = engine.runtime.ingestCandidate(repositoryRoot, candidateId);
  // Each arm gets its own 165-second engine window; starting one arm cannot consume the other's budget.
  recordEvent("arm_started", "status-quo", "arm_visible", false, true, "status-quo:arm");
  const statusQuoArm = runFixtureArmProcess(
    engine, repositoryRoot, "status-quo", candidate, createTotalDeadline(clock), runner,
  );
  if (statusQuoArm.capabilityProof) capabilityProofs.push(statusQuoArm.capabilityProof);
  recordEvent("arm_decision_finalized", "status-quo", "arm_visible", false, true, "status-quo:arm",
    statusQuoArm.finalized.decisionSha256, statusQuoArm.capabilityProof);
  recordEvent("arm_started", "beyondgreen", "arm_visible", false, true, "beyondgreen:arm");
  const beyondGreenArm = runFixtureArmProcess(
    engine, repositoryRoot, "beyondgreen", candidate, createTotalDeadline(clock), runner,
  );
  if (beyondGreenArm.capabilityProof) capabilityProofs.push(beyondGreenArm.capabilityProof);
  recordEvent("arm_decision_finalized", "beyondgreen", "arm_visible", false, true, "beyondgreen:arm",
    beyondGreenArm.finalized.decisionSha256, beyondGreenArm.capabilityProof);
  recordEvent("all_arm_decisions_finalized", null, "parent_no_verifier", false, true, null);
  const sha256AfterDecisions = engine.runtime.assertCandidateUnchanged(repositoryRoot, candidate);

  // The decision-owning parent opens verifier-only bytes only after both decisions are immutable.
  let verifierManifestSha256: string;
  try { verifierManifestSha256 = packageValidator(repositoryRoot, fixture.verifierOnly as PackageBinding); }
  catch (error) { throw new D01IntegrityError("Frozen verifier package validation failed.", { cause: error }); }
  recordEvent("verifier_package_validated", null, "verifier_only", true, false, null);
  const observationPairs: Partial<Record<ArmId, PostDecisionObservationPair>> = {};
  const evaluatorOptions = (arm: ArmId): EvaluatorProcessOptions => ({
    expectedManifestSha256: verifierManifestSha256,
    onObservationPair: (pair) => { observationPairs[arm] = pair; },
    onCapabilityProof: (proof) => { capabilityProofs.push(proof); },
    onEvent: (kind, capabilityProfile, executionSlot, proof) => recordEvent(
      kind,
      arm,
      capabilityProfile,
      capabilityProfile === "verifier_only",
      capabilityProfile === "candidate_observer",
      executionSlot,
      arm === "status-quo" ? statusQuoArm.finalized.decisionSha256 : beyondGreenArm.finalized.decisionSha256,
      proof ?? null,
    ),
  });
  const statusQuoEvaluator = runFixtureEvaluatorProcess(
    engine, repositoryRoot, statusQuoArm.finalized, createFinalizationDeadline(clock), runner,
    evaluatorOptions("status-quo"),
  );
  const beyondGreenEvaluator = runFixtureEvaluatorProcess(
    engine, repositoryRoot, beyondGreenArm.finalized, createFinalizationDeadline(clock), runner,
    evaluatorOptions("beyondgreen"),
  );
  const sha256After = engine.runtime.assertCandidateUnchanged(repositoryRoot, candidate);
  if (sha256After !== sha256AfterDecisions) throw new D01IntegrityError("Candidate changed during evaluation.");

  const execution = deriveExecutionClaims(
    engine,
    executionEvents,
    capabilityProofs,
    { "status-quo": statusQuoArm.finalized, beyondgreen: beyondGreenArm.finalized },
    deriveExpectedExecutionPolicies(engine.descriptor, repositoryRoot, candidateId),
  );
  if (!observationPairs["status-quo"] || !observationPairs.beyondgreen) {
    throw new D01IntegrityError("Both post-decision observation pairs are required.");
  }
  const endedAtUtcMs = wallClock.now();
  const durationMs = Math.max(0, clock.now() - startedAtMonotonicMs);
  return executeFixtureEngineBinding(engine, { kind: "parse_evidence", value: {
    schemaVersion: fixture.schemas.evidence,
    evaluationVersion: fixture.run.evaluationVersion,
    runId: fixture.run.id,
    runType: fixture.run.type,
    officialOrScored: false,
    fixtureId: fixture.fixtureId,
    candidateId,
    membership: fixture.membership,
    sessionBoundary: fixture.run.sessionBoundary,
    candidate: { ...candidate, sha256After, unchanged: true },
    armVisibleManifestSha256: fixture.armVisible.expectedManifestSha256,
    verifierOnlyManifestSha256: verifierManifestSha256,
    decisions: { statusQuo: statusQuoArm.finalized, beyondGreen: beyondGreenArm.finalized },
    observationPairs: {
      statusQuo: observationPairs["status-quo"],
      beyondGreen: observationPairs.beyondgreen,
    },
    evaluatorResults: { statusQuo: statusQuoEvaluator, beyondGreen: beyondGreenEvaluator },
    offlineReplayJsonl: beyondGreenArm.replayJsonl,
    replayIdentity: beyondGreenArm.finalized.decision.reasoningEvidence?.replayIdentity ?? null,
    executionEvents: execution.events,
    capabilityProofs,
    executionOrder: execution.order,
    oracleBoundary: execution.claims,
    timing: {
      startedAtUtc: new Date(startedAtUtcMs).toISOString(),
      endedAtUtc: new Date(endedAtUtcMs).toISOString(),
      durationMs,
    },
    resources: {
      billing: "fixed_subscription",
      monetaryCost: "not_applicable_or_not_measured",
      perRunUsdCalculatedOrEstimated: false,
      perRunUsdCapProjected: false,
      reasoningEngine: "deterministic_repository_analyzer",
      reasoningAdapter: "offline-replay-jsonl-v1",
      modelStatus: "not_applicable_not_invoked",
      liveAdapterStatus: "unverified_unused",
      modelInvocationCount: 0,
      tokens: "not_measured",
      humanTime: "not_measured",
      runtime: "measured",
      automaticRetries: 0,
      timeoutSeconds: 180,
      engineBudgetSeconds: 165,
      finalizationReserveSeconds: 15,
      independentDeadlinePerArm: true,
      sharedDeadlineAcrossArms: false,
      nodeVersion: process.version,
    },
    limitations: [
      "This is approved synthetic/offline evidence for one unscored development fixture, not a live model result.",
      "The live reasoning adapter remains unverified and unused; no model invocation occurred.",
      "The approved public D01 invariant directly identifies the seeded defect family; this is a disclosed construction-validity limitation and does not demonstrate hidden-defect discovery.",
    ],
  } }) as import("./schemas.ts").D01Evidence;
}
