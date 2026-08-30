import { createHash } from "node:crypto";

import { aggregateOfficialRecords, type ArmAggregate, type OfficialScoredRecord } from "./aggregation.ts";
import { canonicalJson } from "./canonical-json.ts";
import { buildOfficialAggregateReport } from "./report.ts";

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export type OfficialReplayBundle = Readonly<{
  schemaVersion: "beyondgreen-official-replay@1.0.0";
  records: readonly OfficialScoredRecord[];
  aggregates: readonly ArmAggregate[];
  reportJson: string;
  reportHtml: string;
  evidenceSha256: string;
}>;

/** Build deterministic replay evidence from already immutable synthetic or official records. */
export function createOfficialReplayBundle(records: readonly OfficialScoredRecord[]): OfficialReplayBundle {
  const aggregates = aggregateOfficialRecords(records);
  const report = buildOfficialAggregateReport(aggregates);
  const evidenceSha256 = sha256(canonicalJson({ records, aggregates, report }));
  return Object.freeze({
    schemaVersion: "beyondgreen-official-replay@1.0.0",
    records: Object.freeze([...records]),
    aggregates,
    reportJson: report.json,
    reportHtml: report.html,
    evidenceSha256,
  });
}

/** Recompute every aggregate and report byte; mismatch blocks replay. */
export function replayOfficialBundle(bundle: OfficialReplayBundle): OfficialReplayBundle {
  const reproduced = createOfficialReplayBundle(bundle.records);
  if (canonicalJson(reproduced) !== canonicalJson(bundle)) {
    throw new Error("Official replay bundle does not reproduce exactly.");
  }
  return reproduced;
}
