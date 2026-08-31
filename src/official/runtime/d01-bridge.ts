import type {
  BoardAction,
  MuseumBoardComponent,
} from "../../../evaluation/arm-visible/BG-D01/contract.ts";
import type { MountedMuseumBoard } from "../../../evaluation/arm-visible/BG-D01/harness.ts";
import {
  OfficialNeutralScenarioEnvelopeSchema,
  type OfficialNeutralScenarioEnvelope,
} from "../process/ipc.ts";
import { atOfficialHandlerStage } from "../process/handler-stage.ts";

type JsonPrimitive = null | boolean | number | string;
type JsonValue = JsonPrimitive | readonly JsonValue[] | Readonly<{ [key: string]: JsonValue }>;

/** Already-loaded D01 public component and harness binding. */
export type D01ObserverBridgeBindings = Readonly<{
  component: MuseumBoardComponent;
  mount(component: MuseumBoardComponent): Promise<MountedMuseumBoard>;
}>;

/** One D01 public dispatch and its settled observation. */
export type D01ObserverBridgeFrame = Readonly<{
  ordinal: number;
  operation: "observe" | "dispatch" | "dispose";
  actionType: BoardAction["type"] | null;
  observation: JsonValue;
}>;

/** Candidate-free D01 transcript compatible with the shared post-decision handoff. */
export type D01ObserverBridgeTranscript = Readonly<{
  schemaVersion: "beyondgreen-d01-observer-bridge@1.0.0";
  fixtureId: "BG-D01";
  scenarioId: string;
  scenarioSha256: string;
  frames: readonly D01ObserverBridgeFrame[];
  disposalCalled: true;
}>;

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[], label: string): void {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
    throw new Error(`${label} parameters do not match the public action shape.`);
  }
}

function assertJson(value: unknown, path: string): asserts value is JsonValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error(`D01 observation is not JSON-compatible at ${path}.`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertJson(entry, `${path}[${index}]`));
    return;
  }
  if (!isPlainRecord(value)) throw new Error(`D01 observation is not JSON-compatible at ${path}.`);
  for (const [key, entry] of Object.entries(value)) assertJson(entry, `${path}.${key}`);
}

function freezeJson(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return Object.freeze(value.map(freezeJson));
  if (value !== null && typeof value === "object") {
    return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, freezeJson(entry)])));
  }
  return value;
}

function immutableObservation(value: unknown, ordinal: number): JsonValue {
  assertJson(value, `frames[${ordinal - 1}].observation`);
  return freezeJson(JSON.parse(JSON.stringify(value)) as JsonValue);
}

function requireInteger(value: unknown, label: string): number {
  if (!Number.isInteger(value) || Number(value) <= 0) throw new Error(`${label} must be a positive integer.`);
  return Number(value);
}

function parseBoardAction(value: unknown): BoardAction {
  if (!isPlainRecord(value) || typeof value.type !== "string") {
    throw new Error("D01 dispatch action must be a plain public action object.");
  }
  switch (value.type) {
    case "select-all":
    case "select-every-third":
    case "reset":
      exactKeys(value, ["type"], `D01 ${value.type}`);
      return Object.freeze({ type: value.type });
    case "set-step":
      exactKeys(value, ["type", "value"], "D01 set-step");
      return Object.freeze({ type: "set-step", value: requireInteger(value.value, "D01 step") });
    case "allocate": {
      exactKeys(value, ["type", "multiplicity"], "D01 allocate");
      const multiplicity = requireInteger(value.multiplicity, "D01 allocate multiplicity");
      if (multiplicity !== 1 && multiplicity !== 2) throw new Error("D01 allocate multiplicity is invalid.");
      return Object.freeze({ type: "allocate", multiplicity });
    }
    case "remove":
      exactKeys(value, ["type", "multiplicity"], "D01 remove");
      if (value.multiplicity !== 1) throw new Error("D01 remove multiplicity is invalid.");
      return Object.freeze({ type: "remove", multiplicity: 1 });
    default:
      throw new Error("D01 dispatch action type is unsupported.");
  }
}

type NormalizedD01Step = Readonly<{ operation: "observe" | "dispose" }> | Readonly<{
  operation: "dispatch";
  action: BoardAction;
}>;

