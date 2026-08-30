/** Implements the verifier-only BG-H04 canonical lifecycle oracle. */
import assert from "node:assert/strict";

import type { AstronomyDrawerComponent, DrawerAction, DrawerObservation } from "../../arm-visible/BG-H04/contract.ts";
import { mountAstronomyDrawer } from "../../arm-visible/BG-H04/harness.ts";

const ACTIONS: readonly DrawerAction[] = Object.freeze([
  { type: "activate" }, { type: "edit-draft", value: "check" }, { type: "deactivate" },
  { type: "set-source-note", value: "focus" }, { type: "activate" }, { type: "deactivate" },
]);

/** Is the bounded post-decision result owned only by the evaluator. */
export type OracleResult = Readonly<{ accepted: boolean; failedAction: string | null; behaviorClass: "conditional_lifecycle" }>;

const expected = [
  { present: false, visible: false, generation: null, draft: null, counts: [0, 0, 0] },
  { present: true, visible: true, generation: 1, draft: "align", counts: [1, 0, 1] },
  { present: true, visible: true, generation: 1, draft: "check", counts: [1, 0, 1] },
  { present: false, visible: false, generation: null, draft: null, counts: [1, 1, 0] },
  { present: false, visible: false, generation: null, draft: null, counts: [1, 1, 0] },
  { present: true, visible: true, generation: 2, draft: "focus", counts: [2, 1, 1] },
  { present: false, visible: false, generation: null, draft: null, counts: [2, 2, 0] },
] as const;

/** Evaluates captured lifecycle evidence without importing candidate source. */
export function evaluateCanonicalObservations(values: readonly DrawerObservation[], afterUnmount: DrawerObservation): OracleResult {
  const labels = ["mount-parent", "activate", "edit-draft-check", "deactivate", "source-note-focus", "activate", "deactivate"];
  if (values.length !== expected.length) return Object.freeze({ accepted: false, failedAction: "observation-count", behaviorClass: "conditional_lifecycle" });
  for (const [index, value] of values.entries()) {
    const step = expected[index]!;
    try {
      assert.equal(value.drawerPresent, step.present); assert.equal(value.drawerVisible, step.visible);
      assert.equal(value.generation, step.generation); assert.equal(value.draft, step.draft);
      assert.deepEqual([value.mountCount, value.cleanupCount, value.activeRegistrationCount], step.counts);
      assert.equal(value.actionLog.at(-1), labels[index]);
      if (index >= 4) assert.equal(value.sourceNote, "focus");
    } catch { return Object.freeze({ accepted: false, failedAction: labels[index]!, behaviorClass: "conditional_lifecycle" }); }
  }
  if (afterUnmount.mountCount !== 2 || afterUnmount.cleanupCount !== 2 || afterUnmount.activeRegistrationCount !== 0 ||
      afterUnmount.sourceNote !== "focus" || afterUnmount.actionLog.at(-1) !== "unmount-parent") {
    return Object.freeze({ accepted: false, failedAction: "unmount-parent", behaviorClass: "conditional_lifecycle" });
  }
  return Object.freeze({ accepted: true, failedAction: null, behaviorClass: "conditional_lifecycle" });
}

/** Executes the canonical scenario only for evaluator self-checks owning both capabilities. */
export async function evaluateCanonicalScenario(Component: AstronomyDrawerComponent): Promise<OracleResult> {
  const drawer = await mountAstronomyDrawer(Component);
  const observations: DrawerObservation[] = [drawer.observe()];
  for (const action of ACTIONS) observations.push(await drawer.dispatch(action));
  const afterUnmount = await drawer.dispose();
  return evaluateCanonicalObservations(observations, afterUnmount);
}
