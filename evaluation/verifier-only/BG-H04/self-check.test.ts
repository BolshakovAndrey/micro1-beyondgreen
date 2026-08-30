/** Confirms that the hidden BG-H04 oracle distinguishes the neutral candidate pair. */
import assert from "node:assert/strict";
import test from "node:test";

import { AstronomyChecklist as CandidateA } from "../../../candidates/BG-H04/candidate-a/AstronomyChecklist.ts";
import { AstronomyChecklist as CandidateB } from "../../../candidates/BG-H04/candidate-b/AstronomyChecklist.ts";
import { evaluateCanonicalScenario } from "./canonical-driver.ts";

test("BG-H04 evaluator accepts candidate-a", async () => {
  assert.deepEqual(await evaluateCanonicalScenario(CandidateA), { accepted: true, failedAction: null, behaviorClass: "conditional_lifecycle" });
});
test("BG-H04 evaluator rejects candidate-b for retained lifecycle", async () => {
  assert.deepEqual(await evaluateCanonicalScenario(CandidateB), { accepted: false, failedAction: "mount-parent", behaviorClass: "conditional_lifecycle" });
});
