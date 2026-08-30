#!/usr/bin/env node
/** Validates pre-unblinding command contracts without executing or scoring either arm. */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { FIXTURES } from "../src/fixtures/development.ts";

const allowedModes = new Set(["baseline", "beyondgreen", "evaluation", "replay"]);
const [mode, versionFlag, evaluationVersion, ...rest] = process.argv.slice(2);

if (!mode || !allowedModes.has(mode)) throw new Error(`Unknown pre-unblinding mode: ${mode ?? "missing"}.`);
if (versionFlag !== "--evaluation-version" || evaluationVersion !== "eval-v1.1.0" || rest.length !== 0) {
  throw new Error("The pre-unblinding entrypoint requires exactly --evaluation-version eval-v1.1.0.");
}
if (FIXTURES.length !== 10 || FIXTURES.reduce((count, fixture) => count + fixture.candidateIds.length, 0) !== 20) {
  throw new Error("Frozen fixture cardinality is not 10 fixtures / 20 candidates.");
}

const projection = readFileSync("docs/EVALUATION.md");
const assignment = readFileSync("evaluation/fixture-assignments.yaml");
const contractSha256 = createHash("sha256")
  .update("eval-v1.1.0\0")
  .update(projection)
  .update("\0")
  .update(assignment)
  .digest("hex");

process.stdout.write(`${JSON.stringify({
  schemaVersion: "beyondgreen-pre-unblinding-entrypoint@1.0.0",
  mode,
  evaluationVersion,
  fixtureCount: 10,
  candidateCount: 20,
  contractSha256,
  executionClass: "contract_only_pre_unblinding",
  officialOrScoredRun: false,
  unblindingPerformed: false,
  armExecuted: false,
  runRecordCreated: false,
  liveModelCalls: 0,
  networkRequired: false,
})}\n`);
