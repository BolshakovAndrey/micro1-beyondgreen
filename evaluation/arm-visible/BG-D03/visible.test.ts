import assert from "node:assert/strict";
import test from "node:test";

import { TrayPlanner as PreservingTrayPlanner } from "../../../candidates/BG-D03/candidate-a/TrayPlanner.ts";
import { TrayPlanner as FalseGreenTrayPlanner } from "../../../candidates/BG-D03/candidate-b/TrayPlanner.ts";

const visibleCatalog = [
  { id: "basil", label: "Basil", cellsPerPacket: 2 },
  { id: "marigold", label: "Marigold", cellsPerPacket: 3 },
] as const;

const candidates = [
  ["preserving", PreservingTrayPlanner],
  ["false-green", FalseGreenTrayPlanner],
] as const;

for (const [candidateId, Planner] of candidates) {
  test(`BG-D03 visible legacy behavior remains green for ${candidateId}`, () => {
    const planner = new Planner(8, visibleCatalog);
    assert.deepEqual(planner.snapshot, {
      selected: [],
      occupiedCells: 0,
      remainingCells: 8,
      overCapacity: false,
    });

    assert.equal(planner.add("basil"), true);
    assert.deepEqual(planner.snapshot.selected, [{ varietyId: "basil", packetCount: 1 }]);
    assert.equal(planner.setPacketCount("basil", 3), true);
    // This legacy assertion deliberately observes source state only after an edit.
    assert.deepEqual(planner.snapshot.selected, [{ varietyId: "basil", packetCount: 3 }]);

    assert.equal(planner.add("marigold"), true);
    assert.equal(planner.remove("basil"), true);
    assert.deepEqual(planner.snapshot.selected, [{ varietyId: "marigold", packetCount: 1 }]);
    planner.reset();
    assert.deepEqual(planner.snapshot, {
      selected: [],
      occupiedCells: 0,
      remainingCells: 8,
      overCapacity: false,
    });

    assert.equal(planner.add("unknown"), false);
    assert.equal(planner.setPacketCount("marigold", 0), false);
    assert.equal(planner.remove("marigold"), false);
  });
}
