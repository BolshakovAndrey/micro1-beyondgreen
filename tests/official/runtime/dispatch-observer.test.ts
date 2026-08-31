import assert from "node:assert/strict";
import test from "node:test";

import {
  captureDispatchObserverTranscript,
  type DispatchObserverBindings,
} from "../../../src/official/runtime/dispatch-observer.ts";
import {
  sha256CanonicalJson,
  type OfficialImmutableArmDecision,
  type OfficialNeutralScenarioEnvelope,
  type OfficialObserverCapture,
  type OfficialProcessSlot,
} from "../../../src/official/process/ipc.ts";
import { finalizeOfficialObservationPair } from "../../../src/official/execution/contracts.ts";

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

function createBindings(disposeWithObservation = false, exposeH03Handle = false): Readonly<{
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
        const selectionHandle = Object.freeze({ id: "herbs", label: "Herb collection" });
        const observe = () => Object.freeze(exposeH03Handle ? { value, selectionHandle } : { value });
        return {
          observe,
          async dispatch(action) {
            assert.equal(action.type, "synthetic-change");
            value += Number(action.amount);
            return observe();
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

function h03IdentityScenario(): OfficialNeutralScenarioEnvelope {
  return createScenario("BG-H03", [
    { action: "observe", parameters: {} },
    { action: "dispatch", parameters: { value: { type: "set-note", value: "spring" } } },
    { action: "dispatch", parameters: { value: { type: "set-note", value: "summer" } } },
    { action: "dispatch", parameters: { value: { type: "select", id: "flowers" } } },
    { action: "dispatch", parameters: { value: { type: "set-note", value: "autumn" } } },
    { action: "dispatch", parameters: { value: { type: "select", id: "flowers" } } },
    { action: "dispatch", parameters: { value: { type: "select", id: "herbs" } } },
    { action: "dispatch", parameters: { value: { type: "reset" } } },
  ]);
}

function h03IdentityBindings(recreateOnNote = false): DispatchObserverBindings {
  const candidate = Object.freeze({ id: "synthetic-h03-candidate" });
  return {
    candidate,
    async mount(receivedCandidate) {
      assert.equal(receivedCandidate, candidate);
      let selectedId: "herbs" | "flowers" = "herbs";
      let selectionHandle = Object.freeze({ id: selectedId, label: "Herb collection" });
      let searchNote = "";
      let previewAttachmentCount = 1;
      const actionLog = ["mount"];
      const observe = () => Object.freeze({
        selectedId,
        selectionHandle,
        searchNote,
        previewAttachmentCount,
        actionLog: Object.freeze([...actionLog]),
      });
      return {
        observe,
        async dispatch(action) {
          if (action.type === "set-note") {
            searchNote = String(action.value);
            actionLog.push(`note-${searchNote}`);
            if (recreateOnNote) selectionHandle = Object.freeze({ ...selectionHandle });
          } else if (action.type === "select") {
            const nextId = action.id;
            if (nextId !== "herbs" && nextId !== "flowers") throw new Error("Unexpected synthetic H03 id.");
            actionLog.push(`select-${nextId}`);
            if (nextId !== selectedId) {
              selectedId = nextId;
              selectionHandle = Object.freeze({
                id: selectedId,
                label: selectedId === "herbs" ? "Herb collection" : "Flower collection",
              });
              previewAttachmentCount += 1;
            }
          } else if (action.type === "reset") {
            actionLog.push("reset");
            searchNote = "";
          } else {
            throw new Error("Unexpected synthetic H03 action.");
          }
          return observe();
        },
        async dispose() {},
      };
    },
  };
}

function observerCapture(
  slot: OfficialProcessSlot,
  decision: OfficialImmutableArmDecision,
  transcript: unknown,
): OfficialObserverCapture {
  const core = {
    schemaVersion: "beyondgreen-official-observer-capture@1.0.0" as const,
    slot,
    arm: decision.arm,
    decisionSha256: decision.decisionSha256,
    transcript,
    transcriptSha256: sha256CanonicalJson(transcript),
    immutable: true as const,
  };
  return { ...core, captureSha256: sha256CanonicalJson(core) };
}

test("dispatch observer handles all five public fixture families without domain action knowledge", async () => {
  for (const fixtureId of FIXTURE_IDS) {
    const fixture = createBindings(fixtureId === "BG-H04", fixtureId === "BG-H03");
    const transcript = await captureDispatchObserverTranscript({
      bindings: fixture.bindings,
      scenario: createScenario(fixtureId),
    });
    assert.equal(transcript.fixtureId, fixtureId);
    assert.deepEqual(transcript.frames.map(({ operation }) => operation), ["observe", "dispatch", "observe"]);
    assert.deepEqual(transcript.frames.map(({ observation }) => (
      observation as Readonly<{ value: number }>
    ).value), [0, 2, 2]);
    if (fixtureId === "BG-H03") {
      assert.deepEqual(transcript.frames.map(({ observation }) => (
        observation as Readonly<{ selectionHandleReferenceOrdinal: number }>
      ).selectionHandleReferenceOrdinal), [1, 1, 1]);
    }
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

test("BG-H03 reference ordinals span every frame and remain deterministic across captures", async () => {
  const scenario = h03IdentityScenario();
  const first = await captureDispatchObserverTranscript({ bindings: h03IdentityBindings(), scenario });
  const second = await captureDispatchObserverTranscript({ bindings: h03IdentityBindings(), scenario });
  const ordinals = first.frames.map(({ observation }) => (
    observation as Readonly<{ selectionHandleReferenceOrdinal: number }>
  ).selectionHandleReferenceOrdinal);

  assert.deepEqual(ordinals, [1, 1, 1, 2, 2, 2, 3, 3]);
  assert.deepEqual(second, first);
  assert.equal(JSON.stringify(second), JSON.stringify(first));
});

test("BG-H03 identity divergence remains a fail-closed observation-pair mismatch", async () => {
  const scenario = h03IdentityScenario();
  const preserving = await captureDispatchObserverTranscript({ bindings: h03IdentityBindings(), scenario });
  const divergent = await captureDispatchObserverTranscript({ bindings: h03IdentityBindings(true), scenario });
  const slot = scenario.slot;
  const decisionCore = {
    schemaVersion: "beyondgreen-official-arm-decision@1.0.0" as const,
    slot,
    arm: "status-quo" as const,
    verdict: "accept" as const,
    rationale: "synthetic public identity check",
    inputSha256: "a".repeat(64),
    evidenceSha256: "b".repeat(64),
    immutable: true as const,
  };
  const decision: OfficialImmutableArmDecision = {
    ...decisionCore,
    decisionSha256: sha256CanonicalJson(decisionCore),
  };

  assert.notEqual(sha256CanonicalJson(divergent), sha256CanonicalJson(preserving));
  assert.throws(() => finalizeOfficialObservationPair({
    slot,
    arm: "status-quo",
    decision,
    captures: [observerCapture(slot, decision, preserving), observerCapture(slot, decision, divergent)],
  }), /OBSERVATION_CAPTURE_DIVERGENCE/u);
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
