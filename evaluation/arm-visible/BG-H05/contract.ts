/** Defines the complete arm-visible shared unit-store contract for BG-H05. */
import type { ComponentType, Ref } from "react";

/** Enumerates the two deterministic unit preferences. */
export type UnitPreference = "metric" | "imperial";

/** Identifies the independently mounted readout consumers. */
export type ReadoutId = "north" | "south";

/** Represents one immutable coherent store snapshot. */
export type UnitSnapshot = Readonly<{ unit: UnitPreference; revision: number }>;

/** Captures all public state available after a settled fixture action. */
export type UnitStoreObservation = Readonly<{
  store: UnitSnapshot;
  readouts: Readonly<Partial<Record<ReadoutId, UnitSnapshot>>>;
  subscribers: number;
  notifications: Readonly<Record<ReadoutId, number>>;
}>;

/** Defines the imperative toolbar surface exposed by a readout candidate. */
export type UnitReadoutHandle = Readonly<{ toolbarWrite(unit: UnitPreference): void }>;

/** Defines the props shared by both neutral candidate components. */
export type UnitReadoutProps = Readonly<{
  consumerId: ReadoutId;
  store: SharedUnitStore;
  ref?: Ref<UnitReadoutHandle>;
}>;

/** Describes a candidate component mountable by the shared harness. */
export type UnitReadoutComponent = ComponentType<UnitReadoutProps>;

type Subscriber = Readonly<{ consumerId: ReadoutId; notify(snapshot: UnitSnapshot): void }>;

/** Implements the deterministic external store shared by every mounted consumer. */
export class SharedUnitStore {
  private snapshot: UnitSnapshot = Object.freeze({ unit: "metric", revision: 0 });
  private readonly subscribers = new Set<Subscriber>();
  private readonly notificationTotals: Record<ReadoutId, number> = { north: 0, south: 0 };

  /** Returns the same immutable object until a genuine value change occurs. */
  getSnapshot(): UnitSnapshot {
    return this.snapshot;
  }

  /** Registers one consumer and returns an idempotent cleanup function. */
  subscribe(consumerId: ReadoutId, notify: (snapshot: UnitSnapshot) => void): () => void {
    const subscriber = Object.freeze({ consumerId, notify });
    this.subscribers.add(subscriber);
    let active = true;
    return () => {
      if (!active) return;
      active = false;
      this.subscribers.delete(subscriber);
    };
  }

  /** Applies one synchronous store write and notifies the active subscriber set once. */
  write(unit: UnitPreference): void {
    if (unit === this.snapshot.unit) return;
    this.snapshot = Object.freeze({ unit, revision: this.snapshot.revision + 1 });
    // Snapshot the membership so producer identity cannot influence delivery.
    for (const subscriber of [...this.subscribers]) {
      this.notificationTotals[subscriber.consumerId] += 1;
      subscriber.notify(this.snapshot);
    }
  }

  /** Returns the current public subscription count. */
  subscriberCount(): number {
    return this.subscribers.size;
  }

  /** Returns immutable cumulative notification totals for lifecycle checks. */
  notificationCounts(): Readonly<Record<ReadoutId, number>> {
    return Object.freeze({ ...this.notificationTotals });
  }
}
