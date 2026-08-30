/** Verifies the four frozen BG-H06 visible assertions against both neutral candidates. */
import assert from "node:assert/strict";
import test from "node:test";

import { ThemePanel as CandidateA } from "../../../candidates/BG-H06/candidate-a/ThemePanel.ts";
import { ThemePanel as CandidateB } from "../../../candidates/BG-H06/candidate-b/ThemePanel.ts";
import { VISIBLE_ASSERTIONS } from "./visible-assertions.ts";

for (const assertion of VISIBLE_ASSERTIONS) {
  test(`${assertion.id} ${assertion.title}`, async () => {
    assert.equal(await assertion.run(CandidateA), true, "candidate-a");
    assert.equal(await assertion.run(CandidateB), true, "candidate-b");
  });
}
