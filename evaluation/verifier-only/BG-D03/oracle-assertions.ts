import assert from "node:assert/strict";

/** Minimum public shape needed to execute the hidden derived-state oracle. */
export interface OraclePlanner {
  readonly snapshot: {
    readonly selected: readonly { readonly varietyId: string; readonly packetCount: number }[];
    readonly occupiedCells: number;
    readonly remainingCells: number;
    readonly overCapacity: boolean;
  };
  add(varietyId: string): boolean;
  setPacketCount(varietyId: string, packetCount: number): boolean;
}

/** Constructor shape used so the oracle can exercise either immutable candidate. */
export interface OraclePlannerConstructor {
  new (capacity: number, varieties: readonly { readonly id: string; readonly label: string; readonly cellsPerPacket: number }[]): OraclePlanner;
}

/**
 * Checks the frozen hidden sequence, including the source update that visible tests omit.
 * The summary assertion prevents a candidate from repairing only its object snapshot.
 */
export const assertDerivedStateOracle = (
  Planner: OraclePlannerConstructor,
): OraclePlanner => {
  const planner = new Planner(8, [
    { id: "radish", label: "Radish", cellsPerPacket: 3 },
  ]);

  assert.equal(planner.add("radish"), true);
  assert.equal(planner.setPacketCount("radish", 3), true);
  assert.deepEqual(planner.snapshot, {
    selected: [{ varietyId: "radish", packetCount: 3 }],
    occupiedCells: 9,
    remainingCells: -1,
    overCapacity: true,
  });
  return planner;
};
