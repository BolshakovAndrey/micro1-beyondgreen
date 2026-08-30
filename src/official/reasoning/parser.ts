import { z } from "zod";

import { CODEX_EXEC_JSONL_ADAPTER_ID, CODEX_EXEC_MODEL } from "./contract.ts";
import {
  mapCodexExecFailure,
  type CodexExecFailure,
  type CodexExecFailureInput,
} from "./errors.ts";

const UsageSchema = z.object({
  input_tokens: z.number().int().nonnegative(),
  cached_input_tokens: z.number().int().nonnegative().optional(),
  output_tokens: z.number().int().nonnegative(),
}).passthrough();

const EventSchema = z.object({ type: z.enum([
  "thread.started",
  "turn.started",
  "item.started",
  "item.updated",
  "item.completed",
  "turn.completed",
  "turn.failed",
  "error",
]) }).passthrough();

export interface CodexExecTokenUsage {
  readonly inputTokens: number;
  readonly cachedInputTokens: number | null;
  readonly outputTokens: number;
}

export interface CodexExecParseSuccess<Output> {
  readonly ok: true;
  readonly adapterId: typeof CODEX_EXEC_JSONL_ADAPTER_ID;
  readonly model: typeof CODEX_EXEC_MODEL;
  readonly output: Output;
  readonly eventCount: number;
  readonly tokenUsage: CodexExecTokenUsage | "not_measured";
  readonly invocationCount: 1;
  readonly retryCount: 0;
  readonly monetaryCost: "not_applicable_or_not_measured";
  readonly perRunUsdCalculatedOrEstimated: false;
}

export interface CodexExecParseFailure {
  readonly ok: false;
  readonly failure: CodexExecFailure;
}

export type CodexExecParseResult<Output> = CodexExecParseSuccess<Output> | CodexExecParseFailure;

type ParserFailureClass = Extract<CodexExecFailureInput, { source: "parser" }>["safeClass"];

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

function failure(safeClass: ParserFailureClass): CodexExecParseFailure {
  return Object.freeze({ ok: false, failure: mapCodexExecFailure({ source: "parser", safeClass }) });
}

/**
 * Parse an offline-captured Codex JSONL stream. No subprocess, network, workspace
 * write, stderr inspection, or model invocation occurs here.
 */
export function parseCodexExecJsonl<Output>(
  jsonl: string,
  outputSchema: z.ZodType<Output>,
): CodexExecParseResult<Output> {
  if (jsonl.length === 0 || jsonl.includes("\r")) return failure("malformed_jsonl");
  const lines = jsonl.endsWith("\n") ? jsonl.slice(0, -1).split("\n") : jsonl.split("\n");
  if (lines.length === 0 || lines.some((line) => line.length === 0)) return failure("malformed_jsonl");

  const events: Array<Record<string, unknown>> = [];
  for (const line of lines) {
    let decoded: unknown;
    try {
      decoded = JSON.parse(line);
    } catch {
      return failure("malformed_jsonl");
    }
    const event = EventSchema.safeParse(decoded);
    if (!event.success) return failure("unsupported_event");
    events.push(event.data);
  }

  if (events.some(({ type }) => type === "error" || type === "turn.failed")) return failure("stream_error");
  if (events[0]?.type !== "thread.started" || events[1]?.type !== "turn.started"
    || events.at(-1)?.type !== "turn.completed"
    || events.filter(({ type }) => type === "thread.started").length !== 1
    || events.filter(({ type }) => type === "turn.started").length !== 1
    || events.filter(({ type }) => type === "turn.completed").length !== 1) {
    return failure("incomplete_stream");
  }

  const finalTexts: string[] = [];
  for (const event of events) {
    if (event.type !== "item.completed") continue;
    const item = event.item;
    if (typeof item !== "object" || item === null || Array.isArray(item)) return failure("policy_violation");
    const record = item as Record<string, unknown>;
    if (record.type === "agent_message") {
      if (typeof record.text !== "string") return failure("policy_violation");
      finalTexts.push(record.text);
    }
  }
  if (finalTexts.length === 0) return failure("missing_final_output");
  if (finalTexts.length !== 1) return failure("multiple_final_outputs");

  let finalOutput: unknown;
  try {
    finalOutput = JSON.parse(finalTexts[0]!);
  } catch {
    return failure("invalid_final_output");
  }
  const validatedOutput = outputSchema.safeParse(finalOutput);
  if (!validatedOutput.success) return failure("invalid_final_output");

  const completed = events.at(-1)!;
  let tokenUsage: CodexExecTokenUsage | "not_measured" = "not_measured";
  if (completed.usage !== undefined) {
    const usage = UsageSchema.safeParse(completed.usage);
    if (!usage.success) return failure("policy_violation");
    tokenUsage = Object.freeze({
      inputTokens: usage.data.input_tokens,
      cachedInputTokens: usage.data.cached_input_tokens ?? null,
      outputTokens: usage.data.output_tokens,
    });
  }

  const success: CodexExecParseSuccess<Output> = {
    ok: true,
    adapterId: CODEX_EXEC_JSONL_ADAPTER_ID,
    model: CODEX_EXEC_MODEL,
    output: deepFreeze(validatedOutput.data),
    eventCount: events.length,
    tokenUsage,
    invocationCount: 1,
    retryCount: 0,
    monetaryCost: "not_applicable_or_not_measured",
    perRunUsdCalculatedOrEstimated: false,
  };
  return Object.freeze(success);
}
