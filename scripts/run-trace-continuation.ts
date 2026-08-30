#!/usr/bin/env node
/** Captures one read-only reviewer stream while producing a content-free projection. */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";

const TRACE_ID = "TRC-BG-PRE-UNBLINDING-VERIFY-001-CONT-002";
const INSTRUCTION_PATH = "artifacts/trajectories/instructions/TRC-BG-PRE-UNBLINDING-VERIFY-001-CONT-002.md";
const PROJECTION_PATH = "artifacts/trajectories/reviewed/TRC-BG-PRE-UNBLINDING-VERIFY-001-CONT-002-STRUCTURAL.json";
const MAX_METADATA_BYTES = 16 * 1024 * 1024;

type ProcessResult = Readonly<{ exitCode: number | null; stdout: Buffer; stderr: Buffer }>;

const collect = (stream: NodeJS.ReadableStream): Promise<Buffer> => new Promise((resolve, reject) => {
  const chunks: Buffer[] = [];
  let size = 0;
  stream.on("data", (chunk: Buffer | string) => {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += bytes.length;
    if (size > MAX_METADATA_BYTES) {
      reject(new Error("Bounded metadata output exceeded the maximum size."));
      return;
    }
    chunks.push(bytes);
  });
  stream.on("end", () => resolve(Buffer.concat(chunks)));
  stream.on("error", reject);
});

const finished = (
  child: ReturnType<typeof spawn>,
  stdout: Promise<Buffer>,
  stderr: Promise<Buffer>,
): Promise<ProcessResult> => new Promise((resolve, reject) => {
  child.on("error", reject);
  child.on("close", async (exitCode) => {
    try { resolve({ exitCode, stdout: await stdout, stderr: await stderr }); }
    catch (error) { reject(error); }
  });
});

const sha256 = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");

const safeStderrSummary = (bytes: Buffer) => {
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  return {
    bytes: bytes.length,
    sha256: sha256(bytes),
    strictUtf8: true,
    absolutePathMatches: (text.match(/\/(?:Users|home)\/[^\s"']+/gu) ?? []).length,
    emailMatches: (text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/giu) ?? []).length,
    secretAssignmentMatches: (text.match(/(?:api[_-]?key|token|password|secret)\s*[:=]\s*[^\s"']+/giu) ?? []).length,
  };
};

const main = async (): Promise<void> => {
  const capture = spawn("micro1-safe-trace", ["capture", TRACE_ID], {
    cwd: process.cwd(),
    stdio: ["pipe", "pipe", "pipe"],
    shell: false,
  });
  const projector = spawn(process.execPath, [
    "scripts/trace-review-projection.ts",
    "review-projection",
    TRACE_ID,
  ], {
    cwd: process.cwd(),
    stdio: ["pipe", "pipe", "pipe"],
    shell: false,
  });
  const reviewer = spawn("codex", [
    "exec",
    "--json",
    "--ephemeral",
    "--ignore-user-config",
    "--color",
    "never",
    "--sandbox",
    "read-only",
    "--model",
    "gpt-5.6-sol",
    "-C",
    process.cwd(),
    "-",
  ], {
    cwd: process.cwd(),
    stdio: ["pipe", "pipe", "pipe"],
    shell: false,
  });

  const captureDone = finished(capture, collect(capture.stdout), collect(capture.stderr));
  const projectorDone = finished(projector, collect(projector.stdout), collect(projector.stderr));
  const reviewerDone = finished(reviewer, Promise.resolve(Buffer.alloc(0)), collect(reviewer.stderr));

  reviewer.stdout.pipe(capture.stdin);
  reviewer.stdout.pipe(projector.stdin);
  reviewer.stdin.end(readFileSync(INSTRUCTION_PATH));

  const [captureResult, projectorResult, reviewerResult] = await Promise.all([
    captureDone,
    projectorDone,
    reviewerDone,
  ]);
  const safeFailure = {
    reviewerExit: reviewerResult.exitCode,
    captureExit: captureResult.exitCode,
    projectorExit: projectorResult.exitCode,
    reviewerStderr: safeStderrSummary(reviewerResult.stderr),
    captureStderr: safeStderrSummary(captureResult.stderr),
    projectorStderr: safeStderrSummary(projectorResult.stderr),
  };
  if (reviewerResult.exitCode !== 0 || captureResult.exitCode !== 0 || projectorResult.exitCode !== 0) {
    process.stdout.write(`${JSON.stringify({ status: "transport_failure", ...safeFailure })}\n`);
    process.exitCode = 74;
    return;
  }

  const receipt = JSON.parse(captureResult.stdout.toString("utf8")) as Record<string, unknown>;
  const projection = JSON.parse(projectorResult.stdout.toString("utf8")) as Record<string, unknown> & {
    events?: readonly Record<string, unknown>[];
  };
  if (
    receipt.traceId !== TRACE_ID ||
    projection.traceId !== TRACE_ID ||
    receipt.bytes !== projection.sourceBytes ||
    receipt.sha256 !== projection.sourceSha256
  ) {
    process.stdout.write(`${JSON.stringify({ status: "capture_projection_identity_mismatch", ...safeFailure })}\n`);
    process.exitCode = 75;
    return;
  }
  if (
    projection.eventCount !== projection.events?.length ||
    projection.contentIncluded !== false ||
    projection.toolArgumentsIncluded !== false ||
    projection.externalPathsIncluded !== false ||
    projection.environmentValuesIncluded !== false
  ) {
    process.stdout.write(`${JSON.stringify({ status: "projection_contract_mismatch", ...safeFailure })}\n`);
    process.exitCode = 76;
    return;
  }

  const eventTypes: Record<string, number> = {};
  const itemTypes: Record<string, number> = {};
  const exitCodes: Record<string, number> = {};
  for (const event of projection.events) {
    const eventType = String(event.eventType);
    const itemType = String(event.itemType);
    eventTypes[eventType] = (eventTypes[eventType] ?? 0) + 1;
    itemTypes[itemType] = (itemTypes[itemType] ?? 0) + 1;
    const completion = event.completion as Record<string, unknown> | undefined;
    if (typeof completion?.exitCode === "number") {
      const code = String(completion.exitCode);
      exitCodes[code] = (exitCodes[code] ?? 0) + 1;
    }
  }

  writeFileSync(PROJECTION_PATH, `${JSON.stringify(projection, null, 2)}\n`, { flag: "wx" });
  process.stdout.write(`${JSON.stringify({
    status: "capture_projection_identity_passed",
    traceId: TRACE_ID,
    bytes: receipt.bytes,
    sha256: receipt.sha256,
    eventCount: projection.eventCount,
    eventTypes,
    itemTypes,
    exitCodes,
    reviewerStderr: safeFailure.reviewerStderr,
    rawIntermediateFileCreated: false,
    projectionPath: PROJECTION_PATH,
  })}\n`);
};

main().catch((error) => {
  process.stderr.write(`TRACE_CONTINUATION_ERROR ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
