import type {
  CardProps,
  DisplayCardEditorComponent,
  EditorAction,
} from "../../../evaluation/arm-visible/BG-H01/contract.ts";
import type { MountedDisplayCardEditor } from "../../../evaluation/arm-visible/BG-H01/harness.ts";
import type {
  GuideId,
  RequestHandle,
  StargazingGuideComponent,
} from "../../../evaluation/arm-visible/BG-H02/contract.ts";
import type { MountedStargazingGuidePreview } from "../../../evaluation/arm-visible/BG-H02/harness.ts";
import type {
  UnitPreference,
  UnitReadoutComponent,
} from "../../../evaluation/arm-visible/BG-H05/contract.ts";
import type { MountedUnitStoreFixture } from "../../../evaluation/arm-visible/BG-H05/harness.ts";
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  OfficialNeutralScenarioEnvelopeSchema,
  type OfficialNeutralScenarioEnvelope,
} from "../process/ipc.ts";

type JsonPrimitive = null | boolean | number | string;

/** JSON-compatible value retained by the specialized observer boundary. */
export type SpecializedObserverJson =
  | JsonPrimitive
  | readonly SpecializedObserverJson[]
  | Readonly<{ [key: string]: SpecializedObserverJson }>;

/** One normalized public-method execution and its settled observation. */
export type SpecializedObserverFrame = Readonly<{
  ordinal: number;
  operation: string;
  result: SpecializedObserverJson | null;
  observation: SpecializedObserverJson;
}>;

/** Deterministic transcript shared by the four heterogeneous public harnesses. */
export type SpecializedObserverTranscript = Readonly<{
  schemaVersion: "beyondgreen-specialized-observer-transcript@1.0.0";
  fixtureId: "BG-D03" | "BG-H01" | "BG-H02" | "BG-H05";
  scenarioId: string;
  scenarioSha256: string;
  frames: readonly SpecializedObserverFrame[];
  disposal: Readonly<{ called: boolean; observation: SpecializedObserverJson | null }>;
}>;

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function assertJsonCompatible(value: unknown, path: string): asserts value is SpecializedObserverJson {
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error(`Observer value is not JSON-compatible at ${path}.`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertJsonCompatible(entry, `${path}[${index}]`));
    return;
  }
  if (!isPlainRecord(value)) throw new Error(`Observer value is not JSON-compatible at ${path}.`);
  for (const [key, entry] of Object.entries(value)) {
    if (entry === undefined) continue;
    assertJsonCompatible(entry, `${path}.${key}`);
  }
}

function deepFreezeJson(value: SpecializedObserverJson): SpecializedObserverJson {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((entry) => deepFreezeJson(entry)));
  }
  if (value !== null && typeof value === "object") {
    return Object.freeze(Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, deepFreezeJson(entry)]),
    ));
  }
  return value;
}

function immutableJson(value: unknown, path: string): SpecializedObserverJson {
  assertJsonCompatible(value, path);
  const encoded = JSON.stringify(value);
  if (encoded === undefined) throw new Error(`Observer value is not JSON-compatible at ${path}.`);
  return deepFreezeJson(JSON.parse(encoded) as SpecializedObserverJson);
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[], label: string): void {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
    throw new Error(`${label} parameters do not match the public method shape.`);
  }
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) throw new Error(`${label} must be a non-empty string.`);
  return value;
}

function requireInteger(value: unknown, label: string, positive = false): number {
  if (!Number.isInteger(value) || (positive && Number(value) <= 0)) {
    throw new Error(`${label} must be ${positive ? "a positive " : "an "}integer.`);
  }
  return Number(value);
}

function emptyParameters(value: unknown, label: string): void {
  if (!isPlainRecord(value) || Object.keys(value).length !== 0) {
    throw new Error(`${label} parameters must be empty.`);
  }
}

function frame(
  ordinal: number,
  operation: string,
  result: unknown,
  observation: unknown,
): SpecializedObserverFrame {
  return Object.freeze({
    ordinal,
    operation,
    result: result === undefined ? null : immutableJson(result, `frames[${ordinal - 1}].result`),
    observation: immutableJson(observation, `frames[${ordinal - 1}].observation`),
  });
}

