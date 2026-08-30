/**
 * Derives exact per-process read policies and cryptographically binds runner launch
 * evidence to worker-local capability probes without persisting host-specific paths.
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { canonicalJson, sha256 } from "./canonical-json.ts";
import type { EngineDescriptor } from "./engine.ts";
import { candidateDescriptor, D01_FIXTURE } from "./fixture.ts";
import {
  CapabilityProofSchema,
  RunnerLaunchEvidenceSchema,
  WorkerProcessEvidenceSchema,
  type CapabilityProof,
  type RunnerLaunchEvidence,
  type WorkerProcessEvidence,
} from "./capability-schemas.ts";

/** Names the three mutually constrained worker responsibilities in the process graph. */
export type ProcessRole = "arm" | "candidate_observer" | "evaluator";
/** Identifies one role position for one arm so launch evidence cannot be replayed elsewhere. */
export type ExecutionSlot = `${"status-quo" | "beyondgreen"}:${"arm" | "observer:1" | "observer:2" | "evaluator"}`;

/** Denies all network operations in the macOS sandbox profile used by every worker. */
export const NETWORK_DENY_PROFILE = "(version 1) (allow default) (deny network*)";
/** Canonical code-owned process policy whose digest is checked before and after launch. */
export const SANDBOX_POLICY_CANONICAL = Object.freeze({
  platform: "darwin",
  executable: "/usr/bin/sandbox-exec",
  profile: NETWORK_DENY_PROFILE,
  nodePermissionModelApplied: true,
  networkEgressDenied: true,
  hostPathInherited: false,
} as const);
/** Stable digest binding launch evidence to the exact canonical sandbox policy. */
export const SANDBOX_POLICY_SHA256 = sha256(canonicalJson(SANDBOX_POLICY_CANONICAL));

/** Defines the exact code-derived capability profile required for one execution slot. */
export type ExpectedExecutionPolicy = Readonly<{
  executionSlot: ExecutionSlot;
  role: ProcessRole;
  capabilityProfile: RunnerLaunchEvidence["capabilityProfile"];
  sandboxPolicyCanonical: typeof SANDBOX_POLICY_CANONICAL;
  sandboxPolicySha256: string;
  allowedReadPathsCanonical: readonly string[];
  allowedReadPathsSha256: string;
}>;

/** Carries the immutable policy and subject binding that a runner must attest at launch. */
export type RunnerLaunchContract = Readonly<{
  capabilityProfile: RunnerLaunchEvidence["capabilityProfile"];
  executionSlot: ExecutionSlot;
  launchBindingSha256: string;
  sandboxPolicyCanonical: RunnerLaunchEvidence["sandboxPolicyCanonical"];
  sandboxPolicySha256: string;
  allowedReadPathsCanonical: readonly string[];
  allowedReadPathsSha256: string;
}>;

/** Canonicalize authorized repository-relative read paths before policy hashing or launch. */
export function canonicalAllowedReadPaths(repositoryRoot: string, allowedReadPaths: readonly string[]): readonly string[] {
  const normalized = allowedReadPaths.map((allowedPath) => {
    if (path.isAbsolute(allowedPath) || allowedPath.includes("\0")) {
      throw new Error("Allowed read paths must be repository relative.");
    }
    const relative = path.relative(repositoryRoot, path.resolve(repositoryRoot, allowedPath)).split(path.sep).join("/");
    if (relative === "" || relative === ".." || relative.startsWith("../")) {
      throw new Error("Allowed read path escapes or aliases the repository root.");
    }
    return relative;
  }).sort((left, right) => left.localeCompare(right, "en"));
  if (new Set(normalized).size !== normalized.length) {
    throw new Error("Allowed read paths must be canonical and unique.");
  }
  return Object.freeze(normalized);
}

/** Hash only the canonical path-policy representation. */
export function canonicalAllowedReadPathsSha256(repositoryRoot: string, allowedReadPaths: readonly string[]): string {
  return sha256(canonicalJson(canonicalAllowedReadPaths(repositoryRoot, allowedReadPaths)));
}

