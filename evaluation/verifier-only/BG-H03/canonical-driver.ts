/** Implements the verifier-only BG-H03 identity oracle over settled observations. */
import assert from "node:assert/strict";

import type { SelectionAction, SelectionDeskComponent, SelectionObservation } from "../../arm-visible/BG-H03/contract.ts";
import { mountSelectionDesk } from "../../arm-visible/BG-H03/harness.ts";

const ACTIONS: readonly SelectionAction[] = Object.freeze([
  { type: "set-note", value: "spring" }, { type: "set-note", value: "summer" },
  { type: "select", id: "flowers" }, { type: "set-note", value: "autumn" },
  { type: "select", id: "flowers" }, { type: "select", id: "herbs" }, { type: "reset" },
]);

/** Is the bounded post-decision result owned only by the evaluator. */
export type OracleResult = Readonly<{ accepted: boolean; failedAction: string | null; behaviorClass: "identity_stability" }>;

/** Evaluates captured references and values without executing candidate source. */
export function evaluateCanonicalObservations(values: readonly SelectionObservation[]): OracleResult {
  const labels = ["mount", "note-spring", "note-summer", "select-flowers", "note-autumn", "select-flowers", "select-herbs", "reset"];
  if (values.length !== labels.length) return Object.freeze({ accepted: false, failedAction: "observation-count", behaviorClass: "identity_stability" });
  try {
    assert.deepEqual(values.map((value) => value.actionLog.at(-1)), labels);
    assert.equal(values[0]!.previewAttachmentCount, 1);
    assert.strictEqual(values[1]!.selectionHandle, values[0]!.selectionHandle);
    assert.strictEqual(values[2]!.selectionHandle, values[0]!.selectionHandle);
    assert.notStrictEqual(values[3]!.selectionHandle, values[2]!.selectionHandle);
    assert.equal(values[3]!.previewAttachmentCount, 2);
    assert.strictEqual(values[4]!.selectionHandle, values[3]!.selectionHandle);
    assert.strictEqual(values[5]!.selectionHandle, values[3]!.selectionHandle);
    assert.notStrictEqual(values[6]!.selectionHandle, values[5]!.selectionHandle);
    assert.strictEqual(values[7]!.selectionHandle, values[6]!.selectionHandle);
    assert.deepEqual(values.map((value) => value.previewAttachmentCount), [1, 1, 1, 2, 2, 2, 3, 3]);
    assert.deepEqual(values[7], { selectedId: "herbs", selectionHandle: values[6]!.selectionHandle, searchNote: "", previewAttachmentCount: 3, actionLog: labels });
  } catch (error) {
    const step = values.findIndex((value, index) => index > 0 && value.previewAttachmentCount !== [1, 1, 1, 2, 2, 2, 3, 3][index]);
    return Object.freeze({ accepted: false, failedAction: step >= 0 ? labels[step]! : error instanceof Error ? "identity-invariant" : "unknown", behaviorClass: "identity_stability" });
  }
  return Object.freeze({ accepted: true, failedAction: null, behaviorClass: "identity_stability" });
}

/** Executes the canonical scenario only for evaluator self-checks owning both capabilities. */
export async function evaluateCanonicalScenario(Component: SelectionDeskComponent): Promise<OracleResult> {
  const desk = await mountSelectionDesk(Component);
  try {
    const observations: SelectionObservation[] = [desk.observe()];
    for (const action of ACTIONS) observations.push(await desk.dispatch(action));
    return evaluateCanonicalObservations(observations);
  } finally { await desk.dispose(); }
}