function transcript(input: Readonly<{
  fixtureId: SpecializedObserverTranscript["fixtureId"];
  scenario: OfficialNeutralScenarioEnvelope;
  frames: readonly SpecializedObserverFrame[];
  disposalCalled: boolean;
  disposalObservation: unknown;
}>): SpecializedObserverTranscript {
  return Object.freeze({
    schemaVersion: "beyondgreen-specialized-observer-transcript@1.0.0",
    fixtureId: input.fixtureId,
    scenarioId: input.scenario.scenarioId,
    scenarioSha256: input.scenario.scenarioSha256,
    frames: Object.freeze([...input.frames]),
    disposal: Object.freeze({
      called: input.disposalCalled,
      observation: input.disposalObservation === undefined
        ? null
        : immutableJson(input.disposalObservation, "disposal.observation"),
    }),
  });
}

function scenarioFor(
  fixtureId: SpecializedObserverTranscript["fixtureId"],
  input: OfficialNeutralScenarioEnvelope,
): OfficialNeutralScenarioEnvelope {
  const scenario = OfficialNeutralScenarioEnvelopeSchema.parse(input);
  if (scenario.slot.fixtureId !== fixtureId) {
    throw new Error(`Specialized observer does not support fixture ${scenario.slot.fixtureId}.`);
  }
  return scenario;
}

type BGD03Variety = Readonly<{ id: string; label: string; cellsPerPacket: number }>;
type BGD03Planner = Readonly<{
  snapshot: unknown;
  add(varietyId: string): boolean;
  setPacketCount(varietyId: string, packetCount: number): boolean;
  remove(varietyId: string): boolean;
  reset(): void;
}>;

/** Already-loaded public class binding for the class-based BG-D03 fixture. */
export type BGD03ObserverBindings = Readonly<{
  Planner: new (capacity: number, varieties: readonly BGD03Variety[]) => BGD03Planner;
  Summary: (props: Readonly<{ planner: BGD03Planner }>) => ReactElement;
}>;

type BGD03Step =
  | Readonly<{ operation: "construct"; capacity: number; varieties: readonly BGD03Variety[] }>
  | Readonly<{ operation: "observe" | "render-summary" }>
  | Readonly<{ operation: "add"; varietyId: string }>
  | Readonly<{ operation: "set-packet-count"; varietyId: string; packetCount: number }>;

function normalizeD03Step(step: OfficialNeutralScenarioEnvelope["steps"][number]): BGD03Step {
  if (!isPlainRecord(step.parameters)) throw new Error("D03 step parameters must be a plain object.");
  if (step.action === "construct") {
    exactKeys(step.parameters, ["capacity", "varieties"], "D03 construct");
    if (!Array.isArray(step.parameters.varieties) || step.parameters.varieties.length === 0) {
      throw new Error("D03 constructor varieties must be a non-empty array.");
    }
    const varieties = step.parameters.varieties.map((entry) => {
      if (!isPlainRecord(entry)) throw new Error("D03 variety must be a plain object.");
      exactKeys(entry, ["id", "label", "cellsPerPacket"], "D03 variety");
      return Object.freeze({
        id: requireString(entry.id, "D03 variety id"),
        label: requireString(entry.label, "D03 variety label"),
        cellsPerPacket: requireInteger(entry.cellsPerPacket, "D03 cellsPerPacket", true),
      });
    });
    return Object.freeze({
      operation: "construct",
      capacity: requireInteger(step.parameters.capacity, "D03 capacity", true),
      varieties: Object.freeze(varieties),
    });
  }
  if (step.action === "observe" || step.action === "render-summary") {
    emptyParameters(step.parameters, `D03 ${step.action}`);
    return Object.freeze({ operation: step.action });
  }
  if (step.action === "add") {
    exactKeys(step.parameters, ["varietyId"], "D03 add");
    return Object.freeze({ operation: step.action, varietyId: requireString(step.parameters.varietyId, "D03 varietyId") });
  }
  if (step.action === "set-packet-count") {
    exactKeys(step.parameters, ["varietyId", "packetCount"], "D03 set-packet-count");
    return Object.freeze({
      operation: "set-packet-count",
      varietyId: requireString(step.parameters.varietyId, "D03 varietyId"),
      packetCount: requireInteger(step.parameters.packetCount, "D03 packetCount"),
    });
  }
  throw new Error("Unsupported D03 public operation category.");
}