/** Derive the exact code-owned sandbox and read policy for every execution slot. */
export function deriveExpectedExecutionPolicies(
  descriptor: EngineDescriptor,
  repositoryRoot: string,
  candidateId: string,
): ReadonlyMap<ExecutionSlot, ExpectedExecutionPolicy> {
  const candidate = descriptor.candidates[candidateId];
  if (!candidate) throw new Error("Candidate has no descriptor-owned execution policy.");
  const candidateRoot = path.dirname(candidate.sourcePath);
  const policies = new Map<ExecutionSlot, ExpectedExecutionPolicy>();
  const add = (
    executionSlot: ExecutionSlot,
    role: ProcessRole,
    capabilityProfile: ExpectedExecutionPolicy["capabilityProfile"],
    allowedReadPaths: readonly string[],
  ) => {
    const allowedReadPathsCanonical = canonicalAllowedReadPaths(repositoryRoot, allowedReadPaths);
    policies.set(executionSlot, Object.freeze({
      executionSlot,
      role,
      capabilityProfile,
      sandboxPolicyCanonical: SANDBOX_POLICY_CANONICAL,
      sandboxPolicySha256: SANDBOX_POLICY_SHA256,
      allowedReadPathsCanonical,
      allowedReadPathsSha256: sha256(canonicalJson(allowedReadPathsCanonical)),
    }));
  };
  for (const arm of descriptor.engine.armIds) {
    add(`${arm}:arm`, "arm", "arm_visible", [
      descriptor.scripts.armWorker, "src/d01", descriptor.armVisible.rootPath, candidateRoot,
      candidate.manifestPath, descriptor.armVisible.manifestPath, "node_modules", "package.json",
    ]);
    for (const ordinal of [1, 2] as const) add(
      `${arm}:observer:${ordinal}`, "candidate_observer", "candidate_observer", [
        descriptor.scripts.observerWorker, "src/d01", descriptor.armVisible.rootPath, candidateRoot,
        candidate.manifestPath, "node_modules", "package.json",
      ],
    );
    add(`${arm}:evaluator`, "evaluator", "verifier_only", [
      descriptor.scripts.evaluatorWorker, "src/d01", descriptor.armVisible.rootPath,
      descriptor.verifierOnly.rootPath, descriptor.verifierOnly.manifestPath, "node_modules", "package.json",
    ]);
  }
  return policies;
}

/** Bind one immutable candidate/decision launch to its exact execution slot and policies. */
export function createLaunchBindingSha256(input: Pick<RunnerLaunchContract,
  "capabilityProfile" | "executionSlot" | "sandboxPolicySha256" | "allowedReadPathsSha256"
> & Readonly<{
  subjectSha256: string;
}>): string {
  return sha256(canonicalJson(input));
}

/** Hash process-local identity without persisting machine paths or environment values. */
export function createWorkerProcessEvidence(input: Readonly<{
  role: ProcessRole;
  capabilityProfile: "arm_visible" | "candidate_observer" | "verifier_only";
  executionSlot: ExecutionSlot;
  launchBindingSha256: string;
  verifierReadAllowed: boolean;
  verifierReadDenied: boolean;
  candidateReadAllowed: boolean;
  candidateReadDenied: boolean;
}>): WorkerProcessEvidence {
  const processIdentitySha256 = sha256(canonicalJson({
    pid: process.pid,
    parentPid: process.ppid,
    role: input.role,
    capabilityProfile: input.capabilityProfile,
    executionSlot: input.executionSlot,
    launchBindingSha256: input.launchBindingSha256,
  }));
  return WorkerProcessEvidenceSchema.parse({ ...input, processIdentitySha256 });
}

/** Prove the verifier worker can read its package while candidate paths remain denied. */
export function createEvaluatorProcessEvidence(
  repositoryRoot: string,
  executionSlot: ExecutionSlot,
  launchBindingSha256: string,
): WorkerProcessEvidence {
  readFileSync(path.resolve(repositoryRoot, D01_FIXTURE.verifierOnly.groundTruthPath));
  const candidateRoot = path.resolve(
    repositoryRoot,
    path.dirname(candidateDescriptor(D01_FIXTURE.candidateIds[0]).sourcePath),
  );
  let candidateReadDenied = false;
  try {
    readdirSync(candidateRoot);
  }
  catch (error) {
    candidateReadDenied = (error as NodeJS.ErrnoException).code === "ERR_ACCESS_DENIED";
  }
  if (!candidateReadDenied) throw new Error("Evaluator candidate-denial probe did not fail with ERR_ACCESS_DENIED.");
  return createWorkerProcessEvidence({
    role: "evaluator",
    capabilityProfile: "verifier_only",
    executionSlot,
    launchBindingSha256,
    verifierReadAllowed: true,
    verifierReadDenied: false,
    candidateReadAllowed: false,
    candidateReadDenied: true,
  });
}

/** Bind actual runner launch evidence to process-local probe evidence. */
export function bindCapabilityProof(
  launchInput: unknown,
  processInput: unknown,
  expected: RunnerLaunchContract,
  expectedRole: WorkerProcessEvidence["role"],
): CapabilityProof {
  const launch = RunnerLaunchEvidenceSchema.parse(launchInput);
  const worker = WorkerProcessEvidenceSchema.parse(processInput);
  if (launch.capabilityProfile !== expected.capabilityProfile
    || worker.capabilityProfile !== expected.capabilityProfile
    || launch.executionSlot !== expected.executionSlot || worker.executionSlot !== expected.executionSlot
    || launch.launchBindingSha256 !== expected.launchBindingSha256
    || worker.launchBindingSha256 !== expected.launchBindingSha256
    || canonicalJson(launch.sandboxPolicyCanonical) !== canonicalJson(expected.sandboxPolicyCanonical)
    || launch.sandboxPolicySha256 !== expected.sandboxPolicySha256
    || canonicalJson(launch.allowedReadPathsCanonical) !== canonicalJson(expected.allowedReadPathsCanonical)
    || launch.allowedReadPathsSha256 !== expected.allowedReadPathsSha256
    || worker.role !== expectedRole) {
    throw new Error("Runner and worker capability evidence identify different processes or profiles.");
  }
  const proofSha256 = sha256(canonicalJson({ launch, worker }));
  return CapabilityProofSchema.parse({ launch, worker, proofSha256 });
}
