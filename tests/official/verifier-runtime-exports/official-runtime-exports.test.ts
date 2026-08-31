import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

import * as D01 from "../../../evaluation/verifier-only/BG-D01/official-runtime-exports.ts";
import * as D02 from "../../../evaluation/verifier-only/BG-D02/official-runtime-exports.ts";
import * as D03 from "../../../evaluation/verifier-only/BG-D03/official-runtime-exports.ts";
import * as D04 from "../../../evaluation/verifier-only/BG-D04/official-runtime-exports.ts";
import * as H01 from "../../../evaluation/verifier-only/BG-H01/official-runtime-exports.ts";
import * as H02 from "../../../evaluation/verifier-only/BG-H02/official-runtime-exports.ts";
import * as H03 from "../../../evaluation/verifier-only/BG-H03/official-runtime-exports.ts";
import * as H04 from "../../../evaluation/verifier-only/BG-H04/official-runtime-exports.ts";
import * as H05 from "../../../evaluation/verifier-only/BG-H05/official-runtime-exports.ts";
import * as H06 from "../../../evaluation/verifier-only/BG-H06/official-runtime-exports.ts";
import {
  OfficialEvaluatorHandlerOutputSchema,
  OfficialScenarioProviderHandlerOutputSchema,
  type OfficialEvaluatorProcessRequest,
  type OfficialScenarioProviderProcessRequest,
} from "../../../src/official/process/ipc.ts";

const PACKAGES = Object.freeze([
  ["BG-D01", D01], ["BG-D02", D02], ["BG-D03", D03], ["BG-D04", D04],
  ["BG-H01", H01], ["BG-H02", H02], ["BG-H03", H03], ["BG-H04", H04],
  ["BG-H05", H05], ["BG-H06", H06],
] as const);

const EXPECTED_EXPORTS = Object.freeze([
  "OFFICIAL_EVALUATOR_HANDLER",
  "OFFICIAL_SCENARIO_PROVIDER_HANDLER",
]);
const FORBIDDEN_SCENARIO_KEY = /(?:oracle|ground.?truth|expected|verdict|diagnostic|diff|reason.?correct|accepted|failure)/iu;

function findForbiddenKey(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    for (const child of value) {
      const finding = findForbiddenKey(child);
      if (finding) return finding;
    }
    return undefined;
  }
  if (value === null || typeof value !== "object") return undefined;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_SCENARIO_KEY.test(key)) return key;
    const finding = findForbiddenKey(child);
    if (finding) return finding;
  }
  return undefined;
}

function minimalScenarioRequest(fixtureId: string): OfficialScenarioProviderProcessRequest {
  // The handler consumes only the already schema-validated slot binding. The process
  // entrypoint owns validation of the full 40-decision request before invocation.
  return { slot: { fixtureId } } as unknown as OfficialScenarioProviderProcessRequest;
}

