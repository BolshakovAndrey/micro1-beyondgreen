/** Verifies that the BG-D02 oracle accepts preserving behavior and rejects the seeded defect. */
import assert from "node:assert/strict";
import test from "node:test";

import { ParcelDispatchBoard as CandidateA } from "../../../candidates/BG-D02/candidate-a/ParcelDispatchBoard.ts";
import { ParcelDispatchBoard as CandidateB } from "../../../candidates/BG-D02/candidate-b/ParcelDispatchBoard.ts";
import { evaluateCanonicalScenario } from "./canonical-driver.ts";

test("BG-D02 evaluator accepts the preserving candidate", async () => {
  assert.deepEqual(await evaluateCanonicalScenario(CandidateA), { accepted: true, failedAction: null, behaviorClass: "queued_batched_updates" });
});
test("BG-D02 evaluator rejects the seeded false green at the first two-entry queue", async () => {
  assert.deepEqual(await evaluateCanonicalScenario(CandidateB), { accepted: false, failedAction: "queue-1x2", behaviorClass: "queued_batched_updates" });
});
