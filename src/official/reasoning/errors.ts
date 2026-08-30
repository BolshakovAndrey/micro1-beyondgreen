import { z } from "zod";

import { CODEX_EXEC_JSONL_ADAPTER_ID } from "./contract.ts";

export const CodexExecFailureInputSchema = z.discriminatedUnion("source", [
  z.object({
    source: z.literal("timeout"),
    phase: z.enum(["engine", "finalization", "total"]),
  }).strict(),
  z.object({
    source: z.literal("process"),
    safeClass: z.enum([
      "executable_unavailable",
      "model_unavailable",
      "transport",
      "rate_limit",
      "authentication",
      "nonzero_exit",
    ]),
    exitCode: z.number().int().nullable(),
  }).strict(),
  z.object({
    source: z.literal("parser"),
    safeClass: z.enum([
      "malformed_jsonl",
      "unsupported_event",
      "stream_error",
      "incomplete_stream",
      "missing_final_output",
      "multiple_final_outputs",
      "invalid_final_output",
      "policy_violation",
    ]),
  }).strict(),
]);
export type CodexExecFailureInput = z.infer<typeof CodexExecFailureInputSchema>;

export type CodexExecFailureCode =
  | "ENGINE_TIMEOUT"
  | "FINALIZATION_TIMEOUT"
  | "TOTAL_TIMEOUT"
  | "EXECUTABLE_UNAVAILABLE"
  | "MODEL_UNAVAILABLE"
  | "MODEL_TRANSPORT_FAILURE"
  | "RATE_LIMITED"
  | "AUTHENTICATION_FAILURE"
  | "NONZERO_EXIT"
  | "MALFORMED_JSONL"
  | "UNSUPPORTED_EVENT"
  | "STREAM_ERROR"
  | "INCOMPLETE_STREAM"
  | "MISSING_FINAL_OUTPUT"
  | "MULTIPLE_FINAL_OUTPUTS"
  | "INVALID_FINAL_OUTPUT"
  | "POLICY_VIOLATION";

export interface CodexExecFailure {
  readonly adapterId: typeof CODEX_EXEC_JSONL_ADAPTER_ID;
  readonly outcome: "abstain";
  readonly code: CodexExecFailureCode;
  readonly invocationCount: 1;
  readonly retryAllowed: false;
  readonly substituteModelAllowed: false;
  readonly monetaryCost: "not_applicable_or_not_measured";
  readonly perRunUsdCalculatedOrEstimated: false;
}

const FAILURE_CODES: Record<string, CodexExecFailureCode> = {
  "timeout:engine": "ENGINE_TIMEOUT",
  "timeout:finalization": "FINALIZATION_TIMEOUT",
  "timeout:total": "TOTAL_TIMEOUT",
  "process:executable_unavailable": "EXECUTABLE_UNAVAILABLE",
  "process:model_unavailable": "MODEL_UNAVAILABLE",
  "process:transport": "MODEL_TRANSPORT_FAILURE",
  "process:rate_limit": "RATE_LIMITED",
  "process:authentication": "AUTHENTICATION_FAILURE",
  "process:nonzero_exit": "NONZERO_EXIT",
  "parser:malformed_jsonl": "MALFORMED_JSONL",
  "parser:unsupported_event": "UNSUPPORTED_EVENT",
  "parser:stream_error": "STREAM_ERROR",
  "parser:incomplete_stream": "INCOMPLETE_STREAM",
  "parser:missing_final_output": "MISSING_FINAL_OUTPUT",
  "parser:multiple_final_outputs": "MULTIPLE_FINAL_OUTPUTS",
  "parser:invalid_final_output": "INVALID_FINAL_OUTPUT",
  "parser:policy_violation": "POLICY_VIOLATION",
};

/** Map only already-safe process/parser state; raw stderr is deliberately excluded. */
export function mapCodexExecFailure(input: CodexExecFailureInput): CodexExecFailure {
  const parsed = CodexExecFailureInputSchema.parse(input);
  const detail = parsed.source === "timeout" ? parsed.phase : parsed.safeClass;
  const code = FAILURE_CODES[`${parsed.source}:${detail}`];
  if (!code) throw new Error("Unsupported codex exec failure state.");
  return Object.freeze({
    adapterId: CODEX_EXEC_JSONL_ADAPTER_ID,
    outcome: "abstain",
    code,
    invocationCount: 1,
    retryAllowed: false,
    substituteModelAllowed: false,
    monetaryCost: "not_applicable_or_not_measured",
    perRunUsdCalculatedOrEstimated: false,
  });
}
