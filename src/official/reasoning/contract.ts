import path from "node:path";

import { z } from "zod";

/** Frozen identity of the optional live reasoning transport. */
export const CODEX_EXEC_JSONL_ADAPTER_ID = "codex-exec-jsonl-v1" as const;
export const CODEX_EXEC_MODEL = "gpt-5.6-sol" as const;
export const CODEX_EXEC_TOTAL_TIMEOUT_MS = 180_000 as const;
export const CODEX_EXEC_ENGINE_TIMEOUT_MS = 165_000 as const;
export const CODEX_EXEC_FINALIZATION_RESERVE_MS = 15_000 as const;
export const CODEX_EXEC_MAX_INVOCATIONS = 1 as const;
export const CODEX_EXEC_MAX_RETRIES = 0 as const;

const RepositoryRelativeJsonPathSchema = z.string().min(1).endsWith(".json").superRefine((value, context) => {
  const segments = value.split("/");
  if (path.posix.isAbsolute(value) || /^[A-Za-z]:[\\/]/u.test(value) || value.includes("\\")
    || value.includes("\0") || segments.some((segment) => segment === "" || segment === "." || segment === "..")) {
    context.addIssue({ code: "custom", message: "Output schema path must be canonical and repository relative." });
  }
});

export const CodexExecCommandInputSchema = z.object({
  outputSchemaPath: RepositoryRelativeJsonPathSchema,
  prompt: z.string().min(1).refine((value) => !value.includes("\0"), "Prompt must not contain NUL bytes."),
}).strict();
export type CodexExecCommandInput = z.infer<typeof CodexExecCommandInputSchema>;

export interface CodexExecCommand {
  readonly adapterId: typeof CODEX_EXEC_JSONL_ADAPTER_ID;
  readonly executable: "codex";
  readonly args: readonly string[];
  readonly stdin: string;
  readonly shell: false;
  readonly invocationLimit: typeof CODEX_EXEC_MAX_INVOCATIONS;
  readonly retryLimit: typeof CODEX_EXEC_MAX_RETRIES;
  readonly totalTimeoutMs: typeof CODEX_EXEC_TOTAL_TIMEOUT_MS;
  readonly engineTimeoutMs: typeof CODEX_EXEC_ENGINE_TIMEOUT_MS;
  readonly finalizationReserveMs: typeof CODEX_EXEC_FINALIZATION_RESERVE_MS;
}

/**
 * Build the frozen codex-exec-jsonl-v1 invocation without executing it or reading
 * authentication state. The prompt travels over stdin so it never enters a shell.
 */
export function buildCodexExecJsonlCommand(input: CodexExecCommandInput): CodexExecCommand {
  const parsed = CodexExecCommandInputSchema.parse(input);
  return Object.freeze({
    adapterId: CODEX_EXEC_JSONL_ADAPTER_ID,
    executable: "codex",
    args: Object.freeze([
      "exec",
      "--ephemeral",
      "--ignore-user-config",
      "--json",
      "--output-schema",
      parsed.outputSchemaPath,
      "--sandbox",
      "read-only",
      "--model",
      CODEX_EXEC_MODEL,
      "-",
    ]),
    stdin: parsed.prompt,
    shell: false,
    invocationLimit: CODEX_EXEC_MAX_INVOCATIONS,
    retryLimit: CODEX_EXEC_MAX_RETRIES,
    totalTimeoutMs: CODEX_EXEC_TOTAL_TIMEOUT_MS,
    engineTimeoutMs: CODEX_EXEC_ENGINE_TIMEOUT_MS,
    finalizationReserveMs: CODEX_EXEC_FINALIZATION_RESERVE_MS,
  });
}

export interface CodexExecDeadlinePlan {
  readonly startedAtMs: number;
  readonly engineDeadlineAtMs: number;
  readonly totalDeadlineAtMs: number;
  readonly engineTimeoutMs: typeof CODEX_EXEC_ENGINE_TIMEOUT_MS;
  readonly finalizationReserveMs: typeof CODEX_EXEC_FINALIZATION_RESERVE_MS;
  readonly totalTimeoutMs: typeof CODEX_EXEC_TOTAL_TIMEOUT_MS;
}

/** Create absolute monotonic-clock deadlines for one invocation. */
export function createCodexExecDeadlinePlan(startedAtMs: number): CodexExecDeadlinePlan {
  if (!Number.isFinite(startedAtMs) || startedAtMs < 0) {
    throw new Error("startedAtMs must be a finite non-negative monotonic time.");
  }
  return Object.freeze({
    startedAtMs,
    engineDeadlineAtMs: startedAtMs + CODEX_EXEC_ENGINE_TIMEOUT_MS,
    totalDeadlineAtMs: startedAtMs + CODEX_EXEC_TOTAL_TIMEOUT_MS,
    engineTimeoutMs: CODEX_EXEC_ENGINE_TIMEOUT_MS,
    finalizationReserveMs: CODEX_EXEC_FINALIZATION_RESERVE_MS,
    totalTimeoutMs: CODEX_EXEC_TOTAL_TIMEOUT_MS,
  });
}