function normalizeStep(step: OfficialNeutralScenarioEnvelope["steps"][number]): NormalizedD01Step {
  if (!isPlainRecord(step.parameters)) throw new Error("D01 step parameters must be a plain object.");
  if (step.action === "observe") {
    exactKeys(step.parameters, [], "D01 observe");
    return Object.freeze({ operation: "observe" });
  }
  if (step.action === "dispose") {
    exactKeys(step.parameters, [], "D01 dispose");
    return Object.freeze({ operation: "dispose" });
  }
  if (step.action === "dispatch") {
    const actionKey = "action" in step.parameters ? "action" : "value";
    exactKeys(step.parameters, [actionKey], "D01 dispatch");
    return Object.freeze({ operation: "dispatch", action: parseBoardAction(step.parameters[actionKey]) });
  }
  if (step.action === "select-all" || step.action === "select-every-third" || step.action === "reset") {
    exactKeys(step.parameters, [], `D01 ${step.action}`);
    return Object.freeze({ operation: "dispatch", action: Object.freeze({ type: step.action }) });
  }
  if (step.action === "set-step") {
    exactKeys(step.parameters, ["value"], "D01 set-step");
    return Object.freeze({
      operation: "dispatch",
      action: Object.freeze({ type: "set-step", value: requireInteger(step.parameters.value, "D01 step") }),
    });
  }
  if (step.action === "allocate") {
    exactKeys(step.parameters, ["multiplicity"], "D01 allocate");
    const multiplicity = requireInteger(step.parameters.multiplicity, "D01 allocate multiplicity");
    if (multiplicity !== 1 && multiplicity !== 2) throw new Error("D01 allocate multiplicity is invalid.");
    return Object.freeze({ operation: "dispatch", action: Object.freeze({ type: "allocate", multiplicity }) });
  }
  if (step.action === "remove") {
    exactKeys(step.parameters, ["multiplicity"], "D01 remove");
    if (step.parameters.multiplicity !== 1) throw new Error("D01 remove multiplicity is invalid.");
    return Object.freeze({ operation: "dispatch", action: Object.freeze({ type: "remove", multiplicity: 1 }) });
  }
  throw new Error("Unsupported D01 public operation category.");
}

/**
 * Apply a released neutral scenario through the proven D01 public mount/dispatch
 * contract. Candidate loading and evaluator access remain outside this bridge.
 */
export async function captureD01ObserverBridgeTranscript(input: Readonly<{
  bindings: D01ObserverBridgeBindings;
  scenario: OfficialNeutralScenarioEnvelope;
}>): Promise<D01ObserverBridgeTranscript> {
  const scenario = OfficialNeutralScenarioEnvelopeSchema.parse(input.scenario);
  if (scenario.slot.fixtureId !== "BG-D01") {
    throw new Error(`D01 observer bridge does not support fixture ${scenario.slot.fixtureId}.`);
  }
  // Validate the entire action surface before candidate work begins.
  const steps = await atOfficialHandlerStage("NORMALIZE_SCENARIO", () => {
    const normalized = scenario.steps.map(normalizeStep);
    const disposeIndex = normalized.findIndex(({ operation }) => operation === "dispose");
    if (disposeIndex !== -1 && (disposeIndex !== normalized.length - 1
      || normalized.filter(({ operation }) => operation === "dispose").length !== 1)) {
      throw new Error("D01 dispose must occur exactly once and be terminal when present.");
    }
    return normalized;
  });
  const mounted = await atOfficialHandlerStage("MOUNT", () => input.bindings.mount(input.bindings.component));
  const frames: D01ObserverBridgeFrame[] = [];
  let disposed = false;
  try {
    for (const [index, step] of steps.entries()) {
      const observation = step.operation === "observe"
        ? await atOfficialHandlerStage("EXECUTE_STEP", () => mounted.observe())
        : step.operation === "dispatch"
          ? await atOfficialHandlerStage("EXECUTE_STEP", () => mounted.dispatch(step.action))
          : await atOfficialHandlerStage("DISPOSE", async () => {
            await mounted.dispose();
            disposed = true;
            return null;
          });
      frames.push(Object.freeze({
        ordinal: index + 1,
        operation: step.operation,
        actionType: step.operation === "dispatch" ? step.action.type : null,
        observation: immutableObservation(observation, index + 1),
      }));
    }
  } finally {
    if (!disposed) await atOfficialHandlerStage("DISPOSE", () => mounted.dispose());
  }
  return Object.freeze({
    schemaVersion: "beyondgreen-d01-observer-bridge@1.0.0",
    fixtureId: "BG-D01",
    scenarioId: scenario.scenarioId,
    scenarioSha256: scenario.scenarioSha256,
    frames: Object.freeze(frames),
    disposalCalled: true,
  });
}
