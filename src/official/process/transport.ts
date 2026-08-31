import type { Readable, Writable } from "node:stream";

import type { z } from "zod";

import {
  OfficialProcessFailureSchema,
  parseAndFreezeProcessIpc,
  type OfficialProcessFailure,
} from "./ipc.ts";
import { OfficialHandlerStageError } from "./handler-stage.ts";

const MAX_IPC_BYTES = 1_048_576;

export class OfficialProcessContractError extends Error {
  public readonly code: OfficialProcessFailure["errorCode"];

  public constructor(
    code: OfficialProcessFailure["errorCode"],
    message: string,
  ) {
    super(message);
    this.name = "OfficialProcessContractError";
    this.code = code;
  }
}

async function readSingleJsonLine(input: Readable): Promise<unknown> {
  const chunks: Buffer[] = [];
  let byteLength = 0;
  for await (const chunk of input) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
    byteLength += buffer.length;
    if (byteLength > MAX_IPC_BYTES) {
      throw new OfficialProcessContractError("MALFORMED_IPC", "IPC request exceeds the byte limit.");
    }
    chunks.push(buffer);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  const lines = text.split(/\r?\n/u).filter((line) => line.length > 0);
  if (lines.length !== 1) {
    throw new OfficialProcessContractError("MALFORMED_IPC", "Exactly one JSONL request is required.");
  }
  try {
    return JSON.parse(lines[0]!);
  } catch {
    throw new OfficialProcessContractError("MALFORMED_IPC", "IPC request is not valid JSON.");
  }
}

function requestMetadata(input: unknown): { requestId: string | null; role: OfficialProcessFailure["role"] } {
  if (input === null || typeof input !== "object") return { requestId: null, role: null };
  const record = input as Record<string, unknown>;
  const requestId = typeof record.requestId === "string" && /^[A-Za-z0-9._:-]{1,160}$/u.test(record.requestId)
    ? record.requestId
    : null;
  const role = record.role === "arm" || record.role === "scenario-provider"
    || record.role === "observer" || record.role === "evaluator"
    ? record.role
    : null;
  return { requestId, role };
}

function writeJsonLine(output: Writable, value: unknown): void {
  output.write(`${JSON.stringify(value)}\n`);
}

/** Serve one strict request and exit fail-closed without echoing unsafe diagnostics. */
export async function serveOfficialProcessRequest<Request, Success>(options: Readonly<{
  role: "arm" | "scenario-provider" | "observer" | "evaluator";
  requestSchema: z.ZodType<Request>;
  successSchema: z.ZodType<Success>;
  execute(request: Request): Promise<unknown>;
  input?: Readable;
  output?: Writable;
}>): Promise<0 | 1> {
  const input = options.input ?? process.stdin;
  const output = options.output ?? process.stdout;
  let raw: unknown;
  try {
    raw = await readSingleJsonLine(input);
    let request: Request;
    try {
      request = parseAndFreezeProcessIpc(options.requestSchema, raw);
    } catch {
      throw new OfficialProcessContractError("MALFORMED_IPC", "IPC request violates the role schema.");
    }
    const produced = await options.execute(request);
    let success: Success;
    try {
      success = parseAndFreezeProcessIpc(options.successSchema, produced);
    } catch {
      throw new OfficialProcessContractError("OUTPUT_SCHEMA_FAILURE", "Role result violates the response schema.");
    }
    writeJsonLine(output, success);
    return 0;
  } catch (error) {
    const metadata = requestMetadata(raw);
    const contractError = error instanceof OfficialProcessContractError ? error : undefined;
    const stageError = error instanceof OfficialHandlerStageError ? error : undefined;
    const errorCode = contractError?.code ?? "HANDLER_FAILURE";
    const failure = OfficialProcessFailureSchema.parse({
      schemaVersion: "beyondgreen-official-process-failure@1.0.0",
      requestId: metadata.requestId,
      role: metadata.role ?? options.role,
      status: "error",
      disposition: "abstain",
      retryAllowed: false,
      errorCode,
      failureStage: stageError?.stage
        ?? (errorCode === "OUTPUT_SCHEMA_FAILURE" ? "OUTPUT_SCHEMA" : null),
      message: errorCode === "MALFORMED_IPC"
        ? "Malformed IPC was rejected before role execution."
        : "Role process failed closed without a retry.",
    });
    writeJsonLine(output, failure);
    return 1;
  }
}
