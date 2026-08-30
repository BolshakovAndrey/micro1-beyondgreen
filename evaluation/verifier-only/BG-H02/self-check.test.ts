/** Verifies the BG-H02 oracle mapping and challenging-case schedule. */
import assert from "node:assert/strict";
import test from "node:test";
import { StargazingGuidePreview as CandidateA } from "../../../candidates/BG-H02/candidate-a/StargazingGuidePreview.ts";
import { StargazingGuidePreview as CandidateB } from "../../../candidates/BG-H02/candidate-b/StargazingGuidePreview.ts";
import { evaluateCanonicalScenario } from "./canonical-driver.ts";
test("BG-H02 evaluator accepts current-epoch completion behavior", async () => { assert.deepEqual(await evaluateCanonicalScenario(CandidateA), { accepted: true, failedAction: null, behaviorClass: "async_ordering" }); });
test("BG-H02 evaluator rejects stale reverse-order completion", async () => { assert.deepEqual(await evaluateCanonicalScenario(CandidateB), { accepted: false, failedAction: "complete-R1", behaviorClass: "async_ordering" }); });
