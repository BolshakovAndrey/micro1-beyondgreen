/** Validates and constructs the capability-free four-record reasoning replay protocol. */
import { createHash } from "node:crypto";
import { z } from "zod";

import { D01_FIXTURE } from "./fixture.ts";
import {
  CandidateIdSchema, ReasoningAdapterInputSchema, ReasoningAdapterOutputSchema, ReplayIdentitySchema,
  type CandidateId, type ReasoningAdapterInput, type ReasoningAdapterOutput, type ReplayIdentity,
} from "./schemas.ts";

const ZERO_DIGEST = "0".repeat(64);
const DIGEST = /^[a-f0-9]{64}$/u;
const RECORD_TYPES = ["header", "reasoning_request", "reasoning_response", "footer"] as const;
const HeaderPayloadSchema = z.object({
  adapter: z.literal("offline-replay-jsonl-v1"),
  evidence_class: z.literal("approved_synthetic_offline"),
  live_model_result: z.literal(false), model_invocation_count: z.literal(0),
  official_or_scored: z.literal(false),
}).strict();

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

function digest(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

/** Canonicalize the bounded JSON domain with recursively sorted object keys. */
export function jcsCanonicalize(value: unknown): string {
  if (value === null || typeof value === "boolean" || typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("Replay JSON contains a non-finite number.");
    return JSON.stringify(Object.is(value, -0) ? 0 : value);
  }
  if (Array.isArray(value)) return `[${value.map(jcsCanonicalize).join(",")}]`;
  if (typeof value !== "object") throw new Error("Replay value is outside the JSON data model.");
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => {
    if (record[key] === undefined) throw new Error("Replay JSON contains undefined.");
    return `${JSON.stringify(key)}:${jcsCanonicalize(record[key])}`;
  }).join(",")}}`;
}

const RecordSchema = z.object({
  schema_version: z.literal(D01_FIXTURE.schemas.replayJsonl),
  protocol: z.literal("offline-replay-jsonl-v1"),
  sequence: z.number().int().min(1).max(4), record_type: z.enum(RECORD_TYPES),
  replay_id: z.string().min(1), fixture_id: z.literal(D01_FIXTURE.fixtureId), candidate_id: CandidateIdSchema,
  candidate_sha256: z.string().regex(DIGEST), previous_chain_sha256: z.string().regex(DIGEST),
  payload: z.unknown(), record_sha256: z.string().regex(DIGEST),
}).strict();

type ReplayRecord = z.infer<typeof RecordSchema>;

function appendRecord(
  records: ReplayRecord[],
  identity: Readonly<{ replayId: string; candidateId: CandidateId; candidateSha256: string }>,
  recordType: (typeof RECORD_TYPES)[number],
  payload: JsonValue,
  previousChain: string,
): string {
  const base = {
    schema_version: D01_FIXTURE.schemas.replayJsonl,
    protocol: "offline-replay-jsonl-v1" as const,
    sequence: records.length + 1,
    record_type: recordType,
    replay_id: identity.replayId,
    fixture_id: D01_FIXTURE.fixtureId,
    candidate_id: identity.candidateId,
    candidate_sha256: identity.candidateSha256,
    previous_chain_sha256: previousChain,
    payload,
  };
  const recordSha256 = digest(jcsCanonicalize(base));
  records.push(RecordSchema.parse({ ...base, record_sha256: recordSha256 }));
  return digest(`${previousChain}\n${recordSha256}`);
}

/** Returns the verified replay request, final output, and cryptographic stream identity. */
export type ValidatedReplay = Readonly<{
  input: ReasoningAdapterInput;
  output: ReasoningAdapterOutput;
  identity: ReplayIdentity;
}>;

/** Build the frozen four-record offline replay stream without I/O capabilities. */
export function buildReasoningReplay(inputValue: unknown, outputValue: unknown): Readonly<{
  jsonl: string;
  identity: ReplayIdentity;
}> {
  const input = ReasoningAdapterInputSchema.parse(inputValue);
  const output = ReasoningAdapterOutputSchema.parse(outputValue);
  if (input.candidateId !== output.candidateId || input.fixtureId !== output.fixtureId) {
    throw new Error("Replay input and output identifiers disagree.");
  }
  const identity = {
    replayId: `${D01_FIXTURE.run.id}:${input.candidateId}`,
    candidateId: input.candidateId,
    candidateSha256: input.candidateSha256,
  };
  const records: ReplayRecord[] = [];
  let chain = appendRecord(records, identity, "header", {
    adapter: "offline-replay-jsonl-v1",
    evidence_class: "approved_synthetic_offline",
    live_model_result: false,
    model_invocation_count: 0,
    official_or_scored: false,
  }, ZERO_DIGEST);
  chain = appendRecord(records, identity, "reasoning_request", input as JsonValue, chain);
  chain = appendRecord(records, identity, "reasoning_response", output as JsonValue, chain);
  const finalOutputSha256 = digest(jcsCanonicalize(output));
  const prefixChainSha256 = chain;
  chain = appendRecord(records, identity, "footer", {
    record_count: 4,
    header_sha256: records[0]!.record_sha256,
    request_sha256: records[1]!.record_sha256,
    response_sha256: records[2]!.record_sha256,
    prefix_chain_sha256: prefixChainSha256,
    final_output_sha256: finalOutputSha256,
  }, chain);
  const jsonl = `${records.map(jcsCanonicalize).join("\n")}\n`;
  return Object.freeze({
    jsonl,
    identity: ReplayIdentitySchema.parse({
      protocol: "offline-replay-jsonl-v1",
      schemaVersion: D01_FIXTURE.schemas.replayJsonl,
      recordCount: 4,
      replaySha256: digest(jsonl),
      finalChainSha256: chain,
      finalOutputSha256,
    }),
  });
}

/** Validate all replay framing, hashes, identifiers, cardinality, and the one final output. */
export function validateReasoningReplay(
  jsonl: string,
  expected?: Readonly<{ candidateId: CandidateId; candidateSha256: string }>,
): ValidatedReplay {
  if (jsonl.startsWith("\uFEFF") || jsonl.includes("\uFFFD") || jsonl.includes("\r") || !jsonl.endsWith("\n")) {
    throw new Error("Replay must use strict UTF-8 LF framing with a terminal LF and no BOM or replacement characters.");
  }
  const lines = jsonl.slice(0, -1).split("\n");
  if (lines.length !== 4 || lines.some((line) => line.length === 0)) throw new Error("Replay must contain exactly four records.");
  const records = lines.map((line) => {
    const record = RecordSchema.parse(JSON.parse(line));
    if (jcsCanonicalize(record) !== line) throw new Error("Replay record is not JCS-canonical JSON.");
    return record;
  });
  let previousChain = ZERO_DIGEST;
  let replayId = "";
  for (const [index, record] of records.entries()) {
    if (record.sequence !== index + 1 || record.record_type !== RECORD_TYPES[index]) {
      throw new Error("Replay record order or sequence is invalid.");
    }
    if (index === 0) replayId = record.replay_id;
    if (record.replay_id !== replayId || record.previous_chain_sha256 !== previousChain) {
      throw new Error("Replay identifier or previous-chain digest is invalid.");
    }
    if (record.candidate_id !== records[0]!.candidate_id
      || record.candidate_sha256 !== records[0]!.candidate_sha256) {
      throw new Error("Replay candidate identity changed between records.");
    }
    const { record_sha256: recordSha256, ...base } = record;
    if (digest(jcsCanonicalize(base)) !== recordSha256) throw new Error("Replay record digest mismatch.");
    previousChain = digest(`${previousChain}\n${recordSha256}`);
  }
  if (expected && (records[0]!.candidate_id !== expected.candidateId
    || records[0]!.candidate_sha256 !== expected.candidateSha256)) {
    throw new Error("Replay does not match the expected candidate identity.");
  }
  HeaderPayloadSchema.parse(records[0]!.payload);
  if (records[0]!.replay_id !== `${D01_FIXTURE.run.id}:${records[0]!.candidate_id}`) {
    throw new Error("Replay ID is not bound to the frozen run and candidate.");
  }
  const input = ReasoningAdapterInputSchema.parse(records[1]!.payload);
  const output = ReasoningAdapterOutputSchema.parse(records[2]!.payload);
  if (input.candidateId !== records[0]!.candidate_id || input.candidateSha256 !== records[0]!.candidate_sha256
    || output.candidateId !== records[0]!.candidate_id) throw new Error("Replay payload identifiers are invalid.");
  if (output.riskInventorySha256 !== digest(jcsCanonicalize(input.riskInventory))) {
    throw new Error("Replay response is not bound to the request risk inventory.");
  }
  const footer = z.object({
    record_count: z.literal(4), header_sha256: z.string().regex(DIGEST),
    request_sha256: z.string().regex(DIGEST), response_sha256: z.string().regex(DIGEST),
    prefix_chain_sha256: z.string().regex(DIGEST), final_output_sha256: z.string().regex(DIGEST),
  }).strict().parse(records[3]!.payload);
  const prefixChain = digest(`${records[2]!.previous_chain_sha256}\n${records[2]!.record_sha256}`);
  if (footer.header_sha256 !== records[0]!.record_sha256
    || footer.request_sha256 !== records[1]!.record_sha256
    || footer.response_sha256 !== records[2]!.record_sha256
    || footer.prefix_chain_sha256 !== prefixChain
    || footer.final_output_sha256 !== digest(jcsCanonicalize(output))) {
    throw new Error("Replay footer digest validation failed.");
  }
  return Object.freeze({
    input,
    output,
    identity: ReplayIdentitySchema.parse({
      protocol: "offline-replay-jsonl-v1",
      schemaVersion: D01_FIXTURE.schemas.replayJsonl,
      recordCount: 4,
      replaySha256: digest(jsonl),
      finalChainSha256: previousChain,
      finalOutputSha256: footer.final_output_sha256,
    }),
  });
}
