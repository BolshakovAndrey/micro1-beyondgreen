#!/usr/bin/env node
/** Builds or verifies the bounded file manifest for the complete D01 vertical slice. */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { D01_FIXTURE } from "../src/d01/fixture.ts";

const outputPath = D01_FIXTURE.verticalManifestPath;
const sourcePaths = [
  "src/d01/arm-checks.ts",
  "src/d01/candidate.ts",
  "src/d01/capability-schemas.ts",
  "src/d01/capability.ts",
  "src/d01/canonical-json.ts",
  "src/d01/decision.ts",
  "src/d01/engine.ts",
  "src/d01/execution.ts",
  "src/d01/fixture.ts",
  "src/d01/orchestrator.ts",
  "src/d01/reasoning.ts",
  "src/d01/replay.ts",
  "src/d01/replay-core.ts",
  "src/d01/report.ts",
  "src/d01/risk.ts",
  "src/d01/runtime.ts",
  "src/d01/schema-factory.ts",
  "src/d01/schemas.ts",
  "src/d01/worker-bindings.ts",
  "src/d01/worker-runtime.ts",
  "scripts/d01-arm-worker.ts",
  "scripts/d01-candidate-observer-worker.ts",
  "scripts/d01-demo.ts",
  "scripts/d01-evaluator-worker.ts",
  "scripts/d01-hash-reconciliation.ts",
  "scripts/d01-manifests.ts",
  "scripts/d01-replay.ts",
  "scripts/d01-vertical-manifest.ts",
  "scripts/tasks/d01.ts",
  "tests/d01-boundary.test.ts",
  "tests/d01-descriptor-injection.test.ts",
  "tests/d01-package-binding.test.ts",
  "tests/d01-vertical-slice.test.ts",
  "tests/fixtures/test-only-arm-worker.ts",
  "tests/fixtures/test-only-engine.ts",
  "tests/fixtures/test-only-evaluator-worker.ts",
  "tests/fixtures/test-only-observer-worker.ts",
] as const;

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

const sourceFiles = sourcePaths.map((path) => ({ path, sha256: sha256(readFileSync(path)) }));
const packageSha256 = sha256(sourceFiles.map((file) => `${file.path}\0${file.sha256}\n`).join(""));
const candidateA = JSON.parse(readFileSync(D01_FIXTURE.candidates["candidate-a"].manifestPath, "utf8")) as {source_files: Array<{sha256: string}>};
const candidateB = JSON.parse(readFileSync(D01_FIXTURE.candidates["candidate-b"].manifestPath, "utf8")) as {source_files: Array<{sha256: string}>};
const manifest = {
  schema_version: "1.0",
  fixture_id: D01_FIXTURE.fixtureId,
  package_id: "BG-D01-vertical-slice",
  package_kind: "unscored_verify_existing_vertical_slice",
  immutable: true,
  official_or_scored: false,
  hash_algorithm: "SHA-256",
  source_files: sourceFiles,
  package_sha256: packageSha256,
  frozen_foundation: {
    candidate_a_sha256: candidateA.source_files[0]?.sha256,
    candidate_b_sha256: candidateB.source_files[0]?.sha256,
    pre_review_combined_d01_manifest_digest: "5273199f8d591068ae827874d80352947eb511844fdf6ccabbcbce9edacccdcf",
    current_combined_d01_manifest_digest: "a4469b1798963dbaa23b2f5901accedcd3650952db8345f70f5d2041a3d90524",
  },
  semantic_guards: {
    candidate_sources_changed: false,
    frozen_visible_test_count: D01_FIXTURE.armVisible.visibleAssertionIds.length,
    verifier_behavior_changed: false,
    verifier_package_changed: true,
    verifier_isolation_implementation_changed: true,
    pre_decision_evaluator_feedback_rounds: 0,
  },
};
const serialized = `${JSON.stringify(manifest, null, 2)}\n`;

if (process.argv.includes("--write")) {
  writeFileSync(outputPath, serialized);
  process.stdout.write(`D01_VERTICAL_MANIFEST_WRITTEN ${sourceFiles.length} ${packageSha256}\n`);
}
else if (readFileSync(outputPath, "utf8") === serialized) {
  process.stdout.write(`D01_VERTICAL_MANIFEST_VERIFIED ${sourceFiles.length} ${packageSha256}\n`);
}
else {
  process.stderr.write("D01_VERTICAL_MANIFEST_MISMATCH\n");
  process.exitCode = 1;
}
