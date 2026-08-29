import assert from "node:assert/strict";
import test from "node:test";

import { MuseumBoard as CandidateA } from "../../../candidates/BG-D01/candidate-a/MuseumBoard.ts";
import { MuseumBoard as CandidateB } from "../../../candidates/BG-D01/candidate-b/MuseumBoard.ts";
import { LegacyMuseumBoard } from "./LegacyMuseumBoard.ts";
import { mountMuseumBoard } from "./harness.ts";

const implementations = [
  ["legacy-reference", LegacyMuseumBoard],
  ["candidate-a", CandidateA],
  ["candidate-b", CandidateB],
] as const;

test("BG-D01 arm-visible step contract fails closed before state or log mutation", async () => {
  for (const [implementationId, Component] of implementations) {
    const board = await mountMuseumBoard(Component);
    try {
      const before = board.observe();
      for (const invalidStep of [0, -1, 1.5, Number.NaN]) {
        await assert.rejects(
          board.dispatch({ type: "set-step", value: invalidStep }),
          { name: "RangeError", message: "Museum board step must be a positive integer." },
          implementationId,
        );
        assert.deepEqual(board.observe(), before, implementationId);
      }
    }
    finally {
      await board.dispose();
    }
  }
});
