/** Runs the unchanged BG-H03 visible assertions against both neutral candidates. */
import assert from "node:assert/strict";
import test from "node:test";

import { SeedLibrarySelectionDesk as CandidateA } from "../../../candidates/BG-H03/candidate-a/SeedLibrarySelectionDesk.ts";
import { SeedLibrarySelectionDesk as CandidateB } from "../../../candidates/BG-H03/candidate-b/SeedLibrarySelectionDesk.ts";
import type { SelectionDeskComponent } from "./contract.ts";
import { VISIBLE_ASSERTIONS } from "./visible-assertions.ts";

const candidates: readonly [string, SelectionDeskComponent][] = [["candidate-a", CandidateA], ["candidate-b", CandidateB]];
for (const assertion of VISIBLE_ASSERTIONS) test(`${assertion.id} ${assertion.title}`, async () => {
  for (const [candidateId, Component] of candidates) assert.equal(await assertion.run(Component), true, candidateId);
});