test("all verifier packages expose exactly the two standardized runtime handlers", async () => {
  assert.equal(PACKAGES.length, 10);
  for (const [fixtureId, runtimeExports] of PACKAGES) {
    assert.deepEqual(Object.keys(runtimeExports).sort(), EXPECTED_EXPORTS);
    assert.equal(typeof runtimeExports.OFFICIAL_SCENARIO_PROVIDER_HANDLER, "function");
    assert.equal(typeof runtimeExports.OFFICIAL_EVALUATOR_HANDLER, "function");

    const source = await readFile(`evaluation/verifier-only/${fixtureId}/official-runtime-exports.ts`, "utf8");
    assert.match(source, /OFFICIAL_SCENARIO_PROVIDER_HANDLER\([\s\S]*OfficialScenarioProviderProcessRequest[\s\S]*OfficialScenarioProviderHandlerOutput/u);
    assert.match(source, /OFFICIAL_EVALUATOR_HANDLER\([\s\S]*OfficialEvaluatorProcessRequest[\s\S]*OfficialEvaluatorHandlerOutput/u);
    assert.doesNotMatch(source, /console\.(?:log|error|warn|info|debug)/u);
  }
});

test("all scenario handlers return strict neutral output without writing stdout", () => {
  const writes: unknown[] = [];
  const original = { log: console.log, error: console.error, warn: console.warn };
  console.log = (...args: unknown[]) => { writes.push(args); };
  console.error = (...args: unknown[]) => { writes.push(args); };
  console.warn = (...args: unknown[]) => { writes.push(args); };
  try {
    for (const [fixtureId, runtimeExports] of PACKAGES) {
      const output = runtimeExports.OFFICIAL_SCENARIO_PROVIDER_HANDLER(minimalScenarioRequest(fixtureId));
      const parsed = OfficialScenarioProviderHandlerOutputSchema.parse(output);
      assert.ok(parsed.steps.length > 0);
      assert.equal(findForbiddenKey(parsed), undefined);
    }
  } finally {
    console.log = original.log;
    console.error = original.error;
    console.warn = original.warn;
  }
  assert.equal(writes.length, 0);
});

test("evaluator handler returns the exact public schema for a synthetic transcript", () => {
  const request = {
    slot: { fixtureId: "BG-D01" },
    targetArm: "beyondgreen",
    decisions: [{ arm: "beyondgreen", verdict: "reject", rationale: "stale snapshots" }],
    capture: { transcript: {
      fixtureId: "BG-D01",
      frames: [{
        operation: "observe",
        observation: { cardIds: [], allocations: [], selectedIds: [], step: 1, actionLog: [] },
      }],
    } },
  } as unknown as OfficialEvaluatorProcessRequest;
  const output = D01.OFFICIAL_EVALUATOR_HANDLER(request);
  assert.doesNotThrow(() => OfficialEvaluatorHandlerOutputSchema.parse(output));
  assert.deepEqual(Object.keys(output).sort(), [
    "evidence", "groundTruth", "reasonCorrectReject", "schemaValidCompleteReport",
  ]);
});

test("package-local manifests bind all standardized wrapper bytes", async () => {
  for (const [fixtureId] of PACKAGES) {
    const exportPath = `evaluation/verifier-only/${fixtureId}/official-runtime-exports.ts`;
    const manifestPath = `evaluation/verifier-only/${fixtureId}/official-runtime-exports.manifest.json`;
    const [source, manifestSource] = await Promise.all([readFile(exportPath), readFile(manifestPath, "utf8")]);
    const manifest = JSON.parse(manifestSource) as Record<string, unknown>;
    assert.equal(manifest.schema_version, "beyondgreen-official-runtime-exports-manifest@1.0.0");
    assert.equal(manifest.fixture_id, fixtureId);
    assert.equal(manifest.export_path, exportPath);
    assert.deepEqual(manifest.export_names, EXPECTED_EXPORTS.slice().reverse());
    assert.equal(manifest.export_sha256, createHash("sha256").update(source).digest("hex"));
    assert.equal(manifest.manifest_self_excluded, true);
  }
});

test("D01 scenario provider is package-local, neutral, and manifest-bound", async () => {
  const exportPath = "evaluation/verifier-only/BG-D01/scenario-provider.ts";
  const [source, manifestSource] = await Promise.all([
    readFile(exportPath),
    readFile("evaluation/verifier-only/BG-D01/scenario-provider.manifest.json", "utf8"),
  ]);
  const manifest = JSON.parse(manifestSource) as Record<string, unknown>;
  assert.equal(manifest.fixture_id, "BG-D01");
  assert.equal(manifest.export_path, exportPath);
  assert.equal(manifest.export_name, "NEUTRAL_SCENARIO_PROVIDER_EXPORT");
  assert.equal(manifest.export_sha256, createHash("sha256").update(source).digest("hex"));
});

test("D03 evaluator preserves and consumes every frozen scenario operation", async () => {
  const source = await readFile("evaluation/verifier-only/BG-D03/official-runtime-exports.ts", "utf8");
  assert.match(source, /"construct", "add", "set-packet-count", "observe", "render-summary"/u);
  assert.match(source, /summaryMatches/u);
});
