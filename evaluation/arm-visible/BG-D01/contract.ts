import type { ComponentType, Ref } from "react";

export const CARD_COUNT = 300;

export const CARD_IDS = Object.freeze(
  Array.from({ length: CARD_COUNT }, (_, index) => `MVG-${String(index + 1).padStart(3, "0")}`),
);

export type BoardAction =
  | { type: "select-all" }
  | { type: "select-every-third" }
  | { type: "set-step"; value: number }
  | { type: "allocate"; multiplicity: 1 | 2 }
  | { type: "remove"; multiplicity: 1 }
  | { type: "reset" };

export type BoardObservation = Readonly<{
  cardIds: readonly string[];
  allocations: readonly number[];
  selectedIds: readonly string[];
  step: number;
  actionLog: readonly string[];
}>;

export type MuseumBoardHandle = Readonly<{
  dispatch(action: BoardAction): void;
}>;

export type MuseumBoardComponent = ComponentType<{ ref?: Ref<MuseumBoardHandle> }>;

export function initialAllocations(): number[] {
  return Array.from({ length: CARD_COUNT }, () => 0);
}

export function normalizeSelection(ids: readonly string[]): string[] {
  const selected = new Set(ids);
  return CARD_IDS.filter((id) => selected.has(id));
}

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

export function assertPositiveIntegerStep(value: number): void {
  // The frozen action domain permits positive integer steps only. The runtime type
  // remains numeric for the public API, so invalid callers fail closed before label,
  // state, or action-log mutation instead of defining new invalid-action behavior.
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError("Museum board step must be a positive integer.");
  }
}

export function everyThirdCardIds(): readonly string[] {
  return CARD_IDS.filter((_, index) => (index + 1) % 3 === 0);
}
