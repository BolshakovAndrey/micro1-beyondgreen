import { spawn } from "node:child_process";
import { realpath } from "node:fs/promises";

import type {
  IsolationBackendResult,
  IsolationLaunchSpec,
  OsIsolationBackend,
} from "./process-launcher.ts";

const SANDBOX_EXECUTABLE = "/usr/bin/sandbox-exec";
const MAX_OUTPUT_BYTES = 1_048_576;

export type SandboxCommandResult = Readonly<{
  stdout: string;
  exitCode: number | null;
  spawnError: boolean;
  spawnErrorCode?: string | null;
  signal?: NodeJS.Signals | null;
}>;

export interface SandboxCommandRunner {
  run(input: Readonly<{
    executable: string;
    args: readonly string[];
    cwd: string;
    stdin: string;
    environment: Readonly<Record<string, string>>;
  }>): Promise<SandboxCommandResult>;
}

class NodeSandboxCommandRunner implements SandboxCommandRunner {
  public run(input: Readonly<{
    executable: string;
    args: readonly string[];
    cwd: string;
    stdin: string;
    environment: Readonly<Record<string, string>>;
  }>): Promise<SandboxCommandResult> {
    return new Promise((resolve) => {
      let stdout = "";
      let settled = false;
      const child = spawn(input.executable, input.args, {
        cwd: input.cwd,
        shell: false,
        stdio: ["pipe", "pipe", "ignore"],
        env: { PATH: "/usr/bin:/bin", NO_COLOR: "1", ...input.environment },
      });
      const finish = (result: SandboxCommandResult) => {
        if (settled) return;
        settled = true;
        resolve(result);
      };
      child.stdout.setEncoding("utf8");
      child.stdout.on("data", (chunk: string) => {
        stdout += chunk;
        if (Buffer.byteLength(stdout, "utf8") > MAX_OUTPUT_BYTES) child.kill("SIGKILL");
      });
      child.on("error", (error: NodeJS.ErrnoException) => finish({
        stdout,
        exitCode: null,
        spawnError: true,
        spawnErrorCode: error.code ?? null,
      }));
      child.on("close", (exitCode, signal) => finish({ stdout, exitCode, spawnError: false, signal }));
      child.stdin.end(input.stdin);
    });
  }
}

/** Build the macOS half of the combined sandbox: Seatbelt owns network denial. */
export async function buildMacOsSandboxProfile(input: Readonly<{
  spec: IsolationLaunchSpec;
  nodeExecutable: string;
}>): Promise<string> {
  await realpath(input.nodeExecutable);
  return [
    "(version 1)",
    "(allow default)",
    "(deny network*)",
  ].join("\n");
}

/**
 * Execute one role worker under two independent controls: macOS Seatbelt denies
 * network while Node Permission Model enforces the canonical filesystem allowlist.
 */
export function createMacOsSandboxBackend(input: Readonly<{
  nodeExecutable?: string;
  runner?: SandboxCommandRunner;
}> = {}): OsIsolationBackend {
  const nodeExecutable = input.nodeExecutable ?? process.execPath;
  const runner = input.runner ?? new NodeSandboxCommandRunner();
  return {
    async execute(spec): Promise<IsolationBackendResult> {
      if (process.platform !== "darwin" && !input.runner) {
        throw new Error("The macOS sandbox backend is unavailable on this platform.");
      }
      const profile = await buildMacOsSandboxProfile({ spec, nodeExecutable });
      const result = await runner.run({
        executable: SANDBOX_EXECUTABLE,
        args: [
          "-p",
          profile,
          nodeExecutable,
          "--permission",
          ...spec.canonicalAllowReadPaths.flatMap((entry) => ["--allow-fs-read", entry]),
          "--allow-fs-write",
          spec.cwd,
          "--experimental-strip-types",
          spec.entrypoint.modulePath,
        ],
        cwd: spec.cwd,
        stdin: spec.requestJsonl,
        environment: Object.freeze({
          OFFICIAL_REPOSITORY_ROOT: spec.repositoryRoot,
          OFFICIAL_ROLE: spec.role,
        }),
      });
      if (result.spawnError || (result.exitCode !== 0 && result.exitCode !== 1)) {
        throw new Error(`macOS sandbox role process failed outside the bounded IPC exit contract (${result.exitCode ?? result.spawnErrorCode ?? result.signal ?? "spawn"}).`);
      }
      return Object.freeze({
        stdout: result.stdout,
        exitCode: result.exitCode as 0 | 1,
        reasoningInvocationCount: 0,
        retryCount: 0,
        attestation: Object.freeze({
          repositoryRoot: spec.repositoryRoot,
          cwd: spec.cwd,
          filesystemReadAllowlistEnforced: true,
          networkDenied: true,
          isolatedCwdEnforced: true,
          canonicalAllowReadPaths: spec.canonicalAllowReadPaths,
          canonicalDenyReadPaths: spec.canonicalDenyReadPaths,
          attemptOrdinal: 1,
          retryCount: 0,
        }),
      });
    },
  };
}
