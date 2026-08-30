import assert from "node:assert/strict";
import test from "node:test";

import { BG_H01_OFFICIAL_FIXTURE } from "../../../src/official/fixtures/bg-h01.ts";
import { BG_H02_OFFICIAL_FIXTURE } from "../../../src/official/fixtures/bg-h02.ts";
import { BG_H03_OFFICIAL_FIXTURE } from "../../../src/official/fixtures/bg-h03.ts";
import { createPreUnblindingRunPlan } from "../../../src/official/runner.ts";

const fixtures = [BG_H01_OFFICIAL_FIXTURE, BG_H02_OFFICIAL_FIXTURE, BG_H03_OFFICIAL_FIXTURE] as const;

test("BG-H01 through BG-H03 adapters name every frozen binding without importing candidates", () => {
  assert.deepEqual(fixtures.map(({ fixtureId }) => fixtureId), ["BG-H01", "BG-H02", "BG-H03"]);
  for (const descriptor of fixtures) {
    assert.equal(descriptor.membership, "held_out");
    assert.deepEqual(descriptor.candidates.map(({ candidateId }) => candidateId), ["candidate-a", "candidate-b"]);
    assert.ok(descriptor.candidates.every(({ construction }) => construction.kind === "mount_function"));
    assert.ok(descriptor.candidates.every(({ construction }) => construction.binding.modulePath === `evaluation/arm-visible/${descriptor.fixtureId}/harness.ts`));
    assert.ok(descriptor.candidates.every(({ construction }) => construction.binding.exportName.startsWith("mount")));
    assert.ok(descriptor.armVisible.contracts.every(({ binding, names }) => binding.exportName.length > 0 && names.length > 0));
    assert.ok(descriptor.armVisible.invariants.every(({ binding, names }) => binding.exportName === "ARM_VISIBLE_INVARIANTS" && names.length > 0));
    assert.ok(descriptor.armVisible.actions.every(({ binding, names }) => binding.exportName.length > 0 && names.length > 0));
    assert.ok(descriptor.armVisible.observations.every(({ binding, names }) => binding.exportName.length > 0 && names.length > 0));
    assert.ok(descriptor.armVisible.visibleAssertions.every(({ binding, names }) => binding.exportName === "VISIBLE_ASSERTIONS" && names.length > 0));
    assert.equal(descriptor.observerEntrypoint.modulePath, `evaluation/arm-visible/${descriptor.fixtureId}/harness.ts`);
    assert.equal(descriptor.evaluatorEntrypoint.modulePath, `evaluation/verifier-only/${descriptor.fixtureId}/canonical-driver.ts`);
    assert.equal(descriptor.evaluatorEntrypoint.exportName, "evaluateCanonicalObservations");
    assert.equal(Object.isFrozen(descriptor), true);
  }
});

test("BG-H01 through BG-H03 produce plan-only role boundaries for both explicit candidates", () => {
  for (const descriptor of fixtures) {
    for (const candidate of descriptor.candidates) {
      const plan = createPreUnblindingRunPlan(descriptor, candidate.candidateId);
      assert.equal(plan.fixtureId, descriptor.fixtureId);
      assert.equal(plan.candidateModulePath, candidate.module.modulePath);
      assert.equal(plan.constructionKind, "mount_function");
      assert.equal(plan.candidateExecutionAllowed, false);
      assert.equal(plan.officialOrScoredRun, false);
      assert.equal(plan.unblindingPerformed, false);
      assert.equal(plan.runRecordCreated, false);
      assert.equal(plan.roles.arm.entrypoint.exportName, candidate.construction.binding.exportName);
      assert.equal(plan.roles.observer.entrypoint.exportName, descriptor.observerEntrypoint.exportName);
      assert.equal(plan.roles.evaluator.entrypoint.exportName, "evaluateCanonicalObservations");
      assert.deepEqual(plan.roles.arm.denyReadPaths, [descriptor.verifierOnlyRoot]);
      assert.deepEqual(plan.roles.observer.denyReadPaths, [descriptor.verifierOnlyRoot]);
      assert.ok(plan.roles.evaluator.denyReadPaths.includes(candidate.module.modulePath));
      assert.ok(plan.roles.evaluator.denyReadPaths.includes(descriptor.armVisible.rootPath));
      assert.equal(plan.roles.arm.networkAllowed, false);
      assert.equal(plan.roles.observer.networkAllowed, false);
      assert.equal(plan.roles.evaluator.networkAllowed, false);
      assert.equal("execute" in plan, false);
    }
  }
});