/** Execute the class-based D03 public API without importing a candidate or verifier. */
export async function captureBGD03SpecializedTranscript(input: Readonly<{
  bindings: BGD03ObserverBindings;
  scenario: OfficialNeutralScenarioEnvelope;
}>): Promise<SpecializedObserverTranscript> {
  const scenario = scenarioFor("BG-D03", input.scenario);
  const steps = scenario.steps.map(normalizeD03Step);
  if (steps[0]?.operation !== "construct" || steps.slice(1).some(({ operation }) => operation === "construct")) {
    throw new Error("D03 scenario must construct exactly once as its first operation.");
  }
  const constructorStep = steps[0];
  const planner = new input.bindings.Planner(constructorStep.capacity, constructorStep.varieties);
  const frames: SpecializedObserverFrame[] = [frame(1, "construct", null, planner.snapshot)];
  for (const [index, step] of steps.slice(1).entries()) {
    let result: unknown;
    let observation: unknown;
    switch (step.operation) {
      case "observe": result = null; observation = planner.snapshot; break;
      case "render-summary": {
        result = null;
        observation = Object.freeze({
          snapshot: planner.snapshot,
          markup: renderToStaticMarkup(createElement(input.bindings.Summary, { planner })),
        });
        break;
      }
      case "add": result = planner.add(step.varietyId); observation = planner.snapshot; break;
      case "set-packet-count": result = planner.setPacketCount(step.varietyId, step.packetCount); observation = planner.snapshot; break;
      case "construct": throw new Error("D03 scenario cannot construct twice.");
    }
    frames.push(frame(index + 2, step.operation, result, observation));
  }
  return transcript({ fixtureId: "BG-D03", scenario, frames, disposalCalled: false, disposalObservation: undefined });
}

/** Already-loaded public component and mount binding for BG-H01. */
export type BGH01ObserverBindings = Readonly<{
  component: DisplayCardEditorComponent;
  mount(component: DisplayCardEditorComponent, initial: CardProps): Promise<MountedDisplayCardEditor>;
}>;

type BGH01Step =
  | Readonly<{ operation: "mount"; props: CardProps }>
  | Readonly<{ operation: "observe" | "dispose" }>
  | Readonly<{ operation: "dispatch"; action: EditorAction }>
  | Readonly<{ operation: "rerender"; props: CardProps; transitionLabel: string }>;

function cardProps(value: unknown, label: string): CardProps {
  if (!isPlainRecord(value)) throw new Error(`${label} must be a plain object.`);
  exactKeys(value, ["cardId", "initialTitle", "initialTheme"], label);
  const theme = requireString(value.initialTheme, `${label} initialTheme`);
  if (theme !== "blue" && theme !== "amber" && theme !== "green") throw new Error(`${label} initialTheme is invalid.`);
  return Object.freeze({
    cardId: requireString(value.cardId, `${label} cardId`),
    initialTitle: requireString(value.initialTitle, `${label} initialTitle`),
    initialTheme: theme,
  });
}

function editorAction(value: unknown): EditorAction {
  if (!isPlainRecord(value)) throw new Error("H01 dispatch action must be a plain object.");
  const type = requireString(value.type, "H01 action type");
  if (type === "reset-current") {
    exactKeys(value, ["type"], "H01 reset action");
    return Object.freeze({ type });
  }
  if (type === "edit-title") {
    exactKeys(value, ["type", "value"], "H01 title action");
    return Object.freeze({ type, value: requireString(value.value, "H01 title value") });
  }
  if (type === "edit-theme") {
    exactKeys(value, ["type", "value"], "H01 theme action");
    const theme = requireString(value.value, "H01 theme value");
    if (theme !== "blue" && theme !== "amber" && theme !== "green") throw new Error("H01 theme value is invalid.");
    return Object.freeze({ type, value: theme });
  }
  throw new Error("H01 dispatch action type is unsupported.");
}

