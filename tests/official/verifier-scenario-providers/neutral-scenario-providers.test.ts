import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { NEUTRAL_SCENARIO_PROVIDER_EXPORT as D02 } from "../../../evaluation/verifier-only/BG-D02/scenario-provider.ts";
import { NEUTRAL_SCENARIO_PROVIDER_EXPORT as D03 } from "../../../evaluation/verifier-only/BG-D03/scenario-provider.ts";
import { NEUTRAL_SCENARIO_PROVIDER_EXPORT as D04 } from "../../../evaluation/verifier-only/BG-D04/scenario-provider.ts";
import { NEUTRAL_SCENARIO_PROVIDER_EXPORT as H01 } from "../../../evaluation/verifier-only/BG-H01/scenario-provider.ts";
import { NEUTRAL_SCENARIO_PROVIDER_EXPORT as H02 } from "../../../evaluation/verifier-only/BG-H02/scenario-provider.ts";
import { NEUTRAL_SCENARIO_PROVIDER_EXPORT as H03 } from "../../../evaluation/verifier-only/BG-H03/scenario-provider.ts";
import { NEUTRAL_SCENARIO_PROVIDER_EXPORT as H04 } from "../../../evaluation/verifier-only/BG-H04/scenario-provider.ts";
import { NEUTRAL_SCENARIO_PROVIDER_EXPORT as H05 } from "../../../evaluation/verifier-only/BG-H05/scenario-provider.ts";
import { NEUTRAL_SCENARIO_PROVIDER_EXPORT as H06 } from "../../../evaluation/verifier-only/BG-H06/scenario-provider.ts";
import {
  OfficialScenarioProviderHandlerOutputSchema,
  parseAndFreezeProcessIpc,
} from "../../../src/official/process/ipc.ts";

const FIXTURES = Object.freeze([
  ["BG-D02", D02], ["BG-D03", D03], ["BG-D04", D04],
  ["BG-H01", H01], ["BG-H02", H02], ["BG-H03", H03],
  ["BG-H04", H04], ["BG-H05", H05], ["BG-H06", H06],
] as const);

const FORBIDDEN_KEY = /(?:oracle|ground.?truth|expected|verdict|diagnostic|diff|reason.?correct|accepted|failure)/iu;

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
    if (FORBIDDEN_KEY.test(key)) return key;
    const finding = findForbiddenKey(child);
    if (finding) return finding;
  }
  return undefined;
}

assert.equal(FIXTURES.length, 9);
assert.equal(new Set(FIXTURES.map(([fixtureId]) => fixtureId)).size, 9);

for (const [fixtureId, scenario] of FIXTURES) {
  test(`${fixtureId} exports one immutable neutral handler payload`, () => {
    const parsed = parseAndFreezeProcessIpc(OfficialScenarioProviderHandlerOutputSchema, scenario);
    assert.match(parsed.scenarioId, new RegExp(`^${fixtureId}:`, "u"));
    assert.ok(parsed.steps.length > 0);
    assert.equal(findForbiddenKey(parsed), undefined);
    // The process boundary binds nested JSON by digest; these public containers
    // prevent sequence replacement before the entrypoint creates that envelope.
    assert.equal(Object.isFrozen(parsed), true);
    assert.equal(Object.isFrozen(parsed.steps), true);
  });
}

test("recursive schema blocks evaluator-shaped data for every fixture export", () => {
  for (const [, scenario] of FIXTURES) {
    const unsafe = {
      ...scenario,
      steps: [{ ...scenario.steps[0], parameters: { nested: { expected: "redacted" } } }],
    };
    assert.equal(OfficialScenarioProviderHandlerOutputSchema.safeParse(unsafe).success, false);
  }
});

test("package-local manifests bind every scenario-provider export byte-for-byte", async () => {
  for (const [fixtureId] of FIXTURES) {
    const exportPath = `evaluation/verifier-only/${fixtureId}/scenario-provider.ts`;
    const manifestPath = `evaluation/verifier-only/${fixtureId}/scenario-provider.manifest.json`;
    const [source, manifestSource] = await Promise.all([readFile(exportPath), readFile(manifestPath, "utf8")]);
    const manifest = JSON.parse(manifestSource) as Record<string, unknown>;
    assert.equal(manifest.schema_version, "beyondgreen-neutral-scenario-manifest@1.0.0");
    assert.equal(manifest.fixture_id, fixtureId);
    assert.equal(manifest.export_path, exportPath);
    assert.equal(manifest.export_name, "NEUTRAL_SCENARIO_PROVIDER_EXPORT");
    assert.equal(manifest.export_sha256, createHash("sha256").update(source).digest("hex"));
    assert.equal(manifest.manifest_self_excluded, true);
  }
});

test("scenario-provider modules have no candidate or evaluator-module dependency", async () => {
  for (const [fixtureId] of FIXTURES) {
    const source = await readFile(`evaluation/verifier-only/${fixtureId}/scenario-provider.ts`, "utf8");
    assert.doesNotMatch(source, /(?:from|import\s*\()[^\n]*(?:candidates\/|ground-truth|canonical-driver)/u);
  }
});
