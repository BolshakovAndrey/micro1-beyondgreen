/** Verifies the frozen BG-H02 visible gate against both neutral candidates. */
import assert from "node:assert/strict";
import test from "node:test";
import { StargazingGuidePreview as CandidateA } from "../../../candidates/BG-H02/candidate-a/StargazingGuidePreview.ts";
import { StargazingGuidePreview as CandidateB } from "../../../candidates/BG-H02/candidate-b/StargazingGuidePreview.ts";
import type { StargazingGuideComponent } from "./contract.ts";
import { VISIBLE_ASSERTIONS } from "./visible-assertions.ts";
const candidates: readonly [string, StargazingGuideComponent][] = [["candidate-a", CandidateA], ["candidate-b", CandidateB]];
for (const assertion of VISIBLE_ASSERTIONS) test(`${assertion.id} ${assertion.title}`, async () => { for (const [candidateId, component] of candidates) assert.equal(await assertion.run(component), true, candidateId); });
