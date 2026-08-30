/** Verifies the structural trace projection cannot disclose raw trace content. */

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  projectTraceBytes,
  ReviewProjectionSchema,
} from "../scripts/trace-review-projection.ts";

const encodeJsonl = (records: readonly unknown[]): Uint8Array =>
  Buffer.from(`${records.map((record) => JSON.stringify(record)).join("\n")}\n`, "utf8");

test("projects only allowlisted schema fields and preserves source chronology", () => {
  const source = encodeJsonl([
    { type: "thread.started", thread_id: "private-runtime-id" },
    { type: "turn.started", timestamp: "private-timestamp" },
    {
      type: "item.started",
      item: {
        type: "command_execution",
        command: "print forbidden arguments",
        status: "in_progress",
      },
    },
    {
      type: "item.completed",
      item: {
        type: "command_execution",
        command: "print forbidden arguments",
        aggregated_output: "private output",
        status: "completed",
        exit_code: 7,
      },
    },
    { type: "turn.completed", usage: { input_tokens: 123 } },
  ]);
  const projection = projectTraceBytes(
    "TRC-TEST-001",
    source,
  );

  assert.deepEqual(ReviewProjectionSchema.parse(projection), projection);
  assert.deepEqual(projection.events.map(({ sequence, temporalOrder }) => [sequence, temporalOrder]), [
    [1, 1], [2, 2], [3, 3], [4, 4], [5, 5],
  ]);
  assert.equal(projection.events[2]?.hasToolCall, true);
  assert.equal(projection.events[3]?.hasToolResult, true);
  assert.equal(projection.events[3]?.completion.exitCode, 7);
  assert.equal(projection.sourceBytes, source.byteLength);
  assert.equal(projection.sourceSha256, createHash("sha256").update(source).digest("hex"));
  assert.equal(projection.contentIncluded, false);
});

test("omits content, tool arguments, paths, environment values, identifiers, and usage", () => {
  const forbidden = [
    "sensitive prompt",
    "tool argument secret",
    "/" + "Users/example/private/file.ts",
    "MICRO1_PRIVATE_DENYLIST=/private/value",
    "private-runtime-id",
    "12345-token-count",
  ];
  const projection = projectTraceBytes(
    "TRC-TEST-PRIVACY-001",
    encodeJsonl([
      {
        type: "item.completed",
        timestamp: forbidden[5],
        item: {
          type: "agent_message",
          text: forbidden[0],
          arguments: forbidden[1],
          cwd: forbidden[2],
          environment: forbidden[3],
          id: forbidden[4],
          status: "completed",
        },
      },
    ]),
  );
  const serialized = JSON.stringify(projection);

  for (const value of forbidden) assert.doesNotMatch(serialized, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "u"));
  assert.equal(projection.toolArgumentsIncluded, false);
  assert.equal(projection.externalPathsIncluded, false);
  assert.equal(projection.environmentValuesIncluded, false);
});

test("maps unknown event and item types to fixed non-disclosing values", () => {
  const projection = projectTraceBytes(
    "TRC-TEST-UNKNOWN-001",
    encodeJsonl([{ type: "private-event-name", item: { type: "private-item-name" } }]),
  );

  assert.equal(projection.events[0]?.eventType, "unknown");
  assert.equal(projection.events[0]?.itemType, "unknown");
  assert.equal(projection.events[0]?.role, "unknown");
  assert.doesNotMatch(JSON.stringify(projection), /private-(?:event|item)-name/u);
});

test("rejects malformed JSONL, non-object records, invalid UTF-8, and unsafe trace IDs", () => {
  assert.throws(() => projectTraceBytes("TRC-TEST-001", Buffer.from("not-json\n")), /JSON/u);
  assert.throws(() => projectTraceBytes("TRC-TEST-001", Buffer.from("[]\n")), /must be a JSON object/u);
  assert.throws(() => projectTraceBytes("TRC-TEST-001", Uint8Array.from([0xc3, 0x28])), /encoded data/u);
  assert.throws(() => projectTraceBytes("../private", Buffer.from("{}\n")), /allowlisted/u);
});
