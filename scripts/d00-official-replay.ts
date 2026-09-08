#!/usr/bin/env node
/** Verifies the committed official evidence without executing candidates or models. */

import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { OfficialScoredRecordSchema } from "../src/official/aggregation.ts";
import { canonicalJson } from "../src/official/canonical-json.ts";
import {
  loadOfficialPostDecisionRecoverySource,
  OFFICIAL_POST_DECISION_SOURCE_MANIFEST,
  OFFICIAL_POST_DECISION_SOURCE_ROOT,
} from "../src/official/execution/post-decision-recovery.ts";
import { replayOfficialBundle, type OfficialReplayBundle } from "../src/official/replay.ts";

const OFFICIAL_ROOT = "artifacts/evaluation/official/RUN-BG-OFFICIAL-EVAL-V1.1.0-002-POSTDECISION-004";
const EXPECTED_EVIDENCE_SHA256 = "972cf43f76d0e68534b481a15bfc9f6b9e2db3bf83b4cb5c80d654d07b378f07";

const sha256File = (filePath: string): string =>
  createHash("sha256").update(readFileSync(filePath)).digest("hex");

const readJson = (filePath: string): unknown => JSON.parse(readFileSync(filePath, "utf8"));

/** Assert exact official replay, source, candidate, and materialized-report integrity. */
export const verifyOfficialReplay = (repositoryRoot: string): Readonly<Record<string, unknown>> => {
  const source = loadOfficialPostDecisionRecoverySource({
    repositoryRoot,
    relativeSourceRoot: OFFICIAL_POST_DECISION_SOURCE_ROOT,
    sourceManifestPath: OFFICIAL_POST_DECISION_SOURCE_MANIFEST,
  });
  for (const slot of source.plan.slots) {
    if (sha256File(path.join(repositoryRoot, slot.candidate.modulePath)) !== slot.candidate.sha256) {
      throw new Error(`Candidate bytes differ from RUN-002: ${slot.slotId}`);
    }
  }

  const root = path.join(repositoryRoot, OFFICIAL_ROOT);
  const replay = readJson(path.join(root, "offline-replay.jsonl")) as OfficialReplayBundle;
  const reproduced = replayOfficialBundle(replay);
  if (reproduced.evidenceSha256 !== EXPECTED_EVIDENCE_SHA256) {
    throw new Error("Official evidence digest differs from the approved result.");
  }
  if (reproduced.records.length !== 40 || reproduced.records.some((record) =>
    !OfficialScoredRecordSchema.safeParse(record).success)) {
    throw new Error("Official replay does not contain exactly 40 schema-valid evaluator records.");
  }

  const evaluatorNames = readdirSync(path.join(root, "evaluator-records")).sort();
  const observerNames = readdirSync(path.join(root, "observer-records")).sort();
  if (evaluatorNames.length !== 40 || observerNames.length !== 80) {
    throw new Error("Official materialized record cardinality differs from 40 evaluators / 80 captures.");
  }
  const evaluatorRecords = evaluatorNames.map((name) =>
    OfficialScoredRecordSchema.parse(readJson(path.join(root, "evaluator-records", name))));
  const byIdentity = (records: typeof evaluatorRecords): readonly string[] => records
    .map((record) => canonicalJson(record))
    .sort((left, right) => left.localeCompare(right, "en"));
  if (canonicalJson(byIdentity(evaluatorRecords)) !== canonicalJson(byIdentity([...reproduced.records]))) {
    throw new Error("Materialized evaluator records differ from the replay bundle.");
  }
  if (readFileSync(path.join(root, "report.json"), "utf8") !== `${reproduced.reportJson}\n`
    || readFileSync(path.join(root, "report.html"), "utf8") !== reproduced.reportHtml
    || canonicalJson(readJson(path.join(root, "aggregate.json"))) !== canonicalJson(reproduced.aggregates)) {
    throw new Error("Materialized aggregate report differs from deterministic replay.");
  }

  return Object.freeze({
    status: "OFFICIAL_OFFLINE_REPLAY_VERIFIED",
    evidenceSha256: reproduced.evidenceSha256,
    sourceBundleSha256: source.manifest.bundleSha256,
    decisions: source.decisions.length,
    captures: observerNames.length,
    evaluatorRecords: evaluatorNames.length,
    armExecutionCount: 0,
    modelInvocationCount: 0,
  });
};

try {
  process.stdout.write(`${canonicalJson(verifyOfficialReplay(process.cwd()))}\n`);
}
catch (error) {
  process.stderr.write(`OFFICIAL_OFFLINE_REPLAY_FAILED ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
