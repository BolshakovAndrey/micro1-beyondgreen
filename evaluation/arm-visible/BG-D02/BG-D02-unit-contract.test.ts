/** Confirms invalid unit actions fail closed before an observable state transition. */
import assert from "node:assert/strict";
import test from "node:test";

import { ParcelDispatchBoard as CandidateA } from "../../../candidates/BG-D02/candidate-a/ParcelDispatchBoard.ts";
import { ParcelDispatchBoard as CandidateB } from "../../../candidates/BG-D02/candidate-b/ParcelDispatchBoard.ts";
import { mountParcelDispatchBoard } from "./harness.ts";

test("BG-D02 invalid unit values fail closed before state or log mutation", async () => {
  for (const [candidateId, Component] of [["candidate-a", CandidateA], ["candidate-b", CandidateB]] as const) {
    const board = await mountParcelDispatchBoard(Component);
    try {
      const before = board.observe();
      for (const invalidUnit of [0, -1, 1.5, Number.NaN]) {
        await assert.rejects(board.dispatch({ type: "set-unit", value: invalidUnit }), { name: "RangeError", message: "Parcel dispatch unit must be a positive integer." }, candidateId);
        assert.deepEqual(board.observe(), before, candidateId);
      }
    } finally { await board.dispose(); }
  }
});
