import { ArmAggregateSchema, type ArmAggregate } from "./aggregation.ts";
import { canonicalJson } from "./canonical-json.ts";

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

/** Generate validated JSON and static HTML from recomputed aggregates only. */
export function buildOfficialAggregateReport(input: readonly ArmAggregate[]): Readonly<{json: string; html: string}> {
  const aggregates = input.map((aggregate) => ArmAggregateSchema.parse(aggregate));
  const json = canonicalJson({ schemaVersion: "beyondgreen-official-aggregate@1.0.0", aggregates });
  const rows = aggregates.map((aggregate) => `<tr><th>${escapeHtml(aggregate.arm)}</th><td>${aggregate.correctDecisions}/${aggregate.total}</td><td>${aggregate.reasonCorrectRejects}/${aggregate.falseGreenTotal}</td><td>${aggregate.preservingBlocked}/${aggregate.preservingTotal}</td><td>${aggregate.completedDecisions}/${aggregate.total}</td></tr>`).join("");
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>BeyondGreen aggregate</title><body><table><thead><tr><th>Arm</th><th>Correct</th><th>Reason-correct rejects</th><th>Preserving blocked</th><th>Completed</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
  return Object.freeze({ json, html });
}
