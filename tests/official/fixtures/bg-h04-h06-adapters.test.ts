import assert from "node:assert/strict";
import test from "node:test";

import { BG_H04_OFFICIAL_FIXTURE } from "../../../src/official/fixtures/bg-h04.ts";
import { BG_H05_OFFICIAL_FIXTURE } from "../../../src/official/fixtures/bg-h05.ts";
import { BG_H06_OFFICIAL_FIXTURE } from "../../../src/official/fixtures/bg-h06.ts";
import { createPreUnblindingRunPlan } from "../../../src/official/runner.ts";

const descriptors = [
  {
    descriptor: BG_H04_OFFICIAL_FIXTURE,
    fixtureId: "BG-H04",
    behaviorClass: "conditional_lifecycle",
    candidateFile: "AstronomyChecklist.ts",
    candidateExport: "AstronomyChecklist",
    mountExport: "mountAstronomyDrawer",
  },
  {
    descriptor: BG_H05_OFFICIAL_FIXTURE,
    fixtureId: "BG-H05",
    behaviorClass: "external_store",
    candidateFile: "UnitReadout.ts",
    candidateExport: "UnitReadout",
    mountExport: "mountUnitStoreFixture",
  },
  {
    descriptor: BG_H06_OFFICIAL_FIXTURE,
    fixtureId: "BG-H06",
    behaviorClass: "rollback",
    candidateFile: "ThemePanel.ts",
    candidateExport: "ThemePanel",
    mountExport: "mountThemePanel",
  },
] as const;

test("BG-H04 through BG-H06 adapters bind every frozen surface explicitly", () => {
  for (const expected of descriptors) {
    const { descriptor } = expected;
    assert.equal(descriptor.fixtureId, expected.fixtureId);
    assert.equal(descriptor.membership, "held_out");
    assert.equal(descriptor.behaviorClass, expected.behaviorClass);
    assert.equal(descriptor.candidates.length, 2);
    assert.deepEqual(descriptor.candidates.map(({ candidateId }) => candidateId), ["candidate-a", "candidate-b"]);
    for (const candidate of descriptor.candidates) {
      assert.equal(candidate.module.modulePath, `candidates/${expected.fixtureId}/${candidate.candidateId}/${expected.candidateFile}`);
      assert.equal(candidate.module.exportName, expected.candidateExport);
      assert.equal(candidate.construction.kind, "mount_function");
      assert.equal(candidate.construction.binding.exportName, expected.mountExport);
      if (candidate.construction.kind !== "mount_function") assert.fail("Expected an explicit mount-function binding.");
      assert.equal(candidate.construction.candidateArgument, "component_export");
    }
    assert.equal(descriptor.observerEntrypoint.exportName, expected.mountExport);
    assert.equal(descriptor.evaluatorEntrypoint.exportName, "evaluateCanonicalObservations");
    assert.match(descriptor.evaluatorEntrypoint.modulePath, /evaluation\/verifier-only\/BG-H0[456]\/canonical-driver\.ts$/u);
    for (const surface of [
      descriptor.armVisible.contracts,
      descriptor.armVisible.invariants,
      descriptor.armVisible.actions,
      descriptor.armVisible.observations,
      descriptor.armVisible.visibleAssertions,
    ]) {
      assert.ok(surface.length > 0);
      assert.ok(surface.every(({ binding, names }) => binding.exportName.length > 0 && names.length > 0));
    }
    assert.equal(Object.isFrozen(descriptor), true);
  }
});

test("BG-H04 through BG-H06 plans preserve the pre-unblinding role boundary", () => {
  for (const { descriptor } of descriptors) {
    for (const { candidateId, module } of descriptor.candidates) {
      const plan = createPreUnblindingRunPlan(descriptor, candidateId);
      assert.equal(plan.candidateExecutionAllowed, false);
      assert.equal(plan.officialOrScoredRun, false);
      assert.equal(plan.unblindingPerformed, false);
      assert.equal(plan.runRecordCreated, false);
      assert.equal(plan.roles.arm.entrypoint.exportName, descriptor.candidates[0]!.construction.binding.exportName);
      assert.equal(plan.roles.observer.entrypoint.exportName, descriptor.observerEntrypoint.exportName);
      assert.equal(plan.roles.evaluator.entrypoint.exportName, "evaluateCanonicalObservations");
      assert.ok(plan.roles.arm.denyReadPaths.includes(descriptor.verifierOnlyRoot));
      assert.ok(plan.roles.observer.denyReadPaths.includes(descriptor.verifierOnlyRoot));
      assert.ok(plan.roles.evaluator.denyReadPaths.includes(module.modulePath));
      assert.ok(plan.roles.evaluator.denyReadPaths.includes(descriptor.armVisible.rootPath));
      assert.equal(plan.roles.arm.networkAllowed, false);
      assert.equal(plan.roles.observer.networkAllowed, false);
      assert.equal(plan.roles.evaluator.networkAllowed, false);
    }
  }
});
