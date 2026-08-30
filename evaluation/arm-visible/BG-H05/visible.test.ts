/** Verifies the four frozen BG-H05 visible assertions against both neutral candidates. */
import assert from "node:assert/strict";
import test from "node:test";

import { UnitReadout as CandidateA } from "../../../candidates/BG-H05/candidate-a/UnitReadout.ts";
import { UnitReadout as CandidateB } from "../../../candidates/BG-H05/candidate-b/UnitReadout.ts";
import { VISIBLE_ASSERTIONS } from "./visible-assertions.ts";

for (const assertion of VISIBLE_ASSERTIONS) {
  test(`${assertion.id} ${assertion.title}`, async () => {
    assert.equal(await assertion.run(CandidateA), true, "candidate-a");
    assert.equal(await assertion.run(CandidateB), true, "candidate-b");
  });
}