function normalizeH01Step(step: OfficialNeutralScenarioEnvelope["steps"][number]): BGH01Step {
  if (!isPlainRecord(step.parameters)) throw new Error("H01 step parameters must be a plain object.");
  if (step.action === "mount") {
    if (Object.keys(step.parameters).length === 1 && "card" in step.parameters) {
      return Object.freeze({ operation: "mount", props: cardProps(step.parameters.card, "H01 mount card") });
    }
    if (Object.keys(step.parameters).length === 1 && "props" in step.parameters) {
      return Object.freeze({ operation: "mount", props: cardProps(step.parameters.props, "H01 mount props") });
    }
    return Object.freeze({ operation: "mount", props: cardProps(step.parameters, "H01 mount props") });
  }
  if (step.action === "observe" || step.action === "dispose") {
    emptyParameters(step.parameters, `H01 ${step.action}`);
    return Object.freeze({ operation: step.action });
  }
  if (step.action === "dispatch") {
    if (Object.keys(step.parameters).length !== 1
      || (!("action" in step.parameters) && !("value" in step.parameters))) {
      throw new Error("H01 dispatch must contain exactly one action or value alias.");
    }
    return Object.freeze({
      operation: "dispatch",
      action: editorAction("action" in step.parameters ? step.parameters.action : step.parameters.value),
    });
  }
  if (step.action === "rerender") {
    if (Object.keys(step.parameters).length === 2 && "card" in step.parameters) {
      exactKeys(step.parameters, ["card", "transitionLabel"], "H01 rerender");
      return Object.freeze({
        operation: "rerender",
        props: cardProps(step.parameters.card, "H01 rerender card"),
        transitionLabel: requireString(step.parameters.transitionLabel, "H01 transitionLabel"),
      });
    }
    if (Object.keys(step.parameters).length === 2 && "props" in step.parameters) {
      exactKeys(step.parameters, ["props", "transitionLabel"], "H01 rerender");
      return Object.freeze({
        operation: "rerender",
        props: cardProps(step.parameters.props, "H01 rerender props"),
        transitionLabel: requireString(step.parameters.transitionLabel, "H01 transitionLabel"),
      });
    }
    exactKeys(step.parameters, ["cardId", "initialTitle", "initialTheme", "transitionLabel"], "H01 rerender");
    return Object.freeze({
      operation: "rerender",
      props: cardProps({
        cardId: step.parameters.cardId,
        initialTitle: step.parameters.initialTitle,
        initialTheme: step.parameters.initialTheme,
      }, "H01 rerender props"),
      transitionLabel: requireString(step.parameters.transitionLabel, "H01 transitionLabel"),
    });
  }
  throw new Error("Unsupported H01 public operation category.");
}

/** Route H01 mount, dispatch, and parent rerender categories through public bindings. */
export async function captureBGH01SpecializedTranscript(input: Readonly<{
  bindings: BGH01ObserverBindings;
  scenario: OfficialNeutralScenarioEnvelope;
}>): Promise<SpecializedObserverTranscript> {
  const scenario = scenarioFor("BG-H01", input.scenario);
  const steps = scenario.steps.map(normalizeH01Step);
  if (steps[0]?.operation !== "mount" || steps.slice(1).some(({ operation }) => operation === "mount")) {
    throw new Error("H01 scenario must mount exactly once as its first operation.");
  }
  const mounted = await input.bindings.mount(input.bindings.component, steps[0].props);
  const frames: SpecializedObserverFrame[] = [frame(1, "mount", null, mounted.observe())];
  let disposed = false;
  let disposalAttempted = false;
  let disposalObservation: unknown;
  try {
    for (const [index, step] of steps.slice(1).entries()) {
      if (disposed) throw new Error("H01 operation follows disposal.");
      let observation: unknown;
      switch (step.operation) {
        case "observe": observation = mounted.observe(); break;
        case "dispatch": observation = await mounted.dispatch(step.action); break;
        case "rerender": observation = await mounted.rerender(step.props, step.transitionLabel); break;
        case "dispose":
          disposalObservation = mounted.observe();
          disposalAttempted = true;
          await mounted.dispose();
          disposed = true;
          observation = disposalObservation;
          break;
        case "mount": throw new Error("H01 scenario cannot mount twice.");
      }
      frames.push(frame(index + 2, step.operation, null, observation));
    }
  } finally {
    if (!disposed && !disposalAttempted) {
      disposalObservation = mounted.observe();
      disposalAttempted = true;
      await mounted.dispose();
      disposed = true;
    }
  }
  return transcript({ fixtureId: "BG-H01", scenario, frames, disposalCalled: disposed, disposalObservation });
}

