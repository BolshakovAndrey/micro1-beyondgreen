/** Verifies the BG-H01 oracle mapping without exposing it to either arm. */
import assert from "node:assert/strict";
import test from "node:test";

import { DisplayCardEditor as CandidateA } from "../../../candidates/BG-H01/candidate-a/DisplayCardEditor.ts";
import { DisplayCardEditor as CandidateB } from "../../../candidates/BG-H01/candidate-b/DisplayCardEditor.ts";
import { evaluateCanonicalScenario } from "./canonical-driver.ts";

test("BG-H01 evaluator accepts preserving behavior", async () => {
  assert.deepEqual(await evaluateCanonicalScenario(CandidateA), { accepted: true, failedAction: null, behaviorClass: "prop_reset" });
});
test("BG-H01 evaluator rejects the seeded false green at identity change", async () => {
  assert.deepEqual(await evaluateCanonicalScenario(CandidateB), { accepted: false, failedAction: "switch-card-02", behaviorClass: "prop_reset" });
});
