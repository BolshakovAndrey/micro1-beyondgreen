/** Runs the unchanged BG-H04 visible gate against both neutral candidates. */
import assert from "node:assert/strict";
import test from "node:test";

import { AstronomyChecklist as CandidateA } from "../../../candidates/BG-H04/candidate-a/AstronomyChecklist.ts";
import { AstronomyChecklist as CandidateB } from "../../../candidates/BG-H04/candidate-b/AstronomyChecklist.ts";
import type { AstronomyDrawerComponent } from "./contract.ts";
import { VISIBLE_ASSERTIONS } from "./visible-assertions.ts";

const candidates: readonly [string, AstronomyDrawerComponent][] = [["candidate-a", CandidateA], ["candidate-b", CandidateB]];
for (const assertion of VISIBLE_ASSERTIONS) test(`${assertion.id} ${assertion.title}`, async () => {
  for (const [candidateId, Component] of candidates) assert.equal(await assertion.run(Component), true, candidateId);
});
