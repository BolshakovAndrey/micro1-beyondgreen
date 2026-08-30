/** Confirms that the hidden BG-D04 oracle distinguishes the frozen candidate pair. */
import assert from "node:assert/strict";
import test from "node:test";

import { BulletinPanel as PreservingCandidate } from "../../../candidates/BG-D04/preserving/BulletinPanel.ts";
import { BulletinPanel as FalseGreenCandidate } from "../../../candidates/BG-D04/false-green/BulletinPanel.ts";
import { evaluateCanonicalScenario } from "./canonical-driver.ts";

test("BG-D04 verifier accepts the preserving candidate", async () => {
  assert.deepEqual(await evaluateCanonicalScenario(PreservingCandidate), {
    accepted: true, failedAction: null, behaviorClass: "subscription_cleanup",
  });
});

test("BG-D04 verifier rejects the seeded false green", async () => {
  assert.deepEqual(await evaluateCanonicalScenario(FalseGreenCandidate), {
    accepted: false, failedAction: "step-2", behaviorClass: "subscription_cleanup",
  });
});
