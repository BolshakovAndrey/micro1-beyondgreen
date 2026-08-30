import assert from "node:assert/strict";
import test from "node:test";

import { defineOfficialFixtureDescriptor } from "../../src/official/contracts.ts";
import { createPreUnblindingRunPlan } from "../../src/official/runner.ts";
import { createTestOfficialDescriptor } from "./test-descriptor.ts";

test("explicit descriptor exposes every required binding without D01 imports or name inference", () => {
  const descriptor = createTestOfficialDescriptor();
  assert.equal(descriptor.fixtureId, "BG-D02");
  assert.equal(descriptor.candidates[0]?.module.exportName, "TestCandidate");
  assert.equal(descriptor.candidates[0]?.construction.kind, "mount_function");
  assert.deepEqual(descriptor.armVisible.actions[0]?.names, ["observe"]);
  assert.equal(descriptor.observerEntrypoint.exportName, "observeTestCandidate");
  assert.equal(descriptor.evaluatorEntrypoint.exportName, "evaluateTestObservations");
  assert.ok(Object.isFrozen(descriptor));
  assert.throws(() => defineOfficialFixtureDescriptor({ fixtureId: "BG-D01" }), /Invalid|expected|option/i);
  assert.throws(() => defineOfficialFixtureDescriptor({ ...descriptor, observerEntrypoint: undefined }), /observerEntrypoint/);
  assert.throws(() => defineOfficialFixtureDescriptor({
    ...descriptor,
    candidates: descriptor.candidates.map((candidate) => ({ ...candidate, module: { ...candidate.module, modulePath: "../candidate.ts" } })),
  }), /repository relative/i);
});

test("pre-unblinding runner produces plans but has no candidate executor or run record", () => {
  const plan = createPreUnblindingRunPlan(createTestOfficialDescriptor(), "candidate-a");
  assert.equal(plan.officialOrScoredRun, false);
  assert.equal(plan.candidateExecutionAllowed, false);
  assert.equal(plan.unblindingPerformed, false);
  assert.equal(plan.runRecordCreated, false);
  assert.deepEqual(Object.keys(plan.roles).sort(), ["arm", "evaluator", "observer"]);
  assert.equal("execute" in plan, false);
});
