/** Confirms that the hidden BG-H03 oracle distinguishes the neutral candidate pair. */
import assert from "node:assert/strict";
import test from "node:test";

import { SeedLibrarySelectionDesk as CandidateA } from "../../../candidates/BG-H03/candidate-a/SeedLibrarySelectionDesk.ts";
import { SeedLibrarySelectionDesk as CandidateB } from "../../../candidates/BG-H03/candidate-b/SeedLibrarySelectionDesk.ts";
import { evaluateCanonicalScenario } from "./canonical-driver.ts";

test("BG-H03 evaluator accepts candidate-a", async () => {
  assert.deepEqual(await evaluateCanonicalScenario(CandidateA), { accepted: true, failedAction: null, behaviorClass: "identity_stability" });
});
test("BG-H03 evaluator rejects candidate-b for identity instability", async () => {
  assert.deepEqual(await evaluateCanonicalScenario(CandidateB), { accepted: false, failedAction: "note-spring", behaviorClass: "identity_stability" });
});
