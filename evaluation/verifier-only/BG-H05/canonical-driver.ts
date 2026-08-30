/** Implements the verifier-only BG-H05 canonical oracle over settled observations. */
import assert from "node:assert/strict";

import type { UnitReadoutComponent, UnitStoreObservation } from "../../arm-visible/BG-H05/contract.ts";
import { mountUnitStoreFixture } from "../../arm-visible/BG-H05/harness.ts";

type CanonicalStep = Readonly<{ label: string; expected: UnitStoreObservation }>;
const observation = (
  unit: "metric" | "imperial", revision: number,
  north: readonly ["metric" | "imperial", number], south: readonly ["metric" | "imperial", number],
  subscribers: number, northNotifications: number, southNotifications: number,
): UnitStoreObservation => Object.freeze({
  store: Object.freeze({ unit, revision }),
  readouts: Object.freeze({ north: Object.freeze({ unit: north[0], revision: north[1] }), south: Object.freeze({ unit: south[0], revision: south[1] }) }),
  subscribers,
  notifications: Object.freeze({ north: northNotifications, south: southNotifications }),
});

const STEPS: readonly CanonicalStep[] = Object.freeze([
  { label: "mount-pair", expected: observation("metric", 0, ["metric", 0], ["metric", 0], 2, 0, 0) },
  { label: "toolbar-imperial", expected: observation("imperial", 1, ["imperial", 1], ["imperial", 1], 2, 1, 1) },
  { label: "external-metric", expected: observation("metric", 2, ["metric", 2], ["metric", 2], 2, 2, 2) },
  { label: "unmount-south", expected: observation("metric", 2, ["metric", 2], ["metric", 2], 1, 2, 2) },
  { label: "external-imperial", expected: observation("imperial", 3, ["imperial", 3], ["metric", 2], 1, 3, 2) },
  { label: "remount-south", expected: observation("imperial", 3, ["imperial", 3], ["imperial", 3], 2, 3, 2) },
  { label: "repeat-imperial", expected: observation("imperial", 3, ["imperial", 3], ["imperial", 3], 2, 3, 2) },
  { label: "unmount-all", expected: observation("imperial", 3, ["imperial", 3], ["imperial", 3], 0, 3, 2) },
]);

/** Reports the bounded post-decision result for the external-store behavior class. */
export type OracleResult = Readonly<{ accepted: boolean; failedAction: string | null; behaviorClass: "external_store" }>;

/** Evaluates captured observations without granting candidate code oracle capability. */
export function evaluateCanonicalObservations(observations: readonly UnitStoreObservation[]): OracleResult {
  if (observations.length !== STEPS.length) return Object.freeze({ accepted: false, failedAction: "observation-count", behaviorClass: "external_store" });
  for (const [index, step] of STEPS.entries()) {
    try { assert.deepEqual(observations[index], step.expected); }
    catch { return Object.freeze({ accepted: false, failedAction: step.label, behaviorClass: "external_store" }); }
  }
  return Object.freeze({ accepted: true, failedAction: null, behaviorClass: "external_store" });
}

/** Runs the canonical scenario solely for verifier self-checks. */
export async function evaluateCanonicalScenario(Component: UnitReadoutComponent): Promise<OracleResult> {
  const fixture = await mountUnitStoreFixture(Component);
  const observations: UnitStoreObservation[] = [fixture.observe()];
  observations.push(await fixture.toolbarWrite("imperial"));
  observations.push(await fixture.externalWrite("metric"));
  observations.push(await fixture.unmountSouth());
  observations.push(await fixture.externalWrite("imperial"));
  observations.push(await fixture.remountSouth());
  observations.push(await fixture.externalWrite("imperial"));
  observations.push(await fixture.dispose());
  return evaluateCanonicalObservations(observations);
}
