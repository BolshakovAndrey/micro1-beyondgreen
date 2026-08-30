import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";

import { createEvaluatorAdapterPlan } from "../../../src/official/adapters/evaluator.ts";
import {
  evaluateBGD03ObservationTranscript,
} from "../../../src/official/evaluator-only/bg-d03.ts";
import {
  BG_D03_OFFICIAL_ADAPTER,
  captureBGD03ObservationTranscript,
} from "../../../src/official/fixtures/bg-d03.ts";

const finalizedDecisions = Object.freeze([
  Object.freeze({ arm: "status-quo", decisionSha256: "a".repeat(64), immutable: true }),
  Object.freeze({ arm: "beyondgreen", decisionSha256: "b".repeat(64), immutable: true }),
]);

function transcript(finalSnapshot: Readonly<{occupiedCells: number; remainingCells: number; overCapacity: boolean}>) {
  return captureBGD03ObservationTranscript({
    schemaVersion: "beyondgreen-bg-d03-observation-transcript@1.0.0",
    fixtureId: "BG-D03",
    candidateId: "synthetic-candidate",
    finalizedDecisions,
    constructorInput: {
      capacity: 8,
      varieties: [{ id: "radish", label: "Radish", cellsPerPacket: 3 }],
    },
    frames: [
      { operation: "initial", arguments: [], result: null, snapshot: { selected: [], occupiedCells: 0, remainingCells: 8, overCapacity: false } },
      { operation: "add", arguments: ["radish"], result: true, snapshot: { selected: [{ varietyId: "radish", packetCount: 1 }], occupiedCells: 3, remainingCells: 5, overCapacity: false } },
      { operation: "set_packet_count", arguments: ["radish", 3], result: true, snapshot: { selected: [{ varietyId: "radish", packetCount: 3 }], ...finalSnapshot } },
    ],
  });
}

test("D03 transcript bridge accepts preserving observations and reason-correctly rejects derived-state drift", () => {
  const preserving = transcript({ occupiedCells: 9, remainingCells: -1, overCapacity: true });
  const violating = transcript({ occupiedCells: 3, remainingCells: 5, overCapacity: false });
  assert.deepEqual(evaluateBGD03ObservationTranscript(preserving), {
    accepted: true, behaviorClass: "derived_state", reasonCorrectReject: false, violatedInvariantFamily: null,
  });
  assert.deepEqual(evaluateBGD03ObservationTranscript(violating), {
    accepted: false, behaviorClass: "derived_state", reasonCorrectReject: true, violatedInvariantFamily: "derived_state",
  });
  assert.ok(Object.isFrozen(preserving));
  assert.ok(preserving.finalizedDecisions.every(({ immutable }) => immutable));
});

test("D03 transcript bridge fails closed on malformed or incomplete observations", () => {
  const preserving = transcript({ occupiedCells: 9, remainingCells: -1, overCapacity: true });
  assert.throws(() => evaluateBGD03ObservationTranscript({ ...preserving, frames: preserving.frames.slice(0, 2) }));
  assert.throws(() => captureBGD03ObservationTranscript({ ...preserving, finalizedDecisions: [preserving.finalizedDecisions[0]] }));
  assert.throws(() => evaluateBGD03ObservationTranscript({
    ...preserving,
    frames: [
      preserving.frames[0],
      { ...preserving.frames[1], arguments: ["wrong-variety"] },
      preserving.frames[2],
    ],
  }), /operation mismatch/);
});

test("D03 evaluator plan can read its bridge but physically denies candidate bytes", () => {
  const plan = createEvaluatorAdapterPlan(BG_D03_OFFICIAL_ADAPTER, "candidate-a");
  assert.ok(plan.allowReadPaths.includes("src/official/evaluator-only/bg-d03.ts"));
  assert.ok(!plan.allowReadPaths.some((entry) => entry.startsWith("candidates/")));
  const allowedArguments = plan.allowReadPaths.flatMap((entry) => ["--allow-fs-read", path.resolve(entry)]);
  const blocked = path.resolve("candidates/BG-D03/candidate-a/TrayPlanner.ts");
  const result = spawnSync(process.execPath, [
    "--permission", ...allowedArguments, "--input-type=module", "--eval",
    `import { readFileSync } from "node:fs"; readFileSync(${JSON.stringify(blocked)});`,
  ], { cwd: process.cwd(), encoding: "utf8" });
  assert.notEqual(result.status, 0);
});
