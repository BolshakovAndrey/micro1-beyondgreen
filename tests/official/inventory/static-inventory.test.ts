import assert from "node:assert/strict";
import test from "node:test";

import {
  adaptD03PackageManifest,
  adaptFrozenJsonManifest,
} from "../../../src/official/inventory/manifest-adapters.ts";
import {
  assertStaticExportDeclaration,
  validateOfficialFrozenInventory,
} from "../../../src/official/inventory/preflight.ts";

const repositoryRoot = process.cwd();

test("static official inventory validates exactly 10 fixtures and 20 candidates without execution", () => {
  const result = validateOfficialFrozenInventory(repositoryRoot);
  assert.equal(result.fixtureCount, 10);
  assert.equal(result.candidateCount, 20);
  assert.equal(result.executionSlotCount, 20);
  assert.equal(result.developmentFixtureCount, 4);
  assert.equal(result.heldOutFixtureCount, 6);
  assert.equal(result.fixtures.length, 10);
  assert.equal(result.slots.length, 20);
  assert.equal(new Set(result.slots.map(({ fixtureId, candidateId }) => `${fixtureId}:${candidateId}`)).size, 20);
  assert.equal(new Set(result.slots.map(({ modulePath }) => modulePath)).size, 20);
  assert.ok(result.slots.every(({ candidateSha256 }) => /^[a-f0-9]{64}$/u.test(candidateSha256)));
  assert.ok(result.slots.every(({ descriptor, modulePath, exportName }) => (
    descriptor.modulePath.length > 0 && descriptor.exportName.length > 0
      && modulePath.startsWith("candidates/") && exportName.length > 0
  )));
  assert.equal(new Set(result.fixtures.map(({ behaviorClass }) => behaviorClass)).size, 10);
  assert.match(result.inventorySha256, /^[a-f0-9]{64}$/u);
  assert.equal(result.candidateImportsPerformed, false);
  assert.equal(result.candidateExecutionPerformed, false);
  assert.equal(result.verifierContentParsed, false);
  assert.equal(result.officialOrScoredRun, false);
  assert.equal(result.unblindingPerformed, false);
  assert.ok(result.verifiedManifestCount > 0);
  assert.ok(result.verifiedFrozenFileCount >= 20);
  assert.ok(Object.isFrozen(result));
  assert.ok(Object.isFrozen(result.fixtures));
  assert.ok(Object.isFrozen(result.slots));
  assert.ok(result.slots.every((slot) => Object.isFrozen(slot) && Object.isFrozen(slot.descriptor)));
});

test("manifest adapters fail closed on unsupported, escaping, and incomplete bindings", () => {
  assert.throws(
    () => adaptFrozenJsonManifest('{"schema_version":"1.0","fixture_id":"BG-D01"}', "BG-D01", "manifest.json"),
    /Unsupported frozen manifest format/u,
  );
  assert.throws(
    () => adaptFrozenJsonManifest(JSON.stringify({
      schema_version: "1.0",
      fixture_id: "BG-D01",
      immutable: true,
      hash_algorithm: "SHA-256",
      source_files: [{ path: "../outside.ts", sha256: "a".repeat(64) }],
      package_sha256: "b".repeat(64),
    }), "BG-D01", "manifest.json"),
    /canonical repository-relative path/u,
  );
  assert.throws(
    () => adaptD03PackageManifest('schema_version: "1.0"\nfixture_id: "BG-D03"\nintegrity:\n  algorithm: "sha256"\n', "BG-D03", "evaluation/manifests/BG-D03/package-manifest.yaml"),
    /exactly eleven frozen files/u,
  );
});

test("static export inspection accepts declarations and rejects inferred or absent names", () => {
  assert.equal(assertStaticExportDeclaration("export class TrayPlanner {}", "TrayPlanner"), true);
  assert.equal(assertStaticExportDeclaration("const local = 1; export { local as Candidate };", "Candidate"), true);
  assert.throws(() => assertStaticExportDeclaration("const Candidate = 1;", "Candidate"), /Missing explicit export/u);
  assert.throws(() => assertStaticExportDeclaration("export const = ;", "Candidate"), /Cannot statically parse/u);
});
