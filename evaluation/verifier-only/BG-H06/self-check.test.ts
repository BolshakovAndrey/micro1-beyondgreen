/** Confirms that the hidden BG-H06 oracle distinguishes the neutral candidate pair. */
import assert from "node:assert/strict";
import test from "node:test";
import { ThemePanel as CandidateA } from "../../../candidates/BG-H06/candidate-a/ThemePanel.ts";
import { ThemePanel as CandidateB } from "../../../candidates/BG-H06/candidate-b/ThemePanel.ts";
import { evaluateCanonicalScenario } from "./canonical-driver.ts";

test("BG-H06 verifier accepts candidate-a", async () => {
  assert.deepEqual(await evaluateCanonicalScenario(CandidateA), { accepted: true, failedAction: null, behaviorClass: "rollback" });
});
test("BG-H06 verifier rejects candidate-b", async () => {
  assert.deepEqual(await evaluateCanonicalScenario(CandidateB), { accepted: false, failedAction: "reject-save", behaviorClass: "rollback" });
});
