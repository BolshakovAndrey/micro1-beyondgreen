import { mkdtemp, realpath, rm } from "node:fs/promises";
import path from "node:path";

import type { RoleCapabilityPlan } from "../adapters/types.ts";
import type { OfficialRoleProcessLauncher } from "../execution/production-composition.ts";
import { OfficialProcessFailureSchema } from "../process/ipc.ts";

const MAX_STDOUT_BYTES = 1_048_576;

export type IsolationLaunchSpec = Readonly<{
  repositoryRoot: string;
  cwd: string;
  role: RoleCapabilityPlan["role"];
  entrypoint: Readonly<{ modulePath: string; exportName: string }>;
  canonicalAllowReadPaths: readonly string[];
  canonicalDenyReadPaths: readonly string[];
  networkAccess: "deny";
  requestJsonl: string;
  attemptOrdinal: 1;
  retryLimit: 0;
}>;

export type IsolationAttestation = Readonly<{
  repositoryRoot: string;
  cwd: string;
  filesystemReadAllowlistEnforced: true;
  networkDenied: true;
  isolatedCwdEnforced: true;
  canonicalAllowReadPaths: readonly string[];
  canonicalDenyReadPaths: readonly string[];
  attemptOrdinal: 1;
  retryCount: 0;
}>;

export type IsolationBackendResult = Readonly<{
  stdout: string;
  exitCode: 0 | 1;
  reasoningInvocationCount: 0 | 1;
  retryCount: 0;
  attestation: IsolationAttestation;
}>;

/** OS-backed executor. Implementations must enforce the supplied policy, not merely report it. */
export interface OsIsolationBackend {
  execute(spec: IsolationLaunchSpec): Promise<IsolationBackendResult>;
}

export class ProcessIsolationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "ProcessIsolationError";
  }
}

