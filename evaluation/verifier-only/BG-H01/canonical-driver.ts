/** Implements the verifier-only BG-H01 canonical post-decision oracle. */
import assert from "node:assert/strict";

import type { DisplayCardEditorComponent, DisplayCardObservation } from "../../arm-visible/BG-H01/contract.ts";

const CARD_01 = Object.freeze({ cardId: "CARD-01", initialTitle: "Moon map", initialTheme: "blue" as const });
const CARD_02 = Object.freeze({ cardId: "CARD-02", initialTitle: "Meteor guide", initialTheme: "amber" as const });

type Expected = Readonly<{ label: string; cardId: string; title: string; theme: string; dirty: boolean; log: readonly string[] }>;
const expected: readonly Expected[] = [
  { label: "mount-card-01", cardId: "CARD-01", title: "Moon map", theme: "blue", dirty: false, log: ["mount-card-01"] },
  { label: "edit-title-card-01", cardId: "CARD-01", title: "Lunar map", theme: "blue", dirty: true, log: ["mount-card-01", "edit-title-card-01"] },
  { label: "rerender-card-01", cardId: "CARD-01", title: "Lunar map", theme: "blue", dirty: true, log: ["mount-card-01", "edit-title-card-01", "rerender-card-01"] },
  { label: "switch-card-02", cardId: "CARD-02", title: "Meteor guide", theme: "amber", dirty: false, log: ["mount-card-01", "edit-title-card-01", "rerender-card-01", "switch-card-02"] },
  { label: "edit-theme-card-02", cardId: "CARD-02", title: "Meteor guide", theme: "green", dirty: true, log: ["mount-card-01", "edit-title-card-01", "rerender-card-01", "switch-card-02", "edit-theme-card-02"] },
  { label: "switch-card-01", cardId: "CARD-01", title: "Moon map", theme: "blue", dirty: false, log: ["mount-card-01", "edit-title-card-01", "rerender-card-01", "switch-card-02", "edit-theme-card-02", "switch-card-01"] },
  { label: "reset-current", cardId: "CARD-01", title: "Moon map", theme: "blue", dirty: false, log: ["mount-card-01", "edit-title-card-01", "rerender-card-01", "switch-card-02", "edit-theme-card-02", "switch-card-01", "reset-current"] },
];

function assertObservation(actual: DisplayCardObservation, value: Expected): void {
  assert.equal(actual.cardId, value.cardId); assert.equal(actual.title, value.title);
  assert.equal(actual.theme, value.theme); assert.equal(actual.dirty, value.dirty);
  assert.deepEqual(actual.actionLog, value.log);
}

/** Is the bounded result returned only to verifier self-checks. */
export type OracleResult = Readonly<{ accepted: boolean; failedAction: string | null; behaviorClass: "prop_reset" }>;

/** Evaluates captured observations without granting oracle capability to candidates. */
export function evaluateCanonicalObservations(observations: readonly DisplayCardObservation[]): OracleResult {
  if (observations.length !== expected.length) return Object.freeze({ accepted: false, failedAction: "observation-count", behaviorClass: "prop_reset" });
  for (const [index, value] of expected.entries()) {
    try { assertObservation(observations[index]!, value); }
    catch { return Object.freeze({ accepted: false, failedAction: value.label, behaviorClass: "prop_reset" }); }
  }
  return Object.freeze({ accepted: true, failedAction: null, behaviorClass: "prop_reset" });
}

/** Runs the canonical scenario only in a self-check owning both capabilities. */
export async function evaluateCanonicalScenario(Component: DisplayCardEditorComponent): Promise<OracleResult> {
  // Self-checks may import the public harness; production evaluator imports may not.
  const { mountDisplayCardEditor } = await import("../../arm-visible/BG-H01/harness.ts");
  const editor = await mountDisplayCardEditor(Component, CARD_01);
  try {
    const observations = [editor.observe()];
    observations.push(await editor.dispatch({ type: "edit-title", value: "Lunar map" }));
    observations.push(await editor.rerender(CARD_01, "rerender-card-01"));
    observations.push(await editor.rerender(CARD_02, "switch-card-02"));
    observations.push(await editor.dispatch({ type: "edit-theme", value: "green" }));
    observations.push(await editor.rerender(CARD_01, "switch-card-01"));
    observations.push(await editor.dispatch({ type: "reset-current" }));
    return evaluateCanonicalObservations(observations);
  } finally { await editor.dispose(); }
}
