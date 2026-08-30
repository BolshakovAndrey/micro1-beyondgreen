/** Verifies the frozen arm-visible legacy assertions against both BG-D04 candidates. */
import assert from "node:assert/strict";
import test from "node:test";

import { BulletinPanel as PreservingCandidate } from "../../../candidates/BG-D04/preserving/BulletinPanel.ts";
import { BulletinPanel as FalseGreenCandidate } from "../../../candidates/BG-D04/false-green/BulletinPanel.ts";
import { VISIBLE_ASSERTIONS } from "./visible-assertions.ts";

for (const assertion of VISIBLE_ASSERTIONS) {
  test(`${assertion.id} ${assertion.title}`, async () => {
    assert.equal(await assertion.run(PreservingCandidate), true, "preserving");
    assert.equal(await assertion.run(FalseGreenCandidate), true, "false-green");
  });
}
