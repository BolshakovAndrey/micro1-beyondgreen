/** Defines the complete arm-visible BG-D02 dispatch-board API and behavior contract. */
import type { ComponentType, Ref } from "react";

/** Fixes the stable lane order shared by candidates and deterministic checks. */
export const LANE_IDS = Object.freeze(
  Array.from({ length: 6 }, (_, index) => `PCL-${String(index + 1).padStart(2, "0")}`),
);

/** Enumerates the public actions supported by the synthetic parcel dispatch board. */
export type DispatchAction =
  | { type: "select-all" }
  | { type: "select-even" }
  | { type: "set-unit"; value: number }
  | { type: "queue"; entries: 1 | 2 }
  | { type: "flush" }
  | { type: "reset" };

/** Captures all arm-visible observables needed for deterministic behavior checks. */
export type DispatchObservation = Readonly<{
  laneIds: readonly string[];
  pending: readonly number[];
  dispatched: readonly number[];
  selectedIds: readonly string[];
  unit: number;
  actionLog: readonly string[];
}>;

/** Defines the imperative harness surface exposed by a dispatch-board candidate. */
export type ParcelDispatchHandle = Readonly<{ dispatch(action: DispatchAction): void }>;

/** Describes a React component that can be mounted by the shared arm-visible harness. */
export type ParcelDispatchComponent = ComponentType<{ ref?: Ref<ParcelDispatchHandle> }>;

/** Describes the public invariant that risk-directed probes must check without oracle data. */
export type ArmVisibleInvariantContract = Readonly<{
  id: "BG-D02-INV-QUEUE-ACCUMULATION";
  riskCategories: readonly ["ordering"];
  probeId: "BG-D02-PROBE-TWO-ENTRIES";
  description: string;
}>;

/** Does not reveal which immutable candidate contains the seeded defect. */
export const ARM_VISIBLE_INVARIANTS: readonly ArmVisibleInvariantContract[] = Object.freeze([{
  id: "BG-D02-INV-QUEUE-ACCUMULATION",
  riskCategories: ["ordering"],
  probeId: "BG-D02-PROBE-TWO-ENTRIES",
  description: "Two queue entries requested in one event add two current units to every selected lane.",
}]);

/** Creates a fresh zero count vector in canonical lane order. */
export function initialCounts(): number[] {
  return Array.from({ length: LANE_IDS.length }, () => 0);
}

/** Returns the canonical even-numbered lane selection. */
export function evenLaneIds(): readonly string[] {
  return LANE_IDS.filter((_, index) => (index + 1) % 2 === 0);
}

/** Canonicalizes arbitrary identifiers as a de-duplicated ascending selection. */
export function normalizeSelection(ids: readonly string[]): string[] {
  const selected = new Set(ids);
  return LANE_IDS.filter((id) => selected.has(id));
}

/** Adds a delta to selected lanes while preserving the immutable positional vector contract. */
export function adjustSelected(snapshot: readonly number[], selectedIds: readonly string[], delta: number): number[] {
  const selected = new Set(selectedIds);
  return snapshot.map((value, index) => selected.has(LANE_IDS[index]!) ? Math.max(0, value + delta) : value);
}

/** Converts a validated public action into its stable observable log label. */
export function actionLabel(action: DispatchAction, currentUnit: number): string {
  switch (action.type) {
    case "select-all":
    case "select-even":
    case "flush":
    case "reset":
      return action.type;
    case "set-unit":
      assertPositiveIntegerUnit(action.value);
      return `unit-${action.value}`;
    case "queue":
      return `queue-${currentUnit}x${action.entries}`;
  }
}

/** Rejects invalid units before any state or action-log mutation can occur. */
export function assertPositiveIntegerUnit(value: number): void {
  // Unit validation is performed before deriving a label so rejected actions cannot
  // create a partially observed queued-update event.
  if (!Number.isInteger(value) || value <= 0) throw new RangeError("Parcel dispatch unit must be a positive integer.");
}
