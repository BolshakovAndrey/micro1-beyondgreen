import assert from "node:assert/strict";
import test from "node:test";

import { MuseumBoard as CandidateA } from "../../../candidates/BG-D01/candidate-a/MuseumBoard.ts";
import { MuseumBoard as CandidateB } from "../../../candidates/BG-D01/candidate-b/MuseumBoard.ts";
import { CARD_IDS, everyThirdCardIds, type MuseumBoardComponent } from "./contract.ts";
import { mountMuseumBoard } from "./harness.ts";

const candidates: readonly [string, MuseumBoardComponent][] = [
  ["candidate-a", CandidateA],
  ["candidate-b", CandidateB],
];

async function forEachCandidate(
  assertion: (candidateId: string, component: MuseumBoardComponent) => Promise<void>,
) {
  for (const [candidateId, component] of candidates) await assertion(candidateId, component);
}

test("BG-D01-VIS-001 mount exposes the frozen initial board", async () => {
  await forEachCandidate(async (candidateId, component) => {
    const board = await mountMuseumBoard(component);
    try {
      const observation = board.observe();
      assert.deepEqual(observation.cardIds, CARD_IDS, candidateId);
      assert.deepEqual(observation.allocations, Array.from({ length: 300 }, () => 0), candidateId);
      assert.equal(observation.step, 1, candidateId);
      assert.deepEqual(observation.selectedIds, [], candidateId);
    }
    finally {
      await board.dispose();
    }
  });
});

test("BG-D01-VIS-002 select-all replaces selection in ascending order", async () => {
  await forEachCandidate(async (candidateId, component) => {
    const board = await mountMuseumBoard(component);
    try {
      const observation = await board.dispatch({ type: "select-all" });
      assert.deepEqual(observation.selectedIds, CARD_IDS, candidateId);
      assert.equal(new Set(observation.selectedIds).size, 300, candidateId);
    }
    finally {
      await board.dispose();
    }
  });
});

test("BG-D01-VIS-003 allocate once changes selected cards only", async () => {
  await forEachCandidate(async (candidateId, component) => {
    const board = await mountMuseumBoard(component);
    try {
      await board.dispatch({ type: "select-every-third" });
      const observation = await board.dispatch({ type: "allocate", multiplicity: 1 });
      const selected = new Set(everyThirdCardIds());
      assert.deepEqual(
        observation.allocations,
        CARD_IDS.map((id) => selected.has(id) ? 1 : 0),
        candidateId,
      );
    }
    finally {
      await board.dispose();
    }
  });
});

test("BG-D01-VIS-004 step change is inert and remove once clamps selected cards", async () => {
  await forEachCandidate(async (candidateId, component) => {
    const board = await mountMuseumBoard(component);
    try {
      await board.dispatch({ type: "select-all" });
      const beforeStep = await board.dispatch({ type: "allocate", multiplicity: 1 });
      const afterStep = await board.dispatch({ type: "set-step", value: 3 });
      assert.deepEqual(afterStep.allocations, beforeStep.allocations, candidateId);
      const afterRemove = await board.dispatch({ type: "remove", multiplicity: 1 });
      assert.deepEqual(afterRemove.allocations, Array.from({ length: 300 }, () => 0), candidateId);
      assert.ok(afterRemove.allocations.every((value) => value >= 0), candidateId);
    }
    finally {
      await board.dispose();
    }
  });
});

test("BG-D01-VIS-005 reset restores visible state", async () => {
  await forEachCandidate(async (candidateId, component) => {
    const board = await mountMuseumBoard(component);
    try {
      await board.dispatch({ type: "select-all" });
      await board.dispatch({ type: "allocate", multiplicity: 1 });
      await board.dispatch({ type: "set-step", value: 3 });
      const observation = await board.dispatch({ type: "reset" });
      assert.deepEqual(observation.allocations, Array.from({ length: 300 }, () => 0), candidateId);
      assert.equal(observation.step, 1, candidateId);
      assert.deepEqual(observation.selectedIds, [], candidateId);
    }
    finally {
      await board.dispose();
    }
  });
});
