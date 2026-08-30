/** Defines the complete arm-visible BG-H04 conditional-lifecycle contract. */
import type { ComponentType, Ref } from "react";

/** Enumerates deterministic parent and drawer actions. */
export type DrawerAction =
  | { type: "activate" }
  | { type: "deactivate" }
  | { type: "edit-draft"; value: string }
  | { type: "set-source-note"; value: string };

/** Captures public parent, drawer, and lifecycle observables after settlement. */
export type DrawerObservation = Readonly<{
  stationId: "north-pad";
  sourceNote: string;
  active: boolean;
  drawerPresent: boolean;
  drawerVisible: boolean;
  generation: number | null;
  draft: string | null;
  mountCount: number;
  cleanupCount: number;
  activeRegistrationCount: number;
  actionLog: readonly string[];
}>;

/** Defines mutable lifecycle evidence owned by the harness rather than candidate state. */
export type LifecycleLedger = Readonly<{
  mount(): Readonly<{ generation: number; cleanup(): void }>;
  snapshot(): Readonly<{ mountCount: number; cleanupCount: number; activeRegistrationCount: number }>;
}>;

/** Defines the imperative candidate surface consumed by the public harness. */
export type AstronomyDrawerHandle = Readonly<{ dispatch(action: DrawerAction): void }>;

/** Describes a candidate component mounted with a fresh public lifecycle ledger. */
export type AstronomyDrawerComponent = ComponentType<{ ledger: LifecycleLedger; ref?: Ref<AstronomyDrawerHandle> }>;

/** Describes the oracle-free lifecycle invariant available to arm-owned probes. */
export type LifecycleInvariantContract = Readonly<{
  id: "BG-H04-INV-CONDITIONAL-LIFECYCLE";
  riskCategories: readonly ["lifecycle"];
  probeId: "BG-H04-PROBE-REACTIVATION";
  description: string;
}>;

/** Does not reveal which neutral candidate violates the invariant. */
export const ARM_VISIBLE_INVARIANTS: readonly LifecycleInvariantContract[] = Object.freeze([{
  id: "BG-H04-INV-CONDITIONAL-LIFECYCLE",
  riskCategories: ["lifecycle"],
  probeId: "BG-H04-PROBE-REACTIVATION",
  description: "Inactive means unmounted with one cleanup; reactivation creates a fresh generation from the current source note.",
}]);

/** Creates a deterministic ledger that records setup and exactly-once cleanup. */
export function createLifecycleLedger(): LifecycleLedger {
  let mountCount = 0;
  let cleanupCount = 0;
  let activeRegistrationCount = 0;
  return Object.freeze({
    mount() {
      mountCount += 1;
      activeRegistrationCount += 1;
      const generation = mountCount;
      let cleaned = false;
      return Object.freeze({ generation, cleanup() {
        // Idempotence protects evidence from duplicate React cleanup invocation.
        if (cleaned) return;
        cleaned = true;
        cleanupCount += 1;
        activeRegistrationCount -= 1;
      } });
    },
    snapshot: () => Object.freeze({ mountCount, cleanupCount, activeRegistrationCount }),
  });
}

/** Converts each public action into its canonical log label. */
export function drawerActionLabel(action: DrawerAction): string {
  if (action.type === "edit-draft") return `edit-draft-${action.value}`;
  if (action.type === "set-source-note") return `source-note-${action.value}`;
  return action.type;
}
