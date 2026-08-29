import assert from "node:assert/strict";
import test from "node:test";

import { MuseumBoard as CandidateA } from "../../../candidates/BG-D01/candidate-a/MuseumBoard.ts";
import { MuseumBoard as CandidateB } from "../../../candidates/BG-D01/candidate-b/MuseumBoard.ts";
import { LegacyMuseumBoard } from "../../arm-visible/BG-D01/LegacyMuseumBoard.ts";
import { evaluateCanonicalScenario } from "./canonical-driver.ts";

test("BG-D01 verifier accepts the shared legacy React reference", async () => {
  const result = await evaluateCanonicalScenario(LegacyMuseumBoard);
  assert.deepEqual(result, { accepted: true, failedAction: null, behaviorClass: "stale_snapshots" });
});

test("BG-D01 verifier accepts the preserving candidate", async () => {
  const result = await evaluateCanonicalScenario(CandidateA);
  assert.deepEqual(result, { accepted: true, failedAction: null, behaviorClass: "stale_snapshots" });
});

test("BG-D01 verifier rejects the single-family false green", async () => {
  const result = await evaluateCanonicalScenario(CandidateB);
  assert.deepEqual(result, { accepted: false, failedAction: "allocate-1x2", behaviorClass: "stale_snapshots" });
});
