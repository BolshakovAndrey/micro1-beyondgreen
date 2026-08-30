/** Confirms that the hidden BG-H05 oracle distinguishes the neutral candidate pair. */
import assert from "node:assert/strict";
import test from "node:test";
import { UnitReadout as CandidateA } from "../../../candidates/BG-H05/candidate-a/UnitReadout.ts";
import { UnitReadout as CandidateB } from "../../../candidates/BG-H05/candidate-b/UnitReadout.ts";
import { evaluateCanonicalScenario } from "./canonical-driver.ts";

test("BG-H05 verifier accepts candidate-a", async () => {
  assert.deepEqual(await evaluateCanonicalScenario(CandidateA), { accepted: true, failedAction: null, behaviorClass: "external_store" });
});
test("BG-H05 verifier rejects candidate-b", async () => {
  assert.deepEqual(await evaluateCanonicalScenario(CandidateB), { accepted: false, failedAction: "mount-pair", behaviorClass: "external_store" });
});
