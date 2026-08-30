/** Cross-fixture registry and descriptor regression checks for exactly D01-D04. */
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { DEVELOPMENT_FIXTURES } from "../src/fixtures/development.ts";
import { taskRegistry } from "../scripts/tasks/registry.ts";

test("development descriptors form the exact D01-D04 fixture/task bijection", () => {
  assert.equal(DEVELOPMENT_FIXTURES.length, 4);
  assert.deepEqual(DEVELOPMENT_FIXTURES.map(({ fixtureId }) => fixtureId), ["BG-D01", "BG-D02", "BG-D03", "BG-D04"]);
  assert.equal(new Set(DEVELOPMENT_FIXTURES.map(({ behaviorClass }) => behaviorClass)).size, 4);
  assert.equal(new Set(DEVELOPMENT_FIXTURES.map(({ verificationTask }) => verificationTask)).size, 4);
  const taskNames = new Set(taskRegistry.map(({ name }) => name));
  for (const fixture of DEVELOPMENT_FIXTURES) {
    assert.equal(fixture.membership, "development");
    assert.equal(fixture.candidateIds.length, 2);
    assert.equal(taskNames.has(fixture.verificationTask), true);
    assert.equal(existsSync(fixture.armVisibleRoot), true);
    assert.equal(existsSync(fixture.verifierOnlyRoot), true);
    for (const manifest of fixture.manifestPaths) assert.equal(existsSync(manifest), true, manifest);
  }
});

test("discarded QueueBatchCounter MJS prototype is absent and ParcelDispatchBoard is retained", () => {
  assert.equal(existsSync("candidates/BG-D02/candidate-a/ParcelDispatchBoard.ts"), true);
  assert.equal(existsSync("candidates/BG-D02/candidate-b/ParcelDispatchBoard.ts"), true);
  assert.equal(existsSync("candidates/BG-D02/QueueBatchCounter.mjs"), false);
});

