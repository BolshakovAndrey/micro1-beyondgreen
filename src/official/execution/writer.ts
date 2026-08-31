import { closeSync, constants, existsSync, fsyncSync, linkSync, mkdirSync, openSync, realpathSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { OfficialScoredRecord } from "../aggregation.ts";
import { canonicalJson } from "../canonical-json.ts";
import type { OfficialExecutionPlan } from "../integration/execution-plan.ts";
import type { OfficialStaticPreflightResult } from "../integration/preflight.ts";
import type { OfficialReplayBundle } from "../replay.ts";
import type { OfficialImmutableArmDecision } from "../process/ipc.ts";
import type { OfficialObservationPair } from "./contracts.ts";

let temporaryOrdinal = 0;

function assertInsideRoot(repositoryRoot: string, outputRoot: string): string {
  const repository = realpathSync(repositoryRoot);
  const resolved = path.resolve(outputRoot);
  if (resolved === repository || !resolved.startsWith(`${repository}${path.sep}`)) {
    throw new Error("Official output root must be a dedicated repository-local directory.");
  }
  return resolved;
}

function atomicCreateFile(filePath: string, contents: string): void {
  if (existsSync(filePath)) throw new Error(`Official writer refuses to overwrite ${path.basename(filePath)}.`);
  temporaryOrdinal += 1;
  const temporaryPath = path.join(path.dirname(filePath), `.create-${process.pid}-${temporaryOrdinal}.tmp`);
  let descriptor: number | undefined;
  try {
    descriptor = openSync(temporaryPath, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY, 0o600);
    writeFileSync(descriptor, contents, "utf8");
    fsyncSync(descriptor);
    closeSync(descriptor);
    descriptor = undefined;
    linkSync(temporaryPath, filePath);
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
    if (existsSync(temporaryPath)) unlinkSync(temporaryPath);
  }
}

function recordName(ordinal: number, arm: "status-quo" | "beyondgreen"): string {
  return `${String(ordinal).padStart(2, "0")}-${arm}.json`;
}

function captureRecordName(
  ordinal: number,
  arm: "status-quo" | "beyondgreen",
  captureOrdinal: 1 | 2,
): string {
  return `${String(ordinal).padStart(2, "0")}-${arm}-${captureOrdinal}.json`;
}

/** Create-once repository-local writer. It never updates, overwrites, or deletes evidence. */
export class OfficialCreateOnceRunWriter {
  readonly #root: string;
  #initialized = false;

  public constructor(repositoryRoot: string, outputRoot: string) {
    this.#root = assertInsideRoot(repositoryRoot, outputRoot);
  }

  public initialize(input: Readonly<{
    preflight: OfficialStaticPreflightResult;
    plan: OfficialExecutionPlan;
    provenance: unknown;
    syntheticOnly: boolean;
  }>): void {
    if (this.#initialized) throw new Error("Official writer is already initialized.");
    mkdirSync(path.dirname(this.#root), { recursive: true });
    mkdirSync(this.#root);
    for (const directory of ["arm-records", "observer-records", "evaluator-records"]) {
      mkdirSync(path.join(this.#root, directory));
    }
    atomicCreateFile(path.join(this.#root, "static-preflight.json"), `${canonicalJson(input.preflight)}\n`);
    atomicCreateFile(path.join(this.#root, "execution-plan.json"), `${canonicalJson(input.plan)}\n`);
    atomicCreateFile(path.join(this.#root, "run-manifest.json"), `${canonicalJson({
      schemaVersion: "beyondgreen-official-run-manifest@1.0.0",
      evaluationVersion: "eval-v1.1.0",
      slotCount: 20,
      totalArmPlans: 40,
      expectedCaptureRecords: 80,
      expectedObservationPairs: 40,
      createOnce: true,
      overwriteAllowed: false,
      deleteAllowed: false,
      syntheticOnly: input.syntheticOnly,
    })}\n`);
    atomicCreateFile(path.join(this.#root, "provenance.json"), `${canonicalJson(input.provenance)}\n`);
    this.#initialized = true;
  }

  public writeArmRecord(input: Readonly<{
    ordinal: number;
    arm: "status-quo" | "beyondgreen";
    decision: OfficialImmutableArmDecision;
    candidateSha256Before: string;
    candidateSha256After: string;
    reasoningInvocationCount: 0 | 1;
    retryCount: 0;
  }>): void {
    this.#assertInitialized();
    atomicCreateFile(path.join(this.#root, "arm-records", recordName(input.ordinal, input.arm)), `${canonicalJson(input)}\n`);
  }

  public writeObservationPair(ordinal: number, pair: OfficialObservationPair): void {
    this.#assertInitialized();
    // Persist exactly 80 capture files. The shared pair digest in both envelopes
    // proves the 40 pair bindings without introducing 40 extra record files.
    for (const [index, capture] of pair.captures.entries()) {
      const captureOrdinal = (index + 1) as 1 | 2;
      atomicCreateFile(
        path.join(this.#root, "observer-records", captureRecordName(ordinal, pair.arm, captureOrdinal)),
        `${canonicalJson({
          schemaVersion: "beyondgreen-official-observer-record@1.0.0",
          captureOrdinal,
          pairSha256: pair.pairSha256,
          capture,
        })}\n`,
      );
    }
  }

  public writeEvaluatorRecord(ordinal: number, record: OfficialScoredRecord): void {
    this.#assertInitialized();
    atomicCreateFile(path.join(this.#root, "evaluator-records", recordName(ordinal, record.arm)), `${canonicalJson(record)}\n`);
  }

  public finalize(input: Readonly<{
    replay: OfficialReplayBundle;
    records: readonly OfficialScoredRecord[];
  }>): void {
    this.#assertInitialized();
    atomicCreateFile(path.join(this.#root, "aggregate.json"), `${canonicalJson(input.replay.aggregates)}\n`);
    atomicCreateFile(path.join(this.#root, "report.json"), `${input.replay.reportJson}\n`);
    atomicCreateFile(path.join(this.#root, "report.html"), input.replay.reportHtml);
    atomicCreateFile(path.join(this.#root, "offline-replay.jsonl"), `${canonicalJson(input.replay)}\n`);
  }

  #assertInitialized(): void {
    if (!this.#initialized) throw new Error("Official writer must persist the plan before writing execution evidence.");
  }
}
