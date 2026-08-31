import assert from "node:assert/strict";
import test from "node:test";

import type {
  BoardAction,
  MuseumBoardComponent,
} from "../../../evaluation/arm-visible/BG-D01/contract.ts";
import {
  captureD01ObserverBridgeTranscript,
  type D01ObserverBridgeBindings,
} from "../../../src/official/runtime/d01-bridge.ts";
import {
  sha256CanonicalJson,
  type OfficialNeutralScenarioEnvelope,
} from "../../../src/official/process/ipc.ts";

function scenario(steps: readonly Readonly<{ action: string; parameters: unknown }>[]): OfficialNeutralScenarioEnvelope {
  const fixtureId = "BG-D01" as const;
  const slot = {
    slotId: `${fixtureId}:candidate-a`,
    fixtureId,
    candidateId: "candidate-a",
    candidateSha256: sha256CanonicalJson({ fixtureId, candidateId: "candidate-a" }),
  };
  const core = {
    schemaVersion: "beyondgreen-official-neutral-scenario@1.0.0" as const,
    slot,
    scenarioId: "synthetic:BG-D01",
    decisionSetSha256: sha256CanonicalJson({ synthetic: "decision-set" }),
    steps,
    immutable: true as const,
  };
  return { ...core, scenarioSha256: sha256CanonicalJson(core) } as OfficialNeutralScenarioEnvelope;
}

function bindings(options: Readonly<{ failOn?: BoardAction["type"] }> = {}): Readonly<{
  value: D01ObserverBridgeBindings;
  mounts(): number;
  disposals(): number;
}> {
  let mounts = 0;
  let disposals = 0;
  const component = (() => null) as MuseumBoardComponent;
  return {
    value: {
      component,
      async mount(received) {
        assert.equal(received, component);
        mounts += 1;
        let selected = false;
        let step = 1;
        let allocation = 0;
        const log: string[] = [];
        const observe = () => Object.freeze({
          cardIds: ["MVG-001"],
          allocations: [allocation],
          selectedIds: selected ? ["MVG-001"] : [],
          step,
          actionLog: [...log],
        });
        return {
          observe,
          async dispatch(action) {
            if (action.type === options.failOn) throw new Error("synthetic D01 dispatch failure");
            log.push(action.type);
            if (action.type === "select-all" || action.type === "select-every-third") selected = true;
            if (action.type === "set-step") step = action.value;
            if (action.type === "allocate" && selected) allocation += step * action.multiplicity;
            if (action.type === "remove" && selected) allocation = Math.max(0, allocation - step);
            if (action.type === "reset") { selected = false; step = 1; allocation = 0; }
            return observe();
          },
          async dispose() { disposals += 1; },
        };
      },
    },
    mounts: () => mounts,
    disposals: () => disposals,
  };
}

const D01_SCENARIO = scenario([
  { action: "observe", parameters: {} },
  { action: "select-all", parameters: {} },
  { action: "dispatch", parameters: { value: { type: "allocate", multiplicity: 2 } } },
  { action: "set-step", parameters: { value: 3 } },
  { action: "remove", parameters: { multiplicity: 1 } },
  { action: "reset", parameters: {} },
]);

test("D01 bridge reuses only the public mount and dispatch contract deterministically", async () => {
  const firstFixture = bindings();
  const first = await captureD01ObserverBridgeTranscript({ bindings: firstFixture.value, scenario: D01_SCENARIO });
  const secondFixture = bindings();
  const second = await captureD01ObserverBridgeTranscript({ bindings: secondFixture.value, scenario: D01_SCENARIO });
  assert.deepEqual(second, first);
  assert.deepEqual(first.frames.map(({ operation, actionType }) => ({ operation, actionType })), [
    { operation: "observe", actionType: null },
    { operation: "dispatch", actionType: "select-all" },
    { operation: "dispatch", actionType: "allocate" },
    { operation: "dispatch", actionType: "set-step" },
    { operation: "dispatch", actionType: "remove" },
    { operation: "dispatch", actionType: "reset" },
  ]);
  assert.equal(firstFixture.mounts(), 1);
  assert.equal(firstFixture.disposals(), 1);
  assert.equal(Object.isFrozen(first.frames[0]?.observation), true);
});

test("D01 bridge rejects malformed actions before mounting", async () => {
  for (const invalid of [
    scenario([{ action: "allocate", parameters: { multiplicity: 3 } }]),
    scenario([{ action: "set-step", parameters: { value: 0 } }]),
    scenario([{ action: "dispatch", parameters: { value: { type: "reset", extra: true } } }]),
    scenario([{ action: "unknown", parameters: {} }]),
  ]) {
    const fixture = bindings();
    await assert.rejects(captureD01ObserverBridgeTranscript({ bindings: fixture.value, scenario: invalid }));
    assert.equal(fixture.mounts(), 0);
    assert.equal(fixture.disposals(), 0);
  }
});

test("D01 bridge disposes the public mount when dispatch fails", async () => {
  const fixture = bindings({ failOn: "allocate" });
  await assert.rejects(
    captureD01ObserverBridgeTranscript({ bindings: fixture.value, scenario: D01_SCENARIO }),
    /synthetic D01 dispatch failure/u,
  );
  assert.equal(fixture.mounts(), 1);
  assert.equal(fixture.disposals(), 1);
});
