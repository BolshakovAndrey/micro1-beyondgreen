import {
  OfficialNeutralScenarioEnvelopeSchema,
  type OfficialNeutralScenarioEnvelope,
} from "../process/ipc.ts";

type JsonPrimitive = null | boolean | number | string;

/** JSON-compatible value accepted at the observer evidence boundary. */
export type DispatchObserverJson =
  | JsonPrimitive
  | readonly DispatchObserverJson[]
  | Readonly<{ [key: string]: DispatchObserverJson }>;

const DISPATCH_FIXTURE_IDS = new Set([
  "BG-D02",
  "BG-D04",
  "BG-H03",
  "BG-H04",
  "BG-H06",
]);

const H03_REFERENCE_ORDINAL_KEY = "selectionHandleReferenceOrdinal";

type H03IdentityCaptureState = {
  readonly ordinals: WeakMap<object, number>;
  nextOrdinal: number;
};

/** Public mounted-harness surface shared by dispatch-oriented fixtures. */
export type MountedDispatchObserver = Readonly<{
  observe(): unknown;
  dispatch(value: Readonly<Record<string, unknown>>): unknown | Promise<unknown>;
  dispose(): unknown | Promise<unknown>;
}>;

/** Already-loaded public bindings; this runtime never imports candidates itself. */
export type DispatchObserverBindings = Readonly<{
  candidate: unknown;
  mount(candidate: unknown): MountedDispatchObserver | Promise<MountedDispatchObserver>;
}>;

/** One deterministic public observation produced by a neutral scenario step. */
export type DispatchObserverFrame = Readonly<{
  ordinal: number;
  operation: "observe" | "dispatch" | "dispose";
  observation: DispatchObserverJson;
}>;

/** Stable transcript passed to the isolated evaluator after capture. */
export type DispatchObserverTranscript = Readonly<{
  schemaVersion: "beyondgreen-dispatch-observer-transcript@1.0.0";
  fixtureId: string;
  scenarioId: string;
  scenarioSha256: string;
  frames: readonly DispatchObserverFrame[];
  disposal: Readonly<{
    called: true;
    observation: DispatchObserverJson | null;
  }>;
}>;

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function assertJsonCompatible(value: unknown, path: string): asserts value is DispatchObserverJson {
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error(`Observer output is not JSON-compatible at ${path}.`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertJsonCompatible(entry, `${path}[${index}]`));
    return;
  }
  if (!isPlainRecord(value)) throw new Error(`Observer output is not JSON-compatible at ${path}.`);
  for (const [key, entry] of Object.entries(value)) {
    assertJsonCompatible(entry, `${path}.${key}`);
  }
}

function deepFreezeJson(value: DispatchObserverJson): DispatchObserverJson {
  if (Array.isArray(value)) {
    for (const entry of value) deepFreezeJson(entry);
    return Object.freeze(value);
  }
  if (value !== null && typeof value === "object") {
    for (const entry of Object.values(value)) deepFreezeJson(entry);
    return Object.freeze(value);
  }
  return value;
}

function immutableJson(value: unknown, path: string): DispatchObserverJson {
  assertJsonCompatible(value, path);
  // A JSON round-trip removes object identity so candidate-owned objects cannot
  // mutate evidence after the observer has returned it.
  return deepFreezeJson(JSON.parse(JSON.stringify(value)) as DispatchObserverJson);
}

/**
 * Preserve H03 reference equivalence before the JSON boundary removes identity.
 * One state object lives for the complete capture, so ordinals remain comparable
 * across every frame while revealing no candidate or oracle-owned identifier.
 */
function immutableObservation(
  fixtureId: string,
  value: unknown,
  path: string,
  h03Identity: H03IdentityCaptureState,
): DispatchObserverJson {
  if (fixtureId !== "BG-H03") return immutableJson(value, path);
  if (!isPlainRecord(value) || Object.hasOwn(value, H03_REFERENCE_ORDINAL_KEY)) {
    throw new Error("BG-H03 observation cannot carry a pre-existing reference ordinal.");
  }
  const selectionHandle = value.selectionHandle;
  if (!isPlainRecord(selectionHandle)) {
    throw new Error("BG-H03 observation must expose a plain selection handle.");
  }
  let ordinal = h03Identity.ordinals.get(selectionHandle);
  if (ordinal === undefined) {
    ordinal = h03Identity.nextOrdinal;
    h03Identity.nextOrdinal += 1;
    h03Identity.ordinals.set(selectionHandle, ordinal);
  }
  return immutableJson({ ...value, [H03_REFERENCE_ORDINAL_KEY]: ordinal }, path);
}

