/** Verifies the frozen arm-visible assertion set against both immutable D01 candidates. */
import assert from "node:assert/strict";
import test from "node:test";

import { MuseumBoard as CandidateA } from "../../../candidates/BG-D01/candidate-a/MuseumBoard.ts";
import { MuseumBoard as CandidateB } from "../../../candidates/BG-D01/candidate-b/MuseumBoard.ts";
import type { MuseumBoardComponent } from "./contract.ts";
import { VISIBLE_ASSERTIONS } from "./visible-assertions.ts";

const candidates: readonly [string, MuseumBoardComponent][] = [
  ["candidate-a", CandidateA],
  ["candidate-b", CandidateB],
];

for (const assertion of VISIBLE_ASSERTIONS) {
  test(`${assertion.id} ${assertion.title}`, async () => {
    for (const [candidateId, component] of candidates) {
      assert.equal(await assertion.run(component), true, candidateId);
    }
  });
}
