import assert from "node:assert/strict";
import test from "node:test";

import type { DisplayCardEditorComponent } from "../../../evaluation/arm-visible/BG-H01/contract.ts";
import type { StargazingGuideComponent } from "../../../evaluation/arm-visible/BG-H02/contract.ts";
import type { UnitReadoutComponent } from "../../../evaluation/arm-visible/BG-H05/contract.ts";
import {
  captureBGD03SpecializedTranscript,
  captureBGH01SpecializedTranscript,
  captureBGH02SpecializedTranscript,
  captureBGH05SpecializedTranscript,
  type BGD03ObserverBindings,
  type BGH01ObserverBindings,
  type BGH02ObserverBindings,
  type BGH05ObserverBindings,
} from "../../../src/official/runtime/specialized-observers.ts";
import {
  sha256CanonicalJson,
  type OfficialNeutralScenarioEnvelope,
} from "../../../src/official/process/ipc.ts";

type FixtureId = "BG-D03" | "BG-H01" | "BG-H02" | "BG-H05";

function scenario(
  fixtureId: FixtureId,
  steps: readonly Readonly<{ action: string; parameters: unknown }>[],
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
    scenarioId: `synthetic:${fixtureId}`,
    decisionSetSha256: sha256CanonicalJson({ synthetic: "decision-set" }),
    steps,
    immutable: true as const,
  };
  return { ...core, scenarioSha256: sha256CanonicalJson(core) } as OfficialNeutralScenarioEnvelope;
}

