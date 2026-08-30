import { computed, signal } from "@preact/signals-react";
import { createElement, type ReactElement } from "react";

/** A fixed seed variety and its immutable tray-cell cost. */
export interface SeedVariety {
  readonly id: string;
  readonly label: string;
  readonly cellsPerPacket: number;
}

/** A selected variety and the number of packets planned for it. */
export interface PlannedVariety {
  readonly varietyId: string;
  readonly packetCount: number;
}

/** The complete observable state exposed by a tray planner. */
export interface TrayPlannerSnapshot {
  readonly selected: readonly PlannedVariety[];
  readonly occupiedCells: number;
  readonly remainingCells: number;
  readonly overCapacity: boolean;
}

const isPositiveInteger = (value: number): boolean => Number.isInteger(value) && value > 0;

/**
 * Seeded false-green migration for the synthetic community-garden tray planner.
 * It deliberately retains a writable duplicate of a value that should be derived.
 */
export class TrayPlanner {
  private readonly capacity: number;
  private readonly varietiesById: ReadonlyMap<string, SeedVariety>;
  private readonly selectedSignal = signal<readonly PlannedVariety[]>([]);
  private readonly occupiedCellsSignal = signal(0);
  private readonly remainingCellsSignal;
  private readonly overCapacitySignal;

  public constructor(
    capacity: number,
    varieties: readonly SeedVariety[],
  ) {
    if (!isPositiveInteger(capacity)) {
      throw new Error("Tray capacity must be a positive integer.");
    }
    this.capacity = capacity;

    const varietiesById = new Map<string, SeedVariety>();
    for (const variety of varieties) {
      if (!variety.id || !isPositiveInteger(variety.cellsPerPacket) || varietiesById.has(variety.id)) {
        throw new Error("Each variety must have a unique id and a positive integer cell cost.");
      }
      varietiesById.set(variety.id, { ...variety });
    }
    this.varietiesById = varietiesById;
    this.remainingCellsSignal = computed(() => this.capacity - this.occupiedCellsSignal.value);
    this.overCapacitySignal = computed(() => this.remainingCellsSignal.value < 0);
  }

  /** Returns a value snapshot suitable for observers and deterministic assertions. */
  public get snapshot(): TrayPlannerSnapshot {
    return {
      selected: this.selectedSignal.value.map((planned) => ({ ...planned })),
      occupiedCells: this.occupiedCellsSignal.value,
      remainingCells: this.remainingCellsSignal.value,
      overCapacity: this.overCapacitySignal.value,
    };
  }

  /** Adds a known variety once, selecting one packet by default. */
  public add(varietyId: string): boolean {
    const variety = this.varietiesById.get(varietyId);
    if (!variety || this.selectedSignal.value.some((planned) => planned.varietyId === varietyId)) {
      return false;
    }
    this.selectedSignal.value = [...this.selectedSignal.value, { varietyId, packetCount: 1 }];
    this.occupiedCellsSignal.value += variety.cellsPerPacket;
    return true;
  }

  /** Changes a selected variety's packet count without changing selection order. */
  public setPacketCount(varietyId: string, packetCount: number): boolean {
    if (!isPositiveInteger(packetCount)) {
      return false;
    }
    const index = this.selectedSignal.value.findIndex((planned) => planned.varietyId === varietyId);
    if (index < 0) {
      return false;
    }
    this.selectedSignal.value = this.selectedSignal.value.map((planned) => (
      planned.varietyId === varietyId ? { ...planned, packetCount } : planned
    ));
    // Deliberate seed: the duplicate total is not synchronized on this source-only update.
    return true;
  }

  /** Removes a selected variety and preserves the order of all remaining entries. */
  public remove(varietyId: string): boolean {
    const planned = this.selectedSignal.value.find((entry) => entry.varietyId === varietyId);
    if (!planned) {
      return false;
    }
    this.selectedSignal.value = this.selectedSignal.value.filter((entry) => entry.varietyId !== varietyId);
    this.occupiedCellsSignal.value -= this.varietiesById.get(varietyId)!.cellsPerPacket * planned.packetCount;
    return true;
  }

  /** Clears all selections while retaining the immutable tray capacity and catalog. */
  public reset(): void {
    this.selectedSignal.value = [];
    this.occupiedCellsSignal.value = 0;
  }
}

/** Renders the three derived planner values for a React observer. */
export const TrayPlannerSummary = ({ planner }: { readonly planner: TrayPlanner }): ReactElement => {
  const { occupiedCells, remainingCells, overCapacity } = planner.snapshot;
  return createElement(
    "output",
    { "data-testid": "tray-summary" },
    `occupied=${occupiedCells};remaining=${remainingCells};overCapacity=${overCapacity}`,
  );
};
