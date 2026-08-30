/** Defines the complete arm-visible BG-H03 seed-library selection contract. */
import type { ComponentType, Ref } from "react";

/** Identifies a collection in the fixed synthetic seed-library catalogue. */
export type CollectionId = "herbs" | "flowers" | "grains";

/** Is the immutable selection object whose reference is publicly observable. */
export type SelectionHandle = Readonly<{ id: CollectionId; label: string }>;

/** Enumerates deterministic user actions supported by the selection desk. */
export type SelectionAction =
  | { type: "set-note"; value: string }
  | { type: "select"; id: CollectionId }
  | { type: "reset" };

/** Captures every arm-visible value and reference observable after settlement. */
export type SelectionObservation = Readonly<{
  selectedId: CollectionId;
  selectionHandle: SelectionHandle;
  searchNote: string;
  previewAttachmentCount: number;
  actionLog: readonly string[];
}>;

/** Defines the imperative public surface used by the deterministic harness. */
export type SelectionDeskHandle = Readonly<{
  dispatch(action: SelectionAction): void;
  observe(): SelectionObservation;
}>;

/** Describes an immutable candidate component accepted by the shared harness. */
export type SelectionDeskComponent = ComponentType<{ ref?: Ref<SelectionDeskHandle> }>;

/** Describes the oracle-free invariant available to arm-owned probes. */
export type IdentityInvariantContract = Readonly<{
  id: "BG-H03-INV-HANDLE-IDENTITY";
  riskCategories: readonly ["identity"];
  probeId: "BG-H03-PROBE-STABLE-HANDLE";
  description: string;
}>;

/** Does not disclose which neutral candidate violates the invariant. */
export const ARM_VISIBLE_INVARIANTS: readonly IdentityInvariantContract[] = Object.freeze([{
  id: "BG-H03-INV-HANDLE-IDENTITY",
  riskCategories: ["identity"],
  probeId: "BG-H03-PROBE-STABLE-HANDLE",
  description: "Unrelated note edits and idempotent selection preserve the exact current selection-handle reference.",
}]);

const LABELS: Readonly<Record<CollectionId, string>> = Object.freeze({
  herbs: "Herb collection",
  flowers: "Flower collection",
  grains: "Grain collection",
});

/** Creates one immutable handle for a validated collection identifier. */
export function createSelectionHandle(id: CollectionId): SelectionHandle {
  return Object.freeze({ id, label: LABELS[id] });
}

/** Converts a public action into its stable canonical log label. */
export function selectionActionLabel(action: SelectionAction): string {
  if (action.type === "set-note") return `note-${action.value}`;
  if (action.type === "select") return `select-${action.id}`;
  return "reset";
}
