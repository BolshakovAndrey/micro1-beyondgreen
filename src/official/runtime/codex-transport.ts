import { spawn } from "node:child_process";
import { mkdir, mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { OfficialArmHandlerOutputSchema, type OfficialArmHandlerOutput } from "../process/ipc.ts";
import {
  buildCodexExecJsonlCommand,
  CODEX_EXEC_TOTAL_TIMEOUT_MS,
  type CodexExecCommand,
} from "../reasoning/contract.ts";
import { mapCodexExecFailure } from "../reasoning/errors.ts";
import { parseCodexExecJsonl, type CodexExecParseResult } from "../reasoning/parser.ts";
import type { CodexExecJsonlTransport } from "./arm-handler.ts";

const OUTPUT_SCHEMA = Object.freeze({
  type: "object",
  additionalProperties: false,
  required: ["verdict", "rationale", "evidence"],
  properties: {
    verdict: { enum: ["accept", "reject", "abstain"] },
    rationale: { type: "string", minLength: 1 },
    evidence: true,
  },
});

export type CodexProcessResult = Readonly<{
  stdout: string;
  exitCode: number | null;
  timedOut: boolean;
  spawnError: boolean;
}>;

export interface CodexProcessRunner {
  run(input: Readonly<{
    command: CodexExecCommand;
    cwd: string;
  }>): Promise<CodexProcessResult>;
}

class NodeCodexProcessRunner implements CodexProcessRunner {
  public run(input: Readonly<{ command: CodexExecCommand; cwd: string }>): Promise<CodexProcessResult> {
    return new Promise((resolve) => {
      let stdout = "";
      let timedOut = false;
      let settled = false;
      const child = spawn(input.command.executable, input.command.args, {
        cwd: input.cwd,
        shell: false,
        stdio: ["pipe", "pipe", "ignore"],
        env: { ...process.env, NO_COLOR: "1" },
      });
      const timer = setTimeout(() => {
        timedOut = true;
        child.kill("SIGKILL");
      }, CODEX_EXEC_TOTAL_TIMEOUT_MS);
      const finish = (result: CodexProcessResult) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(result);
      };
      child.stdout.setEncoding("utf8");
      child.stdout.on("data", (chunk: string) => { stdout += chunk; });
      child.on("error", () => finish({ stdout, exitCode: null, timedOut: false, spawnError: true }));
      child.on("close", (exitCode) => finish({ stdout, exitCode, timedOut, spawnError: false }));
      child.stdin.end(input.command.stdin);
    });
  }
}

async function initializeEphemeralRepository(root: string): Promise<void> {
  const gitRoot = path.join(root, ".git");
  await mkdir(path.join(gitRoot, "refs", "heads"), { recursive: true });
  await writeFile(path.join(gitRoot, "HEAD"), "ref: refs/heads/beyondgreen-official\n", "utf8");
  await writeFile(path.join(gitRoot, "config"), "[core]\n\trepositoryformatversion = 0\n\tbare = false\n", "utf8");
}

/**
 * Execute exactly one Codex JSONL request in a disposable repository containing
 * only the output schema. The prompt must already contain the complete oracle-free
 * input; the model receives no clean-repository filesystem capability.
 */
export function createCodexExecJsonlTransport(input: Readonly<{
  workingDirectoryRoot: string;
  runner?: CodexProcessRunner;
}>): CodexExecJsonlTransport {
  const runner = input.runner ?? new NodeCodexProcessRunner();
  return {
    async invoke({ prompt, outputSchemaPath }): Promise<CodexExecParseResult<OfficialArmHandlerOutput>> {
      const root = await realpath(input.workingDirectoryRoot);
      const cwd = await mkdtemp(path.join(root, ".official-codex-"));
      try {
        const command = buildCodexExecJsonlCommand({ prompt, outputSchemaPath });
        const schemaPath = path.resolve(cwd, outputSchemaPath);
        const relative = path.relative(cwd, schemaPath);
        if (relative.startsWith("..") || path.isAbsolute(relative)) {
          throw new Error("Codex output schema escaped the disposable repository.");
        }
        await mkdir(path.dirname(schemaPath), { recursive: true });
        await writeFile(schemaPath, `${JSON.stringify(OUTPUT_SCHEMA)}\n`, "utf8");
        await initializeEphemeralRepository(cwd);
        const result = await runner.run({ command, cwd });
        if (result.timedOut) {
          return Object.freeze({ ok: false, failure: mapCodexExecFailure({ source: "timeout", phase: "total" }) });
        }
        if (result.spawnError) {
          return Object.freeze({
            ok: false,
            failure: mapCodexExecFailure({ source: "process", safeClass: "executable_unavailable", exitCode: null }),
          });
        }
        if (result.exitCode !== 0) {
          return Object.freeze({
            ok: false,
            failure: mapCodexExecFailure({ source: "process", safeClass: "nonzero_exit", exitCode: result.exitCode }),
          });
        }
        return parseCodexExecJsonl(result.stdout, OfficialArmHandlerOutputSchema);
      } finally {
        await rm(cwd, { recursive: true, force: true });
      }
    },
  };
}