function isWithin(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function assertRepositoryRelative(value: string): void {
  const segments = value.split("/");
  if (path.posix.isAbsolute(value) || /^[A-Za-z]:[\\/]/u.test(value) || value.includes("\\")
    || value.includes("\0") || segments.some((segment) => segment === "" || segment === "." || segment === "..")) {
    throw new ProcessIsolationError("Capability paths must be canonical repository-relative paths.");
  }
}

async function canonicalizePaths(repositoryRoot: string, values: readonly string[]): Promise<readonly string[]> {
  const canonical: string[] = [];
  for (const value of values) {
    assertRepositoryRelative(value);
    const logicalTarget = path.resolve(repositoryRoot, ...value.split("/"));
    if (!isWithin(repositoryRoot, logicalTarget)) {
      throw new ProcessIsolationError("Capability path escapes the repository root.");
    }
    const physicalTarget = await realpath(logicalTarget);
    if (!isWithin(repositoryRoot, physicalTarget)) {
      throw new ProcessIsolationError("Capability realpath escapes the repository root.");
    }
    canonical.push(physicalTarget);
  }
  canonical.sort((left, right) => left.localeCompare(right, "en"));
  if (new Set(canonical).size !== canonical.length) {
    throw new ProcessIsolationError("Capability paths must remain unique after realpath resolution.");
  }
  return Object.freeze(canonical);
}

function pathsOverlap(left: string, right: string): boolean {
  return isWithin(left, right) || isWithin(right, left);
}

function exactPaths(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function parseSingleJsonLine(stdout: string): unknown {
  if (Buffer.byteLength(stdout, "utf8") > MAX_STDOUT_BYTES) {
    throw new ProcessIsolationError("Isolated process output exceeds the IPC byte limit.");
  }
  const lines = stdout.split(/\r?\n/u).filter((line) => line.length > 0);
  if (lines.length !== 1) throw new ProcessIsolationError("Isolated process must emit exactly one JSONL response.");
  try {
    return JSON.parse(lines[0]!);
  } catch {
    throw new ProcessIsolationError("Isolated process emitted malformed JSON.");
  }
}

function assertAttestation(
  attestation: IsolationAttestation,
  spec: IsolationLaunchSpec,
  retryCount: number,
): void {
  if (attestation.filesystemReadAllowlistEnforced !== true || attestation.networkDenied !== true
    || attestation.isolatedCwdEnforced !== true || attestation.repositoryRoot !== spec.repositoryRoot
    || attestation.cwd !== spec.cwd || attestation.attemptOrdinal !== 1
    || attestation.retryCount !== 0 || retryCount !== 0
    || !exactPaths(attestation.canonicalAllowReadPaths, spec.canonicalAllowReadPaths)
    || !exactPaths(attestation.canonicalDenyReadPaths, spec.canonicalDenyReadPaths)) {
    throw new ProcessIsolationError("OS isolation backend did not attest the exact filesystem and network policy.");
  }
}

/**
 * Create the single-attempt production launcher. The injected backend is accepted
 * only when it attests an exact read allowlist, explicit denies, network denial,
 * and a per-launch working directory.
 */
export function createProductionProcessLauncher(input: Readonly<{
  repositoryRoot: string;
  workingDirectoryRoot: string;
  backend: OsIsolationBackend;
}>): OfficialRoleProcessLauncher {
  return async ({ role, capability, request, attemptOrdinal }) => {
    if (attemptOrdinal !== 1 || capability.role !== role || capability.networkAllowed !== false
      || capability.entrypoint.symbolKind !== "runtime") {
      throw new ProcessIsolationError("Launch request violates the immutable role or attempt policy.");
    }
    const repositoryRoot = await realpath(input.repositoryRoot);
    const workingDirectoryRoot = await realpath(input.workingDirectoryRoot);
    if (!isWithin(repositoryRoot, workingDirectoryRoot)) {
      throw new ProcessIsolationError("Working-directory root must remain inside the clean repository.");
    }
    const canonicalAllowReadPaths = await canonicalizePaths(repositoryRoot, capability.allowReadPaths);
    const canonicalDenyReadPaths = await canonicalizePaths(repositoryRoot, capability.denyReadPaths);
    if (canonicalAllowReadPaths.some((allowed) => canonicalDenyReadPaths.some((denied) => pathsOverlap(allowed, denied)))) {
      throw new ProcessIsolationError("Canonical allow and deny capabilities overlap.");
    }
    assertRepositoryRelative(capability.entrypoint.modulePath);
    const entrypoint = await realpath(path.resolve(repositoryRoot, ...capability.entrypoint.modulePath.split("/")));
    if (!isWithin(repositoryRoot, entrypoint)
      || !canonicalAllowReadPaths.some((allowed) => isWithin(allowed, entrypoint))) {
      throw new ProcessIsolationError("Runtime entrypoint is not covered by the canonical read allowlist.");
    }

    const cwd = await mkdtemp(path.join(workingDirectoryRoot, ".official-role-"));
    try {
      const spec: IsolationLaunchSpec = Object.freeze({
        repositoryRoot,
        cwd,
        role,
        entrypoint: Object.freeze({ modulePath: entrypoint, exportName: capability.entrypoint.exportName }),
        canonicalAllowReadPaths,
        canonicalDenyReadPaths,
        networkAccess: "deny",
        requestJsonl: `${JSON.stringify(request)}\n`,
        attemptOrdinal: 1,
        retryLimit: 0,
      });
      const result = await input.backend.execute(spec);
      assertAttestation(result.attestation, spec, result.retryCount);
      const expectedReasoning = role === "arm"
        && request !== null && typeof request === "object"
        && "arm" in request && request.arm === "beyondgreen" ? 1 : 0;
      if (result.reasoningInvocationCount !== expectedReasoning) {
        throw new ProcessIsolationError("Isolated process violated the frozen reasoning invocation policy.");
      }
      const response = parseSingleJsonLine(result.stdout);
      if ((result.exitCode === 1) !== OfficialProcessFailureSchema.safeParse(response).success) {
        throw new ProcessIsolationError("Isolated process exit status is inconsistent with its fail-closed response.");
      }
      return Object.freeze({
        response,
        reasoningInvocationCount: result.reasoningInvocationCount,
        retryCount: 0,
      });
    } finally {
      await rm(cwd, { recursive: true, force: true });
    }
  };
}
