/** Implements the verifier-only BG-H06 canonical rollback oracle. */
import assert from "node:assert/strict";

import type { ThemeAction, ThemeObservation, ThemePanelComponent } from "../../arm-visible/BG-H06/contract.ts";
import { mountThemePanel } from "../../arm-visible/BG-H06/harness.ts";

type CanonicalStep = Readonly<{ label: string; action: ThemeAction | null; expected: ThemeObservation }>;
const state = (displayedTheme: "light" | "dark", committedTheme: "light" | "dark", status: "idle" | "saving", error: "save_failed" | null, pendingCount: 0 | 1): ThemeObservation =>
  Object.freeze({ displayedTheme, committedTheme, status, error, pendingCount });
const STEPS: readonly CanonicalStep[] = Object.freeze([
  { label: "mount", action: null, expected: state("light", "light", "idle", null, 0) },
  { label: "choose-dark", action: { type: "choose", theme: "dark" }, expected: state("dark", "light", "saving", null, 1) },
  { label: "concurrent-choice", action: { type: "choose", theme: "light" }, expected: state("dark", "light", "saving", null, 1) },
  { label: "reject-save", action: { type: "reject" }, expected: state("light", "light", "idle", "save_failed", 0) },
  { label: "dismiss-error", action: { type: "dismiss-error" }, expected: state("light", "light", "idle", null, 0) },
  { label: "choose-dark-again", action: { type: "choose", theme: "dark" }, expected: state("dark", "light", "saving", null, 1) },
  { label: "resolve-save", action: { type: "resolve" }, expected: state("dark", "dark", "idle", null, 0) },
  { label: "choose-light", action: { type: "choose", theme: "light" }, expected: state("light", "dark", "saving", null, 1) },
  { label: "reject-save-again", action: { type: "reject" }, expected: state("dark", "dark", "idle", "save_failed", 0) },
  { label: "duplicate-completion", action: { type: "reject" }, expected: state("dark", "dark", "idle", "save_failed", 0) },
]);

/** Reports the bounded post-decision result for the rollback behavior class. */
export type OracleResult = Readonly<{ accepted: boolean; failedAction: string | null; behaviorClass: "rollback" }>;

/** Evaluates captured observations without granting candidate code oracle capability. */
export function evaluateCanonicalObservations(observations: readonly ThemeObservation[]): OracleResult {
  if (observations.length !== STEPS.length) return Object.freeze({ accepted: false, failedAction: "observation-count", behaviorClass: "rollback" });
  for (const [index, step] of STEPS.entries()) {
    try { assert.deepEqual(observations[index], step.expected); }
    catch { return Object.freeze({ accepted: false, failedAction: step.label, behaviorClass: "rollback" }); }
  }
  return Object.freeze({ accepted: true, failedAction: null, behaviorClass: "rollback" });
}

/** Runs the canonical scenario solely for verifier self-checks. */
export async function evaluateCanonicalScenario(Component: ThemePanelComponent): Promise<OracleResult> {
  const panel = await mountThemePanel(Component);
  try {
    const observations: ThemeObservation[] = [panel.observe()];
    for (const step of STEPS.slice(1)) observations.push(await panel.dispatch(step.action!));
    return evaluateCanonicalObservations(observations);
  } finally { await panel.dispose(); }
}
