/**
 * Defines the complete arm-visible D01 board API and behavior contracts shared by
 * candidates, legacy checks, and oracle-free probes without revealing ground truth.
 */
import type { ComponentType, Ref } from "react";

/** Fixes the board cardinality shared by candidates, visible checks, and observation schemas. */
export const CARD_COUNT = 300;

/** Provides the canonical stable card order used for state vectors and selection normalization. */
export const CARD_IDS = Object.freeze(
  Array.from({ length: CARD_COUNT }, (_, index) => `MVG-${String(index + 1).padStart(3, "0")}`),
);

/** Enumerates the complete public action domain that a D01 candidate must implement. */
export type BoardAction =
  | { type: "select-all" }
  | { type: "select-every-third" }
  | { type: "set-step"; value: number }
  | { type: "allocate"; multiplicity: 1 | 2 }
  | { type: "remove"; multiplicity: 1 }
  | { type: "reset" };

/** Captures every arm-visible observable needed to compare candidate behavior deterministically. */
export type BoardObservation = Readonly<{
  cardIds: readonly string[];
  allocations: readonly number[];
  selectedIds: readonly string[];
  step: number;
  actionLog: readonly string[];
}>;

/** Defines the imperative test harness surface exposed by a candidate board instance. */
export type MuseumBoardHandle = Readonly<{
  dispatch(action: BoardAction): void;
}>;

/** Describes the candidate component shape accepted by the shared React harness. */
export type MuseumBoardComponent = ComponentType<{ ref?: Ref<MuseumBoardHandle> }>;

/** Links one arm-visible invariant to the risk category and probe that enforce it. */
export type ArmVisibleInvariantContract = Readonly<{
  id: string;
  riskCategories: readonly ["ordering"];
  probeId: string;
  description: string;
}>;

/** Arm-visible requirements do not encode which candidate contains a seeded defect. */
export const ARM_VISIBLE_INVARIANTS: readonly ArmVisibleInvariantContract[] = Object.freeze([{
  id: "BG-D01-INV-ACCUMULATE-REQUESTS",
  riskCategories: ["ordering"],
  probeId: "BG-D01-PROBE-ACCUMULATE-TWICE",
  description: "One allocate event with multiplicity two must add two current steps to every selected card.",
}]);

/** Creates a fresh zero allocation vector in canonical card order. */
export function initialAllocations(): number[] {
  return Array.from({ length: CARD_COUNT }, () => 0);
}

/** Filters and orders arbitrary selection input against the canonical board identifier set. */
export function normalizeSelection(ids: readonly string[]): string[] {
  const selected = new Set(ids);
  return CARD_IDS.filter((id) => selected.has(id));
}

/** Applies a bounded delta only to selected cards while preserving canonical vector order. */
export function adjustSelected(
  snapshot: readonly number[],
  selectedIds: readonly string[],
  delta: number,
): number[] {
  const selected = new Set(selectedIds);
  return snapshot.map((value, index) => (
    selected.has(CARD_IDS[index]) ? Math.max(0, value + delta) : value
  ));
}

/** Converts a validated board action into the stable label used by observable action logs. */
export function actionLabel(action: BoardAction, currentStep: number): string {
  switch (action.type) {
    case "select-all":
    case "select-every-third":
    case "reset":
      return action.type;
    case "set-step":
      assertPositiveIntegerStep(action.value);
      return `step-${action.value}`;
    case "allocate":
      return `allocate-${currentStep}x${action.multiplicity}`;
    case "remove":
      return `remove-${currentStep}x${action.multiplicity}`;
  }
}

/** Rejects step values outside the frozen positive-integer public action contract. */
export function assertPositiveIntegerStep(value: number): void {
  // The frozen action domain permits positive integer steps only. The runtime type
  // remains numeric for the public API, so invalid callers fail closed before label,
  // state, or action-log mutation instead of defining new invalid-action behavior.
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError("Museum board step must be a positive integer.");
  }
}

/** Returns the canonical one-based every-third selection used by the frozen scenario. */
export function everyThirdCardIds(): readonly string[] {
  return CARD_IDS.filter((_, index) => (index + 1) % 3 === 0);
}
