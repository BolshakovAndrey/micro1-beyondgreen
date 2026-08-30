/** Verifies the frozen ten-fixture registry, membership, class, isolation, and K=0 contracts. */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { FIXTURES, HELD_OUT_FIXTURES } from "../src/fixtures/development.ts";
import { taskRegistry } from "../scripts/tasks/registry.ts";

const expectedClasses = [
  "stale_snapshots", "queued_batched_updates", "derived_state", "subscription_cleanup", "prop_reset",
  "async_ordering", "identity_stability", "conditional_lifecycle", "external_store", "rollback",
];

test("registry is an exact ten-fixture class bijection with 4/6 membership", () => {
  assert.equal(FIXTURES.length, 10);
  assert.equal(FIXTURES.filter(({ membership }) => membership === "development").length, 4);
  assert.equal(FIXTURES.filter(({ membership }) => membership === "held_out").length, 6);
  assert.deepEqual(FIXTURES.map(({ behaviorClass }) => behaviorClass).toSorted(), expectedClasses.toSorted());
  assert.equal(new Set(FIXTURES.map(({ fixtureId }) => fixtureId)).size, 10);
  assert.equal(new Set(FIXTURES.map(({ verificationTask }) => verificationTask)).size, 10);
  const taskNames = new Set(taskRegistry.map(({ name }) => name));
  for (const fixture of FIXTURES) {
    assert.equal(fixture.candidateIds.length, 2);
    assert.equal(taskNames.has(fixture.verificationTask), true);
    assert.equal(existsSync(fixture.armVisibleRoot), true);
    assert.equal(existsSync(fixture.verifierOnlyRoot), true);
    for (const manifestPath of fixture.manifestPaths) assert.equal(existsSync(manifestPath), true, manifestPath);
  }
});

test("BG-H02 is the sole predeclared challenging case", () => {
  const assignment = readFileSync("evaluation/fixture-assignments.yaml", "utf8");
  const challenging = [...assignment.matchAll(/fixture_id: "([^"]+)"[^\n]+challenging_case: true/g)].map((match) => match[1]);
  assert.deepEqual(challenging, ["BG-H02"]);
  assert.match(readFileSync("evaluation/challenging-cases.yaml", "utf8"), /fixture_id: "BG-H02"/);
});

test("held-out descriptors expose exactly two neutral candidates and no mapping", () => {
  for (const fixture of HELD_OUT_FIXTURES) assert.deepEqual(fixture.candidateIds, ["candidate-a", "candidate-b"]);
  const descriptorSource = readFileSync("src/fixtures/development.ts", "utf8");
  const heldOutDeclarations = descriptorSource.slice(
    descriptorSource.indexOf("export const HELD_OUT_FIXTURES"),
    descriptorSource.indexOf("export const FIXTURES"),
  );
  assert.doesNotMatch(heldOutDeclarations, /preserving|false[-_]green/i);
});

test("all held-out reciprocal permission probes prove physical denial", () => {
  for (const fixture of HELD_OUT_FIXTURES) {
    const arm = spawnSync(process.execPath, ["--permission", `--allow-fs-read=${fixture.armVisibleRoot}`, `${fixture.armVisibleRoot}/denied-probe.mjs`], { encoding: "utf8" });
    assert.equal(arm.status, 0, arm.stderr);
    const armProof = JSON.parse(arm.stdout) as Record<string, unknown>;
    assert.equal(armProof.allDenied, true, fixture.fixtureId);
    const evaluator = spawnSync(process.execPath, ["--permission", `--allow-fs-read=${fixture.verifierOnlyRoot}`, `${fixture.verifierOnlyRoot}/evaluator-denied-probe.mjs`], { encoding: "utf8" });
    assert.equal(evaluator.status, 0, evaluator.stderr);
    const evaluatorProof = JSON.parse(evaluator.stdout) as Record<string, unknown>;
    assert.equal(evaluatorProof.allDenied ?? evaluatorProof.allCandidateAccessDenied, true, fixture.fixtureId);
  }
});

test("held-out verifier packages declare K=0 and mapping exposure only there", () => {
  for (const fixture of HELD_OUT_FIXTURES) {
    const groundTruth = JSON.parse(readFileSync(`${fixture.verifierOnlyRoot}/ground-truth.json`, "utf8")) as Record<string, unknown>;
    assert.equal(groundTruth.pre_verdict_evaluator_feedback_rounds ?? groundTruth.verifier_feedback_rounds ?? 0, 0);
    assert.equal(Object.keys(groundTruth).some((key) => /candidate|mapping/i.test(key)), true);
  }
});
