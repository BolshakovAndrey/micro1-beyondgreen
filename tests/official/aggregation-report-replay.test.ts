import assert from "node:assert/strict";
import test from "node:test";

import { aggregateOfficialRecords, type OfficialScoredRecord } from "../../src/official/aggregation.ts";
import { createOfficialReplayBundle, replayOfficialBundle } from "../../src/official/replay.ts";
import { buildOfficialAggregateReport } from "../../src/official/report.ts";

const records: readonly OfficialScoredRecord[] = [
  { evaluationVersion: "eval-v1.1.0", fixtureId: "BG-D02", candidateId: "candidate-a", arm: "status-quo", verdict: "accept", groundTruth: "preserving", reasonCorrectReject: false, schemaValidCompleteReport: true },
  { evaluationVersion: "eval-v1.1.0", fixtureId: "BG-D02", candidateId: "candidate-b", arm: "status-quo", verdict: "accept", groundTruth: "false_green", reasonCorrectReject: false, schemaValidCompleteReport: true },
  { evaluationVersion: "eval-v1.1.0", fixtureId: "BG-D02", candidateId: "candidate-a", arm: "beyondgreen", verdict: "accept", groundTruth: "preserving", reasonCorrectReject: false, schemaValidCompleteReport: true },
  { evaluationVersion: "eval-v1.1.0", fixtureId: "BG-D02", candidateId: "candidate-b", arm: "beyondgreen", verdict: "reject", groundTruth: "false_green", reasonCorrectReject: true, schemaValidCompleteReport: true },
];

test("aggregation recomputes the frozen v1.1 numerators from synthetic records", () => {
  const aggregates = aggregateOfficialRecords(records);
  assert.deepEqual(aggregates, [
    { arm: "status-quo", total: 2, correctDecisions: 1, falseGreenTotal: 1, reasonCorrectRejects: 0, preservingTotal: 1, preservingBlocked: 0, completedDecisions: 2 },
    { arm: "beyondgreen", total: 2, correctDecisions: 2, falseGreenTotal: 1, reasonCorrectRejects: 1, preservingTotal: 1, preservingBlocked: 0, completedDecisions: 2 },
  ]);
  assert.throws(() => aggregateOfficialRecords([...records, records[0]!]), /duplicate/i);
});

test("JSON, static HTML, and offline replay reproduce exactly without network or subprocesses", () => {
  const aggregates = aggregateOfficialRecords(records);
  const report = buildOfficialAggregateReport(aggregates);
  assert.match(report.json, /beyondgreen-official-aggregate@1\.0\.0/);
  assert.match(report.html, /<th>beyondgreen<\/th><td>2\/2<\/td>/);
  const bundle = createOfficialReplayBundle(records);
  assert.deepEqual(replayOfficialBundle(bundle), bundle);
  assert.throws(() => replayOfficialBundle({ ...bundle, evidenceSha256: "0".repeat(64) }), /does not reproduce/);
});
