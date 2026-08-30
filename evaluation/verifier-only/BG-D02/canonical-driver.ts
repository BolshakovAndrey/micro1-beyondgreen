/** Implements the verifier-only BG-D02 canonical oracle over post-decision observations. */
import assert from "node:assert/strict";

import { LANE_IDS, evenLaneIds, type DispatchAction, type DispatchObservation, type ParcelDispatchComponent } from "../../arm-visible/BG-D02/contract.ts";
import { mountParcelDispatchBoard } from "../../arm-visible/BG-D02/harness.ts";

const CANONICAL_LOG = Object.freeze(["mount", "select-all", "queue-1x2", "flush", "unit-3", "queue-3x2", "select-even", "flush", "reset"]);
type CanonicalStep = Readonly<{ action: DispatchAction | null; label: string; pending: readonly number[]; dispatched: readonly number[]; selectedIds: readonly string[]; unit: number; log: readonly string[] }>;
const zeros = () => Array.from({ length: LANE_IDS.length }, () => 0);
const uniform = (value: number) => Array.from({ length: LANE_IDS.length }, () => value);
const evens = evenLaneIds();
const selectedEven = new Set(evens);

const steps: readonly CanonicalStep[] = [
  { action: null, label: "mount", pending: zeros(), dispatched: zeros(), selectedIds: [], unit: 1, log: CANONICAL_LOG.slice(0, 1) },
  { action: { type: "select-all" }, label: "select-all", pending: zeros(), dispatched: zeros(), selectedIds: LANE_IDS, unit: 1, log: CANONICAL_LOG.slice(0, 2) },
  { action: { type: "queue", entries: 2 }, label: "queue-1x2", pending: uniform(2), dispatched: zeros(), selectedIds: LANE_IDS, unit: 1, log: CANONICAL_LOG.slice(0, 3) },
  { action: { type: "flush" }, label: "flush", pending: zeros(), dispatched: uniform(2), selectedIds: LANE_IDS, unit: 1, log: CANONICAL_LOG.slice(0, 4) },
  { action: { type: "set-unit", value: 3 }, label: "unit-3", pending: zeros(), dispatched: uniform(2), selectedIds: LANE_IDS, unit: 3, log: CANONICAL_LOG.slice(0, 5) },
  { action: { type: "queue", entries: 2 }, label: "queue-3x2", pending: uniform(6), dispatched: uniform(2), selectedIds: LANE_IDS, unit: 3, log: CANONICAL_LOG.slice(0, 6) },
  { action: { type: "select-even" }, label: "select-even", pending: uniform(6), dispatched: uniform(2), selectedIds: evens, unit: 3, log: CANONICAL_LOG.slice(0, 7) },
  { action: { type: "flush" }, label: "flush", pending: LANE_IDS.map((id) => selectedEven.has(id) ? 0 : 6), dispatched: LANE_IDS.map((id) => selectedEven.has(id) ? 8 : 2), selectedIds: evens, unit: 3, log: CANONICAL_LOG.slice(0, 8) },
  { action: { type: "reset" }, label: "reset", pending: zeros(), dispatched: zeros(), selectedIds: [], unit: 1, log: CANONICAL_LOG },
];

function assertObservation(actual: DispatchObservation, expected: CanonicalStep): void {
  assert.deepEqual(actual.laneIds, LANE_IDS);
  assert.deepEqual(actual.pending, expected.pending);
  assert.deepEqual(actual.dispatched, expected.dispatched);
  assert.deepEqual(actual.selectedIds, expected.selectedIds);
  assert.equal(actual.unit, expected.unit);
  assert.deepEqual(actual.actionLog, expected.log);
  assert.ok([...actual.pending, ...actual.dispatched].every((value) => Number.isInteger(value) && value >= 0));
}

/** Is the bounded post-decision verdict used by evaluator self-checks only. */
export type OracleResult = Readonly<{ accepted: boolean; failedAction: string | null; behaviorClass: "queued_batched_updates" }>;

/** Evaluates captured observations without giving candidate code oracle capability. */
export function evaluateCanonicalObservations(observations: readonly DispatchObservation[]): OracleResult {
  if (observations.length !== steps.length + 1) return Object.freeze({ accepted: false, failedAction: "observation-count", behaviorClass: "queued_batched_updates" });
  for (const [index, step] of steps.entries()) {
    try { assertObservation(observations[index]!, step); }
    catch { return Object.freeze({ accepted: false, failedAction: step.label, behaviorClass: "queued_batched_updates" }); }
  }
  try { assertObservation(observations[steps.length]!, { action: { type: "reset" }, label: "repeated-reset", pending: zeros(), dispatched: zeros(), selectedIds: [], unit: 1, log: [...CANONICAL_LOG, "reset"] }); }
  catch { return Object.freeze({ accepted: false, failedAction: "repeated-reset", behaviorClass: "queued_batched_updates" }); }
  return Object.freeze({ accepted: true, failedAction: null, behaviorClass: "queued_batched_updates" });
}

/** Runs the scenario only for verifier self-checks that intentionally own both capabilities. */
export async function evaluateCanonicalScenario(Component: ParcelDispatchComponent): Promise<OracleResult> {
  const board = await mountParcelDispatchBoard(Component);
  try {
    const observations: DispatchObservation[] = [board.observe()];
    for (const step of steps.slice(1)) observations.push(await board.dispatch(step.action!));
    observations.push(await board.dispatch({ type: "reset" }));
    return evaluateCanonicalObservations(observations);
  } finally { await board.dispose(); }
}
