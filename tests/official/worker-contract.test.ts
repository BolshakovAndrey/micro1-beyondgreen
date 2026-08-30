import assert from "node:assert/strict";
import test from "node:test";

import { OFFICIAL_FIXTURE_WORKER_CONTRACT } from "../../src/official/worker-contract.ts";

test("fixture workers receive one frozen explicit adapter contract and no execution authority", () => {
  assert.equal(OFFICIAL_FIXTURE_WORKER_CONTRACT.schemaVersion, "beyondgreen-official-fixture-worker@1.0.0");
  assert.deepEqual(OFFICIAL_FIXTURE_WORKER_CONTRACT.constructionKinds, ["mount_function", "class_constructor"]);
  assert.equal(OFFICIAL_FIXTURE_WORKER_CONTRACT.sharedPathsMutableByWorkers, false);
  assert.equal(OFFICIAL_FIXTURE_WORKER_CONTRACT.candidateExecutionAllowed, false);
  assert.equal(OFFICIAL_FIXTURE_WORKER_CONTRACT.officialOrScoredRunAllowed, false);
  assert.equal(OFFICIAL_FIXTURE_WORKER_CONTRACT.unblindingAllowed, false);
  assert.equal(Object.isFrozen(OFFICIAL_FIXTURE_WORKER_CONTRACT), true);
});
