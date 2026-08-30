import assert from "node:assert/strict";
import test from "node:test";

import { createOfficialExecutionPlan } from "../../../src/official/integration/execution-plan.ts";
import { validateOfficialFrozenInventory } from "../../../src/official/inventory/index.ts";
import { resolveTask } from "../../../scripts/tasks/registry.ts";

test("static preflight builds exactly twenty deterministic candidate slots and forty arm plans", () => {
  const inventory = validateOfficialFrozenInventory(process.cwd());
  const plan = createOfficialExecutionPlan(inventory);
  assert.equal(plan.slotCount, 20);
  assert.equal(plan.totalArmPlans, 40);
  assert.equal(plan.slots.length, 20);
  assert.equal(new Set(plan.slots.map(({ slotId }) => slotId)).size, 20);
  assert.deepEqual(plan.slots.map(({ ordinal }) => ordinal), Array.from({ length: 20 }, (_, index) => index + 1));
  assert.ok(plan.slots.every(({ arms, attemptOrdinal }) => (
    arms[0] === "status-quo" && arms[1] === "beyondgreen" && attemptOrdinal === 1
  )));
  assert.equal(plan.candidateExecutionAllowed, false);
  assert.equal(plan.officialOrScoredRun, false);
  assert.equal(plan.unblindingPerformed, false);
  assert.equal(plan.runRecordCreated, false);
  assert.ok(Object.isFrozen(plan));
  assert.ok(Object.isFrozen(plan.slots));
  assert.ok(plan.slots.every((slot) => (
    Object.isFrozen(slot)
    && Object.isFrozen(slot.candidate)
    && Object.isFrozen(slot.descriptor)
    && Object.isFrozen(slot.arms)
  )));
  assert.throws(() => {
    (plan.slots[0]!.candidate as {sha256: string}).sha256 = "0".repeat(64);
  }, TypeError);
  assert.throws(() => {
    (plan.slots[0]!.arms as unknown as string[]).push("status-quo");
  }, TypeError);
});

test("official preflight task is one shell-free static step", () => {
  const task = resolveTask("official:preflight", []);
  assert.equal(task.steps.length, 1);
  assert.deepEqual(task.steps[0]!.arguments, ["scripts/d00-official-preflight.ts"]);
});
