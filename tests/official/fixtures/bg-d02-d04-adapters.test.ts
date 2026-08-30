import assert from "node:assert/strict";
import test from "node:test";

import { BG_D02_OFFICIAL_FIXTURE_ADAPTER } from "../../../src/official/fixtures/bg-d02.ts";
import { BG_D04_OFFICIAL_FIXTURE_ADAPTER } from "../../../src/official/fixtures/bg-d04.ts";
import { createPreUnblindingRunPlan } from "../../../src/official/runner.ts";

const expectedDescriptors = [
  {
    descriptor: BG_D02_OFFICIAL_FIXTURE_ADAPTER,
    fixtureId: "BG-D02",
    behaviorClass: "queued_batched_updates",
    candidateIds: ["candidate-a", "candidate-b"],
    candidateModules: [
      "candidates/BG-D02/candidate-a/ParcelDispatchBoard.ts",
      "candidates/BG-D02/candidate-b/ParcelDispatchBoard.ts",
    ],
    candidateExport: "ParcelDispatchBoard",
    mountModule: "evaluation/arm-visible/BG-D02/harness.ts",
    mountExport: "mountParcelDispatchBoard",
    armVisibleRoot: "evaluation/arm-visible/BG-D02",
    verifierOnlyRoot: "evaluation/verifier-only/BG-D02",
    evaluatorModule: "evaluation/verifier-only/BG-D02/canonical-driver.ts",
    visibleAssertionIds: [
      "BG-D02-VIS-001", "BG-D02-VIS-002", "BG-D02-VIS-003", "BG-D02-VIS-004", "BG-D02-VIS-005",
    ],
  },
  {
    descriptor: BG_D04_OFFICIAL_FIXTURE_ADAPTER,
    fixtureId: "BG-D04",
    behaviorClass: "subscription_cleanup",
    candidateIds: ["preserving", "false-green"],
    candidateModules: [
      "candidates/BG-D04/preserving/BulletinPanel.ts",
      "candidates/BG-D04/false-green/BulletinPanel.ts",
    ],
    candidateExport: "BulletinPanel",
    mountModule: "evaluation/arm-visible/BG-D04/harness.ts",
    mountExport: "mountBulletinPanel",
    armVisibleRoot: "evaluation/arm-visible/BG-D04",
    verifierOnlyRoot: "evaluation/verifier-only/BG-D04",
    evaluatorModule: "evaluation/verifier-only/BG-D04/canonical-driver.ts",
    visibleAssertionIds: ["BG-D04-VIS-001", "BG-D04-VIS-002", "BG-D04-VIS-003", "BG-D04-VIS-004"],
  },
] as const;

test("BG-D02 and BG-D04 adapters expose only explicit frozen package bindings", () => {
  for (const expected of expectedDescriptors) {
    const descriptor = expected.descriptor;
    assert.equal(descriptor.fixtureId, expected.fixtureId);
    assert.equal(descriptor.membership, "development");
    assert.equal(descriptor.behaviorClass, expected.behaviorClass);
    assert.deepEqual(descriptor.candidates.map(({ candidateId }) => candidateId), expected.candidateIds);
    assert.deepEqual(descriptor.candidates.map(({ module }) => module.modulePath), expected.candidateModules);
    assert.deepEqual(descriptor.candidates.map(({ module }) => module.exportName), [expected.candidateExport, expected.candidateExport]);
    assert.ok(descriptor.candidates.every(({ construction }) => construction.kind === "mount_function"));
    assert.ok(descriptor.candidates.every(({ construction }) => construction.binding.modulePath === expected.mountModule));
    assert.ok(descriptor.candidates.every(({ construction }) => construction.binding.exportName === expected.mountExport));
    assert.equal(descriptor.armVisible.rootPath, expected.armVisibleRoot);
    assert.ok(descriptor.armVisible.contracts.length > 0);
    assert.ok(descriptor.armVisible.invariants.length > 0);
    assert.ok(descriptor.armVisible.actions.length > 0);
    assert.ok(descriptor.armVisible.observations.length > 0);
    assert.deepEqual(descriptor.armVisible.visibleAssertions.flatMap(({ names }) => names), expected.visibleAssertionIds);
    assert.equal(descriptor.observerEntrypoint.modulePath, expected.mountModule);
    assert.equal(descriptor.observerEntrypoint.exportName, expected.mountExport);
    assert.equal(descriptor.evaluatorEntrypoint.modulePath, expected.evaluatorModule);
    assert.equal(descriptor.evaluatorEntrypoint.exportName, "evaluateCanonicalObservations");
    assert.equal(descriptor.verifierOnlyRoot, expected.verifierOnlyRoot);
    assert.equal(Object.isFrozen(descriptor), true);
  }
});

test("BG-D02 and BG-D04 pre-unblinding plans keep evaluator capability candidate-free", () => {
  for (const expected of expectedDescriptors) {
    for (const candidate of expected.descriptor.candidates) {
      const plan = createPreUnblindingRunPlan(expected.descriptor, candidate.candidateId);
      assert.equal(plan.candidateModulePath, candidate.module.modulePath);
      assert.equal(plan.constructionKind, "mount_function");
      assert.equal(plan.roles.arm.entrypoint.exportName, expected.mountExport);
      assert.equal(plan.roles.observer.entrypoint.exportName, expected.mountExport);
      assert.equal(plan.roles.evaluator.entrypoint.exportName, "evaluateCanonicalObservations");
      assert.ok(plan.roles.arm.allowReadPaths.includes(candidate.module.modulePath));
      assert.ok(plan.roles.observer.allowReadPaths.includes(candidate.module.modulePath));
      assert.ok(plan.roles.arm.denyReadPaths.includes(expected.verifierOnlyRoot));
      assert.ok(plan.roles.observer.denyReadPaths.includes(expected.verifierOnlyRoot));
      assert.ok(plan.roles.evaluator.allowReadPaths.includes(expected.verifierOnlyRoot));
      assert.ok(plan.roles.evaluator.denyReadPaths.includes(candidate.module.modulePath));
      assert.ok(plan.roles.evaluator.denyReadPaths.includes(expected.armVisibleRoot));
      assert.equal(plan.officialOrScoredRun, false);
      assert.equal(plan.candidateExecutionAllowed, false);
      assert.equal(plan.unblindingPerformed, false);
      assert.equal(plan.runRecordCreated, false);
    }
  }
});
