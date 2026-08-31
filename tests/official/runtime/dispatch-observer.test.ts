import assert from "node:assert/strict";
import test from "node:test";

import {
  captureDispatchObserverTranscript,
  type DispatchObserverBindings,
} from "../../../src/official/runtime/dispatch-observer.ts";
import {
  sha256CanonicalJson,
  type OfficialNeutralScenarioEnvelope,
} from "../../../src/official/process/ipc.ts";

const FIXTURE_IDS = ["BG-D02", "BG-D04", "BG-H03", "BG-H04", "BG-H06"] as const;

function createScenario(
  fixtureId: typeof FIXTURE_IDS[number] | "BG-D01",
  steps: readonly Readonly<{ action: string; parameters: unknown }>[] = [
    { action: "observe", parameters: {} },
    { action: "dispatch", parameters: { value: { type: "synthetic-change", amount: 2 } } },
    { action: "observe", parameters: {} },
  ],
): OfficialNeutralScenarioEnvelope {
  const slot = {
    slotId: `${fixtureId}:candidate-a`,
    fixtureId,
    candidateId: "candidate-a",
    candidateSha256: sha256CanonicalJson({ fixtureId, candidateId: "candidate-a" }),
  };
  const core = {
    schemaVersion: "beyondgreen-official-neutral-scenario@1.0.0" as const,
    slot,
    scenarioId: `scenario:${fixtureId}`,
    decisionSetSha256: sha256CanonicalJson({ decisionSet: "synthetic" }),
    steps,
    immutable: true as const,
  };
  return { ...core, scenarioSha256: sha256CanonicalJson(core) } as OfficialNeutralScenarioEnvelope;
}

function createBindings(disposeWithObservation = false): Readonly<{
  bindings: DispatchObserverBindings;
  mounts: () => number;
  disposals: () => number;
}> {
  let mountCount = 0;
  let disposalCount = 0;
  const candidate = Object.freeze({ id: "synthetic-candidate-binding" });
  return {
    bindings: {
      candidate,
      async mount(receivedCandidate) {
        assert.equal(receivedCandidate, candidate);
        mountCount += 1;
        let value = 0;
        return {
          observe: () => Object.freeze({ value }),
          async dispatch(action) {
            assert.equal(action.type, "synthetic-change");
            value += Number(action.amount);
            return Object.freeze({ value });
          },
          async dispose() {
            disposalCount += 1;
            return disposeWithObservation ? Object.freeze({ value, disposed: true }) : undefined;
          },
        };
      },
    },
    mounts: () => mountCount,
    disposals: () => disposalCount,
  };
}

test("dispatch observer handles all five public fixture families without domain action knowledge", async () => {
  for (const fixtureId of FIXTURE_IDS) {
    const fixture = createBindings(fixtureId === "BG-H04");
    const transcript = await captureDispatchObserverTranscript({
      bindings: fixture.bindings,
      scenario: createScenario(fixtureId),
    });
    assert.equal(transcript.fixtureId, fixtureId);
    assert.deepEqual(transcript.frames.map(({ operation, observation }) => ({ operation, observation })), [
      { operation: "observe", observation: { value: 0 } },
      { operation: "dispatch", observation: { value: 2 } },
      { operation: "observe", observation: { value: 2 } },
    ]);
    assert.equal(fixture.mounts(), 1);
    assert.equal(fixture.disposals(), 1);
    assert.deepEqual(transcript.disposal.observation, fixtureId === "BG-H04" ? { value: 2, disposed: true } : null);
  }
});

test("two fresh captures of the same scenario are byte-stable", async () => {
  const scenario = createScenario("BG-D02");
  const first = await captureDispatchObserverTranscript({ bindings: createBindings().bindings, scenario });
  const second = await captureDispatchObserverTranscript({ bindings: createBindings().bindings, scenario });
  assert.deepEqual(second, first);
  assert.equal(JSON.stringify(second), JSON.stringify(first));
});

test("explicit dispose is executed once and becomes the terminal public frame", async () => {
  const fixture = createBindings(true);
  const transcript = await captureDispatchObserverTranscript({
    bindings: fixture.bindings,
    scenario: createScenario("BG-H04", [
      { action: "observe", parameters: {} },
      { action: "dispose", parameters: {} },
    ]),
  });
  assert.equal(fixture.disposals(), 1);
  assert.deepEqual(transcript.frames.map(({ operation }) => operation), ["observe", "dispose"]);
  assert.deepEqual(transcript.disposal.observation, { value: 0, disposed: true });
});

test("unknown operations and malformed parameters fail before mounting", async () => {
  const cases = [
    createScenario("BG-D04", [{ action: "unknown", parameters: {} }]),
    createScenario("BG-D04", [{ action: "observe", parameters: { extra: true } }]),
    createScenario("BG-D04", [{ action: "dispatch", parameters: {} }]),
    createScenario("BG-D04", [{ action: "dispatch", parameters: { value: [] } }]),
  ];
  for (const scenario of cases) {
    const fixture = createBindings();
    await assert.rejects(captureDispatchObserverTranscript({ bindings: fixture.bindings, scenario }));
    assert.equal(fixture.mounts(), 0);
    assert.equal(fixture.disposals(), 0);
  }
});

test("unsupported fixtures fail closed and dispatch failures still dispose", async () => {
  const unsupported = createBindings();
  await assert.rejects(
    captureDispatchObserverTranscript({ bindings: unsupported.bindings, scenario: createScenario("BG-D01") }),
    /does not support fixture/u,
  );
  assert.equal(unsupported.mounts(), 0);

  let disposed = false;
  const failing: DispatchObserverBindings = {
    candidate: Object.freeze({}),
    async mount() {
      return {
        observe: () => Object.freeze({ ready: true }),
        dispatch: async () => { throw new Error("synthetic dispatch failure"); },
        dispose: async () => { disposed = true; },
      };
    },
  };
  await assert.rejects(
    captureDispatchObserverTranscript({ bindings: failing, scenario: createScenario("BG-H06") }),
    /synthetic dispatch failure/u,
  );
  assert.equal(disposed, true);
});
