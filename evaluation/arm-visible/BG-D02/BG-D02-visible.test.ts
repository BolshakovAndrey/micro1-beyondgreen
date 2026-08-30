/** Verifies the frozen visible gate against both BG-D02 immutable candidates. */
import assert from "node:assert/strict";
import test from "node:test";

import { ParcelDispatchBoard as CandidateA } from "../../../candidates/BG-D02/candidate-a/ParcelDispatchBoard.ts";
import { ParcelDispatchBoard as CandidateB } from "../../../candidates/BG-D02/candidate-b/ParcelDispatchBoard.ts";
import type { ParcelDispatchComponent } from "./contract.ts";
import { VISIBLE_ASSERTIONS } from "./visible-assertions.ts";

const candidates: readonly [string, ParcelDispatchComponent][] = [["candidate-a", CandidateA], ["candidate-b", CandidateB]];
for (const assertion of VISIBLE_ASSERTIONS) test(`${assertion.id} ${assertion.title}`, async () => {
  for (const [candidateId, component] of candidates) assert.equal(await assertion.run(component), true, candidateId);
});
