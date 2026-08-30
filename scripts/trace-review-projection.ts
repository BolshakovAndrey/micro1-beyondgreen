#!/usr/bin/env node
/** Produces a content-free structural projection of an immutable Codex JSONL trace. */

import { readFileSync } from "node:fs";
import { TextDecoder } from "node:util";
import { createHash } from "node:crypto";
import { z } from "zod";

const TRACE_ID_PATTERN = /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/u;
const EVENT_TYPES = new Set([
  "thread.started",
  "turn.started",
  "item.started",
  "item.completed",
  "turn.completed",
  "error",
]);
const TOOL_ITEM_TYPES = new Set([
  "command_execution",
  "file_change",
  "mcp_tool_call",
  "web_search",
  "computer_use",
  "image_generation",
]);
const ASSISTANT_ITEM_TYPES = new Set(["agent_message", "reasoning"]);
const COMPLETION_STATUSES = new Set(["in_progress", "completed", "failed"]);

const CompletionSchema = z.object({
  eventStatus: z.enum(["none", "in_progress", "completed", "failed", "unknown"]),
  itemStatus: z.enum(["none", "in_progress", "completed", "failed", "unknown"]),
  exitCode: z.number().int().nullable(),
}).strict();

export const ReviewProjectionEventSchema = z.object({
  sequence: z.number().int().positive(),
  temporalOrder: z.number().int().positive(),
  eventType: z.enum([
    "thread.started",
    "turn.started",
    "item.started",
    "item.completed",
    "turn.completed",
    "error",
    "unknown",
  ]),
  itemType: z.enum([
    "none",
    "agent_message",
    "reasoning",
    "command_execution",
    "file_change",
    "mcp_tool_call",
    "web_search",
    "computer_use",
    "image_generation",
    "unknown",
  ]),
  role: z.enum(["system", "assistant", "tool", "unknown"]),
  hasToolCall: z.boolean(),
  hasToolResult: z.boolean(),
  completion: CompletionSchema,
}).strict();

export const ReviewProjectionSchema = z.object({
  schemaVersion: z.literal("micro1-safe-trace-review-projection@1.0.0"),
  traceId: z.string().regex(TRACE_ID_PATTERN),
  sourceEncoding: z.literal("utf-8"),
  chronology: z.object({
    basis: z.literal("immutable_jsonl_source_order"),
    complete: z.literal(true),
  }).strict(),
  eventCount: z.number().int().nonnegative(),
  sourceBytes: z.number().int().positive(),
  sourceSha256: z.string().regex(/^[a-f0-9]{64}$/u),
  contentIncluded: z.literal(false),
  toolArgumentsIncluded: z.literal(false),
  externalPathsIncluded: z.literal(false),
  environmentValuesIncluded: z.literal(false),
  events: z.array(ReviewProjectionEventSchema),
}).strict();

export type ReviewProjection = z.infer<typeof ReviewProjectionSchema>;

type UnknownRecord = Readonly<Record<string, unknown>>;

const asRecord = (value: unknown, label: string): UnknownRecord => {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    throw new Error(`${label} must be a JSON object.`);
  }
  return value as UnknownRecord;
};

const safeEventType = (value: unknown): ReviewProjection["events"][number]["eventType"] =>
  typeof value === "string" && EVENT_TYPES.has(value)
    ? value as ReviewProjection["events"][number]["eventType"]
    : "unknown";

const safeItemType = (value: unknown): ReviewProjection["events"][number]["itemType"] => {
  if (typeof value !== "string") return "none";
  if (TOOL_ITEM_TYPES.has(value) || ASSISTANT_ITEM_TYPES.has(value)) {
    return value as ReviewProjection["events"][number]["itemType"];
  }
  return "unknown";
};

const safeStatus = (value: unknown): "none" | "in_progress" | "completed" | "failed" | "unknown" => {
  if (value === undefined || value === null) return "none";
  return typeof value === "string" && COMPLETION_STATUSES.has(value)
    ? value as "in_progress" | "completed" | "failed"
    : "unknown";
};

const roleFor = (
  eventType: ReviewProjection["events"][number]["eventType"],
  itemType: ReviewProjection["events"][number]["itemType"],
): ReviewProjection["events"][number]["role"] => {
  if (TOOL_ITEM_TYPES.has(itemType)) return "tool";
  if (ASSISTANT_ITEM_TYPES.has(itemType)) return "assistant";
  if (eventType === "thread.started" || eventType === "turn.started" || eventType === "turn.completed") {
    return "system";
  }
  return "unknown";
};

/** Parse immutable JSONL bytes and retain only allowlisted structural fields. */
export const projectTraceBytes = (traceId: string, bytes: Uint8Array): ReviewProjection => {
  if (!TRACE_ID_PATTERN.test(traceId)) throw new Error("Trace ID is not allowlisted by syntax.");

  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  const lines = text.split(/\r?\n/u).filter((line) => line.length > 0);
  const events = lines.map((line, index) => {
    const record = asRecord(JSON.parse(line), `JSONL event ${index + 1}`);
    const item = record.item === undefined ? {} : asRecord(record.item, `JSONL event ${index + 1} item`);
    const eventType = safeEventType(record.type);
    const itemType = safeItemType(item.type);
    const toolItem = TOOL_ITEM_TYPES.has(itemType);
    const eventCompleted = eventType === "item.completed";
    const rawExitCode = item.exit_code ?? item.exitCode ?? record.exit_code ?? record.exitCode;

    return {
      sequence: index + 1,
      temporalOrder: index + 1,
      eventType,
      itemType,
      role: roleFor(eventType, itemType),
      hasToolCall: toolItem && eventType === "item.started",
      hasToolResult: toolItem && eventCompleted,
      completion: {
        eventStatus: safeStatus(record.status),
        itemStatus: safeStatus(item.status),
        exitCode: typeof rawExitCode === "number" && Number.isInteger(rawExitCode) ? rawExitCode : null,
      },
    };
  });

  return ReviewProjectionSchema.parse({
    schemaVersion: "micro1-safe-trace-review-projection@1.0.0",
    traceId,
    sourceEncoding: "utf-8",
    chronology: { basis: "immutable_jsonl_source_order", complete: true },
    eventCount: events.length,
    sourceBytes: bytes.byteLength,
    sourceSha256: createHash("sha256").update(bytes).digest("hex"),
    contentIncluded: false,
    toolArgumentsIncluded: false,
    externalPathsIncluded: false,
    environmentValuesIncluded: false,
    events,
  });
};

/** CLI entrypoint used only as the stdin projector behind the protected exact-ID wrapper. */
export const main = (arguments_: readonly string[] = process.argv.slice(2), input?: Uint8Array): number => {
  const [mode, traceId, ...rest] = arguments_;
  if (mode !== "review-projection" || !traceId || rest.length > 0) {
    throw new Error("Usage: micro1-safe-trace review-projection TRACE_ID");
  }
  const bytes = input ?? readFileSync(0);
  process.stdout.write(`${JSON.stringify(projectTraceBytes(traceId, bytes))}\n`);
  return 0;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    process.exitCode = main();
  }
  catch (error) {
    process.stderr.write(`TRACE_REVIEW_PROJECTION_ERROR ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