type NormalizedStep = Readonly<{
  operation: "observe" | "dispose";
}> | Readonly<{
  operation: "dispatch";
  value: Readonly<Record<string, unknown>>;
}>;

function normalizeStep(step: OfficialNeutralScenarioEnvelope["steps"][number]): NormalizedStep {
  if (!isPlainRecord(step.parameters)) {
    throw new Error("Neutral scenario step parameters must be a plain object.");
  }
  const keys = Object.keys(step.parameters);
  if (step.action === "observe") {
    if (keys.length !== 0) throw new Error("Observe step parameters must be empty.");
    return Object.freeze({ operation: "observe" });
  }
  if (step.action === "dispose") {
    if (keys.length !== 0) throw new Error("Dispose step parameters must be empty.");
    return Object.freeze({ operation: "dispose" });
  }
  if (step.action === "dispatch") {
    if (keys.length !== 1 || keys[0] !== "value" || !isPlainRecord(step.parameters.value)) {
      throw new Error("Dispatch step parameters must contain only an action object in value.");
    }
    // Validate before mounting so malformed hidden input cannot cause candidate work.
    const value = immutableJson(step.parameters.value, "scenario.parameters.value");
    if (!isPlainRecord(value)) throw new Error("Dispatch action value must remain a plain object.");
    return Object.freeze({ operation: "dispatch", value });
  }
  throw new Error(`Unsupported neutral observer operation: ${step.action}.`);
}

/**
 * Execute one post-decision neutral scenario against an already-loaded public
 * harness. The adapter interprets only generic observer operations and treats every
 * fixture action object as opaque data, preserving the hidden-oracle boundary.
 */
export async function captureDispatchObserverTranscript(input: Readonly<{
  bindings: DispatchObserverBindings;
  scenario: OfficialNeutralScenarioEnvelope;
}>): Promise<DispatchObserverTranscript> {
  const scenario = OfficialNeutralScenarioEnvelopeSchema.parse(input.scenario);
  if (!DISPATCH_FIXTURE_IDS.has(scenario.slot.fixtureId)) {
    throw new Error(`Dispatch observer does not support fixture ${scenario.slot.fixtureId}.`);
  }
  const steps = scenario.steps.map(normalizeStep);
  const mounted = await input.bindings.mount(input.bindings.candidate);
  const frames: DispatchObserverFrame[] = [];
  // This WeakMap must span all frames in this capture; per-frame state would erase
  // the exact cross-step identity relation that BG-H03 makes publicly observable.
  const h03Identity: H03IdentityCaptureState = { ordinals: new WeakMap(), nextOrdinal: 1 };
  let disposalObservation: DispatchObserverJson | null = null;
  let disposed = false;

  try {
    for (const [index, step] of steps.entries()) {
      if (disposed) throw new Error("Dispatch observer operation follows disposal.");
      const observation = step.operation === "observe"
        ? mounted.observe()
        : step.operation === "dispatch"
          ? await mounted.dispatch(step.value)
          : await mounted.dispose();
      if (step.operation === "dispose") {
        disposed = true;
        if (observation !== undefined) {
          disposalObservation = immutableObservation(
            scenario.slot.fixtureId,
            observation,
            "disposal.observation",
            h03Identity,
          );
        }
      }
      frames.push(Object.freeze({
        ordinal: index + 1,
        operation: step.operation,
        observation: immutableObservation(
          scenario.slot.fixtureId,
          observation,
          `frames[${index}].observation`,
          h03Identity,
        ),
      }));
    }
  } finally {
    if (!disposed) {
      const result = await mounted.dispose();
      disposed = true;
      if (result !== undefined) {
        disposalObservation = immutableObservation(
          scenario.slot.fixtureId,
          result,
          "disposal.observation",
          h03Identity,
        );
      }
    }
  }

  return Object.freeze({
    schemaVersion: "beyondgreen-dispatch-observer-transcript@1.0.0",
    fixtureId: scenario.slot.fixtureId,
    scenarioId: scenario.scenarioId,
    scenarioSha256: scenario.scenarioSha256,
    frames: Object.freeze(frames),
    disposal: Object.freeze({ called: disposed, observation: disposalObservation }),
  });
}
