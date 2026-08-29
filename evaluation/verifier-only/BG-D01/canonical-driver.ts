import assert from "node:assert/strict";

import {
  CARD_IDS,
  everyThirdCardIds,
  type BoardAction,
  type BoardObservation,
  type MuseumBoardComponent,
} from "../../arm-visible/BG-D01/contract.ts";
import { mountMuseumBoard } from "../../arm-visible/BG-D01/harness.ts";

const CANONICAL_LOG = Object.freeze([
  "mount",
  "select-all",
  "allocate-1x2",
  "step-3",
  "allocate-3x2",
  "select-every-third",
  "remove-3x1",
  "reset",
]);

type CanonicalStep = Readonly<{
  action: BoardAction | null;
  label: string;
  allocations: readonly number[];
  selectedIds: readonly string[];
  step: number;
  log: readonly string[];
}>;

const zeros = () => Array.from({ length: 300 }, () => 0);
const uniform = (value: number) => Array.from({ length: 300 }, () => value);
const everyThird = everyThirdCardIds();
const selectedEveryThird = new Set(everyThird);

const steps: readonly CanonicalStep[] = [
  { action: null, label: "mount", allocations: zeros(), selectedIds: [], step: 1, log: CANONICAL_LOG.slice(0, 1) },
  { action: { type: "select-all" }, label: "select-all", allocations: zeros(), selectedIds: CARD_IDS, step: 1, log: CANONICAL_LOG.slice(0, 2) },
  { action: { type: "allocate", multiplicity: 2 }, label: "allocate-1x2", allocations: uniform(2), selectedIds: CARD_IDS, step: 1, log: CANONICAL_LOG.slice(0, 3) },
  { action: { type: "set-step", value: 3 }, label: "step-3", allocations: uniform(2), selectedIds: CARD_IDS, step: 3, log: CANONICAL_LOG.slice(0, 4) },
  { action: { type: "allocate", multiplicity: 2 }, label: "allocate-3x2", allocations: uniform(8), selectedIds: CARD_IDS, step: 3, log: CANONICAL_LOG.slice(0, 5) },
  { action: { type: "select-every-third" }, label: "select-every-third", allocations: uniform(8), selectedIds: everyThird, step: 3, log: CANONICAL_LOG.slice(0, 6) },
  {
    action: { type: "remove", multiplicity: 1 },
    label: "remove-3x1",
    allocations: CARD_IDS.map((id) => selectedEveryThird.has(id) ? 5 : 8),
    selectedIds: everyThird,
    step: 3,
    log: CANONICAL_LOG.slice(0, 7),
  },
  { action: { type: "reset" }, label: "reset", allocations: zeros(), selectedIds: [], step: 1, log: CANONICAL_LOG },
];

function assertObservation(actual: BoardObservation, expected: CanonicalStep) {
  assert.deepEqual(actual.cardIds, CARD_IDS);
  assert.deepEqual(actual.allocations, expected.allocations);
  assert.deepEqual(actual.selectedIds, expected.selectedIds);
  assert.equal(actual.step, expected.step);
  assert.deepEqual(actual.actionLog, expected.log);
  assert.ok(actual.allocations.every((value) => Number.isInteger(value) && value >= 0));
}

export type OracleResult = Readonly<{
  accepted: boolean;
  failedAction: string | null;
  behaviorClass: "stale_snapshots";
}>;

export async function evaluateCanonicalScenario(Component: MuseumBoardComponent): Promise<OracleResult> {
  const board = await mountMuseumBoard(Component);
  try {
    for (const step of steps) {
      const observation = step.action ? await board.dispatch(step.action) : board.observe();
      try {
        assertObservation(observation, step);
      }
      catch {
        return Object.freeze({ accepted: false, failedAction: step.label, behaviorClass: "stale_snapshots" });
      }
    }
    const repeatedReset = await board.dispatch({ type: "reset" });
    assertObservation(repeatedReset, {
      action: { type: "reset" },
      label: "reset",
      allocations: zeros(),
      selectedIds: [],
      step: 1,
      log: [...CANONICAL_LOG, "reset"],
    });
    return Object.freeze({ accepted: true, failedAction: null, behaviorClass: "stale_snapshots" });
  }
  finally {
    await board.dispose();
  }
}