function d03Bindings(): BGD03ObserverBindings {
  class Planner {
    readonly #capacity: number;
    readonly #catalog: Map<string, number>;
    readonly #selected = new Map<string, number>();

    constructor(capacity: number, varieties: readonly Readonly<{ id: string; cellsPerPacket: number }>[]) {
      this.#capacity = capacity;
      this.#catalog = new Map(varieties.map(({ id, cellsPerPacket }) => [id, cellsPerPacket]));
    }

    get snapshot() {
      const selected = [...this.#selected].map(([varietyId, packetCount]) => ({ varietyId, packetCount }));
      const occupiedCells = selected.reduce((total, item) => total + item.packetCount * this.#catalog.get(item.varietyId)!, 0);
      return Object.freeze({ selected, occupiedCells, remainingCells: this.#capacity - occupiedCells, overCapacity: occupiedCells > this.#capacity });
    }

    add(varietyId: string): boolean { if (!this.#catalog.has(varietyId) || this.#selected.has(varietyId)) return false; this.#selected.set(varietyId, 1); return true; }
    setPacketCount(varietyId: string, count: number): boolean { if (!this.#selected.has(varietyId) || count <= 0) return false; this.#selected.set(varietyId, count); return true; }
    remove(varietyId: string): boolean { return this.#selected.delete(varietyId); }
    reset(): void { this.#selected.clear(); }
  }
  return { Planner };
}

const D03_SCENARIO = scenario("BG-D03", [
  { action: "construct", parameters: { capacity: 8, varieties: [{ id: "one", label: "One", cellsPerPacket: 2 }] } },
  { action: "snapshot", parameters: {} },
  { action: "render-summary", parameters: {} },
  { action: "add", parameters: { varietyId: "one" } },
  { action: "setPacketCount", parameters: { varietyId: "one", packetCount: 3 } },
  { action: "reset", parameters: {} },
]);

test("D03 routes constructor and class-method categories deterministically", async () => {
  const first = await captureBGD03SpecializedTranscript({ bindings: d03Bindings(), scenario: D03_SCENARIO });
  const second = await captureBGD03SpecializedTranscript({ bindings: d03Bindings(), scenario: D03_SCENARIO });
  assert.deepEqual(second, first);
  assert.deepEqual(first.frames.map(({ operation, result }) => ({ operation, result })), [
    { operation: "construct", result: null },
    { operation: "snapshot", result: null },
    { operation: "snapshot", result: null },
    { operation: "add", result: true },
    { operation: "setPacketCount", result: true },
    { operation: "reset", result: null },
  ]);
  assert.equal(first.disposal.called, false);
  assert.equal(Object.isFrozen(first.frames[2]!.observation), true);
});

function h01Bindings(options: Readonly<{ throwOnDispatch?: boolean }> = {}): Readonly<{
  bindings: BGH01ObserverBindings;
  mounts(): number;
  disposals(): number;
}> {
  let mounts = 0;
  let disposals = 0;
  const component = (() => null) as DisplayCardEditorComponent;
  return {
    bindings: {
      component,
      async mount(received, initial) {
        assert.equal(received, component);
        mounts += 1;
        let props = initial;
        let title = initial.initialTitle;
        let theme = initial.initialTheme;
        const observe = () => Object.freeze({ cardId: props.cardId, title, theme, dirty: title !== props.initialTitle || theme !== props.initialTheme, actionLog: [] });
        return {
          observe,
          async dispatch(action) {
            if (options.throwOnDispatch) throw new Error("synthetic H01 dispatch failure");
            if (action.type === "edit-title") title = action.value;
            if (action.type === "edit-theme") theme = action.value;
            if (action.type === "reset-current") { title = props.initialTitle; theme = props.initialTheme; }
            return observe();
          },
          async rerender(next) { if (next.cardId !== props.cardId) { title = next.initialTitle; theme = next.initialTheme; } props = next; return observe(); },
          async dispose() { disposals += 1; },
        };
      },
    },
    mounts: () => mounts,
    disposals: () => disposals,
  };
}

const H01_SCENARIO = scenario("BG-H01", [
  { action: "mount", parameters: { cardId: "CARD-1", initialTitle: "Initial", initialTheme: "blue" } },
  { action: "dispatch", parameters: { action: { type: "edit-title", value: "Draft" } } },
  { action: "rerender", parameters: { cardId: "CARD-2", initialTitle: "Second", initialTheme: "green", transitionLabel: "next-card" } },
  { action: "observe", parameters: {} },
]);

test("H01 routes mount, dispatch, and rerender and always cleans up", async () => {
  const fixture = h01Bindings();
  const output = await captureBGH01SpecializedTranscript({ bindings: fixture.bindings, scenario: H01_SCENARIO });
  assert.equal(fixture.mounts(), 1);
  assert.equal(fixture.disposals(), 1);
  assert.deepEqual(output.frames.map(({ operation }) => operation), ["mount", "dispatch", "rerender", "observe"]);
  assert.deepEqual(output.frames.at(-1)?.observation, { cardId: "CARD-2", title: "Second", theme: "green", dirty: false, actionLog: [] });

  const failing = h01Bindings({ throwOnDispatch: true });
  await assert.rejects(
    captureBGH01SpecializedTranscript({ bindings: failing.bindings, scenario: H01_SCENARIO }),
    /synthetic H01 dispatch failure/u,
  );
  assert.equal(failing.disposals(), 1);
});

test("H01 accepts the frozen public card and value aliases", async () => {
  const fixture = h01Bindings();
  const output = await captureBGH01SpecializedTranscript({
    bindings: fixture.bindings,
    scenario: scenario("BG-H01", [
      { action: "mount", parameters: { card: { cardId: "CARD-1", initialTitle: "Initial", initialTheme: "blue" } } },
      { action: "dispatch", parameters: { value: { type: "edit-title", value: "Draft" } } },
      { action: "rerender", parameters: { card: { cardId: "CARD-2", initialTitle: "Second", initialTheme: "green" }, transitionLabel: "next-card" } },
      { action: "dispose", parameters: {} },
    ]),
  });
  assert.deepEqual(output.frames.map(({ operation }) => operation), ["mount", "dispatch", "rerender", "dispose"]);
  assert.equal(fixture.disposals(), 1);
});

function h02Bindings(): Readonly<{ bindings: BGH02ObserverBindings; disposals(): number }> {
  let disposals = 0;
  const component = (() => null) as StargazingGuideComponent;
  return {
    bindings: {
      component,
      async mount(received) {
        assert.equal(received, component);
        let selectedGuideId: "none" | "GUIDE-MOON" | "GUIDE-METEOR" | "GUIDE-COMET" = "none";
        let status: "idle" | "loading" | "ready" = "idle";
        let content = "none";
        let request = 0;
        const observe = () => Object.freeze({ selectedGuideId, status, content, actionLog: [], createdRequestIds: [] });
        return {
          observe,
          async select(guideId) {
            selectedGuideId = guideId;
            status = "loading";
            const handle = Object.freeze({ requestId: `raw-${++request}`, guideId });
            return Object.freeze({ handle, observation: observe() });
          },
          async complete(handle) { status = "ready"; content = `content:${handle.guideId}`; return observe(); },
          async reset() { selectedGuideId = "none"; status = "idle"; content = "none"; return observe(); },
          async dispose() { disposals += 1; },
        };
      },
    },
    disposals: () => disposals,
  };
}

const H02_SCENARIO = scenario("BG-H02", [
  { action: "select", parameters: { guideId: "GUIDE-MOON", label: "first", handleAlias: "request-one" } },
  { action: "select", parameters: { guideId: "GUIDE-COMET", label: "second", handleAlias: "request-two" } },
  { action: "complete", parameters: { handleAlias: "request-two" } },
  { action: "complete", parameters: { handleAlias: "request-one" } },
  { action: "reset", parameters: {} },
]);

test("H02 resolves only opaque aliases and rejects missing or duplicate aliases", async () => {
  const fixture = h02Bindings();
  const output = await captureBGH02SpecializedTranscript({ bindings: fixture.bindings, scenario: H02_SCENARIO });
  assert.equal(fixture.disposals(), 1);
  assert.deepEqual(output.frames[0]?.result, { handleAlias: "request-one" });
  assert.equal(JSON.stringify(output.frames[0]?.result).includes("raw-"), false);

  for (const steps of [
    [
      { action: "complete", parameters: { alias: "missing" } },
    ],
    [
      { action: "select", parameters: { guideId: "GUIDE-MOON", label: "one", alias: "same" } },
      { action: "select", parameters: { guideId: "GUIDE-COMET", label: "two", alias: "same" } },
    ],
  ]) {
    const invalid = h02Bindings();
    await assert.rejects(captureBGH02SpecializedTranscript({ bindings: invalid.bindings, scenario: scenario("BG-H02", steps) }), /alias/u);
    assert.equal(invalid.disposals(), 1);
  }
});

function h05Bindings(): Readonly<{ bindings: BGH05ObserverBindings; mounts(): number; disposals(): number }> {
  let mounts = 0;
  let disposals = 0;
  const component = (() => null) as UnitReadoutComponent;
  return {
    bindings: {
      component,
      pair: true,
      async mount(received, pair) {
        assert.equal(received, component);
        assert.equal(pair, true);
        mounts += 1;
        let unit: "metric" | "imperial" = "metric";
        let revision = 0;
        let south = true;
        const observe = () => Object.freeze({ store: { unit, revision }, readouts: { north: { unit, revision }, ...(south ? { south: { unit, revision } } : {}) }, subscribers: south ? 2 : 1, notifications: { north: revision, south: south ? revision : 0 } });
        const write = async (next: "metric" | "imperial") => { if (next !== unit) { unit = next; revision += 1; } return observe(); };
        return {
          observe,
          toolbarWrite: write,
          externalWrite: write,
          async unmountSouth() { south = false; return observe(); },
          async remountSouth() { south = true; return observe(); },
          snapshotIdentity() { return Object.freeze({ unit, revision }); },
          async dispose() { disposals += 1; south = false; return Object.freeze({ ...observe(), subscribers: 0 }); },
        };
      },
    },
    mounts: () => mounts,
    disposals: () => disposals,
  };
}

const H05_SCENARIO = scenario("BG-H05", [
  { action: "observe", parameters: {} },
  { action: "externalWrite", parameters: { unit: "imperial" } },
  { action: "unmountSouth", parameters: {} },
  { action: "remount-south", parameters: {} },
  { action: "snapshotIdentity", parameters: {} },
]);

test("H05 routes writes and lifecycle operations and returns deterministic JSON", async () => {
  const firstFixture = h05Bindings();
  const first = await captureBGH05SpecializedTranscript({ bindings: firstFixture.bindings, scenario: H05_SCENARIO });
  const secondFixture = h05Bindings();
  const second = await captureBGH05SpecializedTranscript({ bindings: secondFixture.bindings, scenario: H05_SCENARIO });
  assert.deepEqual(second, first);
  assert.equal(firstFixture.mounts(), 1);
  assert.equal(firstFixture.disposals(), 1);
  assert.deepEqual(first.frames.map(({ operation }) => operation), ["observe", "externalWrite", "unmountSouth", "remountSouth", "snapshotIdentity"]);
  assert.equal(first.disposal.called, true);
});

test("all specialized adapters reject malformed public parameter shapes before mounting", async () => {
  await assert.rejects(captureBGD03SpecializedTranscript({
    bindings: d03Bindings(),
    scenario: scenario("BG-D03", [{ action: "construct", parameters: { capacity: 8, varieties: [], extra: true } }]),
  }));

  const h01 = h01Bindings();
  await assert.rejects(captureBGH01SpecializedTranscript({
    bindings: h01.bindings,
    scenario: scenario("BG-H01", [{ action: "mount", parameters: { cardId: "x", initialTitle: "x", initialTheme: "invalid" } }]),
  }));
  assert.equal(h01.mounts(), 0);

  const h05 = h05Bindings();
  await assert.rejects(captureBGH05SpecializedTranscript({
    bindings: h05.bindings,
    scenario: scenario("BG-H05", [{ action: "externalWrite", parameters: { unit: "unknown" } }]),
  }));
  assert.equal(h05.mounts(), 0);
});