/** Already-loaded public component and mount binding for BG-H02. */
export type BGH02ObserverBindings = Readonly<{
  component: StargazingGuideComponent;
  mount(component: StargazingGuideComponent): Promise<MountedStargazingGuidePreview>;
}>;

type BGH02Step =
  | Readonly<{ operation: "observe" | "reset" | "dispose" }>
  | Readonly<{ operation: "select"; guideId: GuideId; label: string; alias: string }>
  | Readonly<{ operation: "complete"; alias: string }>;

function requestAlias(parameters: Record<string, unknown>, label: string): string {
  const aliasKey = "handleAlias" in parameters ? "handleAlias" : "alias";
  return requireString(parameters[aliasKey], label);
}

function normalizeH02Step(step: OfficialNeutralScenarioEnvelope["steps"][number]): BGH02Step {
  if (!isPlainRecord(step.parameters)) throw new Error("H02 step parameters must be a plain object.");
  if (step.action === "observe" || step.action === "reset" || step.action === "dispose") {
    emptyParameters(step.parameters, `H02 ${step.action}`);
    return Object.freeze({ operation: step.action });
  }
  if (step.action === "select") {
    const aliasKey = "handleAlias" in step.parameters ? "handleAlias" : "alias";
    exactKeys(step.parameters, ["guideId", "label", aliasKey], "H02 select");
    const guideId = requireString(step.parameters.guideId, "H02 guideId");
    if (guideId !== "GUIDE-MOON" && guideId !== "GUIDE-METEOR" && guideId !== "GUIDE-COMET") {
      throw new Error("H02 guideId is invalid.");
    }
    return Object.freeze({
      operation: "select",
      guideId,
      label: requireString(step.parameters.label, "H02 label"),
      alias: requestAlias(step.parameters, "H02 handle alias"),
    });
  }
  if (step.action === "complete") {
    const aliasKey = "handleAlias" in step.parameters ? "handleAlias" : "alias";
    exactKeys(step.parameters, [aliasKey], "H02 complete");
    return Object.freeze({ operation: "complete", alias: requestAlias(step.parameters, "H02 handle alias") });
  }
  throw new Error("Unsupported H02 public operation category.");
}

/** Execute H02 with opaque request aliases so raw handles never enter evidence. */
export async function captureBGH02SpecializedTranscript(input: Readonly<{
  bindings: BGH02ObserverBindings;
  scenario: OfficialNeutralScenarioEnvelope;
}>): Promise<SpecializedObserverTranscript> {
  const scenario = scenarioFor("BG-H02", input.scenario);
  const steps = scenario.steps.map(normalizeH02Step);
  const mounted = await input.bindings.mount(input.bindings.component);
  const handles = new Map<string, RequestHandle>();
  const frames: SpecializedObserverFrame[] = [];
  let disposed = false;
  let disposalAttempted = false;
  let disposalObservation: unknown;
  try {
    for (const [index, step] of steps.entries()) {
      if (disposed) throw new Error("H02 operation follows disposal.");
      let result: unknown;
      let observation: unknown;
      switch (step.operation) {
        case "observe": observation = mounted.observe(); break;
        case "select": {
          if (handles.has(step.alias)) throw new Error("H02 request alias is already bound.");
          const selected = await mounted.select(step.guideId, step.label);
          handles.set(step.alias, selected.handle);
          result = Object.freeze({ handleAlias: step.alias });
          observation = selected.observation;
          break;
        }
        case "complete": {
          const handle = handles.get(step.alias);
          if (!handle) throw new Error("H02 request alias is not bound.");
          handles.delete(step.alias);
          observation = await mounted.complete(handle);
          break;
        }
        case "reset": observation = await mounted.reset(); break;
        case "dispose":
          disposalObservation = mounted.observe();
          disposalAttempted = true;
          await mounted.dispose();
          disposed = true;
          observation = disposalObservation;
          break;
      }
      frames.push(frame(index + 1, step.operation, result, observation));
    }
  } finally {
    if (!disposed && !disposalAttempted) {
      disposalObservation = mounted.observe();
      disposalAttempted = true;
      await mounted.dispose();
      disposed = true;
    }
  }
  return transcript({ fixtureId: "BG-H02", scenario, frames, disposalCalled: disposed, disposalObservation });
}

