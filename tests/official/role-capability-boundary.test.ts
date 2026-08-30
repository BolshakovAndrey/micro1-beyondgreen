import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";

import { createPreUnblindingRunPlan } from "../../src/official/runner.ts";
import type { RoleCapabilityPlan } from "../../src/official/adapters/types.ts";
import { createTestOfficialDescriptor } from "./test-descriptor.ts";

function canRead(plan: RoleCapabilityPlan, relativePath: string): boolean {
  const allowedArguments = plan.allowReadPaths.flatMap((entry) => [
    "--allow-fs-read",
    path.resolve(entry),
  ]);
  const result = spawnSync(process.execPath, [
    "--permission",
    ...allowedArguments,
    "--input-type=module",
    "--eval",
    `import { readFileSync } from "node:fs"; readFileSync(${JSON.stringify(path.resolve(relativePath))});`,
  ], { cwd: process.cwd(), encoding: "utf8" });
  return result.status === 0;
}

test("synthetic arm and observer can read public inputs but physically deny verifier-only bytes", () => {
  const plan = createPreUnblindingRunPlan(createTestOfficialDescriptor(), "candidate-a");
  for (const role of [plan.roles.arm, plan.roles.observer]) {
    assert.equal(canRead(role, "tests/official/fixtures/arm-visible/contract.mjs"), true);
    assert.equal(canRead(role, "tests/official/fixtures/verifier-only/oracle.json"), false);
    assert.deepEqual(role.denyReadPaths, ["tests/official/fixtures/verifier-only"]);
    assert.equal(role.networkAllowed, false);
  }
});

test("synthetic evaluator can read its oracle but physically denies candidate and arm-visible bytes", () => {
  const plan = createPreUnblindingRunPlan(createTestOfficialDescriptor(), "candidate-a");
  const evaluator = plan.roles.evaluator;
  assert.equal(canRead(evaluator, "tests/official/fixtures/verifier-only/oracle.json"), true);
  assert.equal(canRead(evaluator, "tests/official/fixtures/candidates/candidate-a.mjs"), false);
  assert.equal(canRead(evaluator, "tests/official/fixtures/arm-visible/contract.mjs"), false);
  assert.equal(evaluator.networkAllowed, false);
});
