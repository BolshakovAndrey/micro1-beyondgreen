import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { createPreUnblindingRunPlan } from "../../../src/official/runner.ts";
import { BG_D03_OFFICIAL_ADAPTER } from "../../../src/official/fixtures/bg-d03.ts";

test("BG-D03 adapter explicitly binds the TrayPlanner constructor without a mount harness", () => {
  assert.equal(BG_D03_OFFICIAL_ADAPTER.fixtureId, "BG-D03");
  assert.deepEqual(BG_D03_OFFICIAL_ADAPTER.candidates.map(({ candidateId }) => candidateId), ["candidate-a", "candidate-b"]);
  for (const candidate of BG_D03_OFFICIAL_ADAPTER.candidates) {
    assert.equal(candidate.module.exportName, "TrayPlanner");
    assert.equal(candidate.construction.kind, "class_constructor");
    if (candidate.construction.kind !== "class_constructor") throw new Error("Expected class construction.");
    assert.deepEqual(candidate.construction.binding, candidate.module);
    assert.equal(candidate.construction.argumentsFactory.exportName, "createBGD03ConstructorArguments");
  }
  assert.deepEqual(BG_D03_OFFICIAL_ADAPTER.armVisible.actions[0]?.names, ["add", "setPacketCount", "remove", "reset"]);
  assert.equal(BG_D03_OFFICIAL_ADAPTER.observerEntrypoint.exportName, "captureBGD03ObservationTranscript");
  assert.equal(BG_D03_OFFICIAL_ADAPTER.evaluatorEntrypoint.exportName, "evaluateBGD03ObservationTranscript");
});

test("BG-D03 plans remain pre-unblinding and do not import or execute a real candidate", () => {
  const source = readFileSync("src/official/fixtures/bg-d03.ts", "utf8");
  assert.doesNotMatch(source, /from\s+["'].*candidates\/BG-D03/u);
  const plan = createPreUnblindingRunPlan(BG_D03_OFFICIAL_ADAPTER, "candidate-a");
  assert.equal(plan.constructionKind, "class_constructor");
  assert.equal(plan.candidateExecutionAllowed, false);
  assert.equal(plan.officialOrScoredRun, false);
  assert.ok(plan.roles.arm.denyReadPaths.includes("evaluation/verifier-only/BG-D03"));
  assert.ok(plan.roles.arm.denyReadPaths.includes("src/official/evaluator-only/bg-d03.ts"));
  assert.ok(plan.roles.observer.denyReadPaths.includes("src/official/evaluator-only/bg-d03.ts"));
  assert.ok(!plan.roles.arm.allowReadPaths.includes("src/official/evaluator-only/bg-d03.ts"));
  assert.ok(!plan.roles.observer.allowReadPaths.includes("src/official/evaluator-only/bg-d03.ts"));
  assert.ok(plan.roles.evaluator.denyReadPaths.includes("candidates/BG-D03/candidate-a/TrayPlanner.ts"));
  assert.ok(plan.roles.evaluator.denyReadPaths.includes("evaluation/arm-visible/BG-D03"));
  assert.ok(plan.roles.evaluator.denyReadPaths.includes("src/official/fixtures/bg-d03.ts"));
});