/** Already-loaded public component and mount binding for BG-H05. */
export type BGH05ObserverBindings = Readonly<{
  component: UnitReadoutComponent;
  pair?: boolean;
  mount(component: UnitReadoutComponent, pair?: boolean): Promise<MountedUnitStoreFixture>;
}>;

type BGH05Step =
  | Readonly<{ operation: "observe" | "unmountSouth" | "remountSouth" | "snapshotIdentity" | "dispose" }>
  | Readonly<{ operation: "toolbarWrite" | "externalWrite"; unit: UnitPreference }>;

function normalizeH05Step(step: OfficialNeutralScenarioEnvelope["steps"][number]): BGH05Step {
  if (!isPlainRecord(step.parameters)) throw new Error("H05 step parameters must be a plain object.");
  const compact = step.action.replaceAll("_", "").replaceAll("-", "").toLowerCase();
  if (["observe", "unmountsouth", "remountsouth", "snapshotidentity", "dispose"].includes(compact)) {
    emptyParameters(step.parameters, `H05 ${step.action}`);
    const operations = {
      observe: "observe", unmountsouth: "unmountSouth", remountsouth: "remountSouth",
      snapshotidentity: "snapshotIdentity", dispose: "dispose",
    } as const;
    return Object.freeze({ operation: operations[compact as keyof typeof operations] });
  }
  if (compact === "toolbarwrite" || compact === "externalwrite") {
    exactKeys(step.parameters, ["unit"], `H05 ${step.action}`);
    const unit = requireString(step.parameters.unit, "H05 unit");
    if (unit !== "metric" && unit !== "imperial") throw new Error("H05 unit is invalid.");
    return Object.freeze({ operation: compact === "toolbarwrite" ? "toolbarWrite" : "externalWrite", unit });
  }
  throw new Error("Unsupported H05 public operation category.");
}

/** Route H05 observation, write, and lifecycle categories through its public harness. */
export async function captureBGH05SpecializedTranscript(input: Readonly<{
  bindings: BGH05ObserverBindings;
  scenario: OfficialNeutralScenarioEnvelope;
}>): Promise<SpecializedObserverTranscript> {
  const scenario = scenarioFor("BG-H05", input.scenario);
  const steps = scenario.steps.map(normalizeH05Step);
  const mounted = await input.bindings.mount(input.bindings.component, input.bindings.pair ?? true);
  const frames: SpecializedObserverFrame[] = [];
  let disposed = false;
  let disposalAttempted = false;
  let disposalObservation: unknown;
  try {
    for (const [index, step] of steps.entries()) {
      if (disposed) throw new Error("H05 operation follows disposal.");
      let result: unknown;
      let observation: unknown;
      switch (step.operation) {
        case "observe": observation = mounted.observe(); break;
        case "toolbarWrite": observation = await mounted.toolbarWrite(step.unit); break;
        case "externalWrite": observation = await mounted.externalWrite(step.unit); break;
        case "unmountSouth": observation = await mounted.unmountSouth(); break;
        case "remountSouth": observation = await mounted.remountSouth(); break;
        case "snapshotIdentity":
          result = mounted.snapshotIdentity();
          observation = mounted.observe();
          break;
        case "dispose":
          disposalAttempted = true;
          observation = await mounted.dispose();
          disposalObservation = observation;
          disposed = true;
          break;
      }
      frames.push(frame(index + 1, step.operation, result, observation));
    }
  } finally {
    if (!disposed && !disposalAttempted) {
      disposalAttempted = true;
      disposalObservation = await mounted.dispose();
      disposed = true;
    }
  }
  return transcript({ fixtureId: "BG-H05", scenario, frames, disposalCalled: disposed, disposalObservation });
}
