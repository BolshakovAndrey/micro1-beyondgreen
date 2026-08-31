import type { UnitPreference, UnitSnapshot, UnitStoreObservation } from "../../arm-visible/BG-H05/contract.ts";
import { evaluateCanonicalObservations } from "./canonical-driver.ts";
import { NEUTRAL_SCENARIO_PROVIDER_EXPORT } from "./scenario-provider.ts";
import { OfficialScenarioProviderHandlerOutputSchema } from "../../../src/official/process/ipc.ts";
import type { OfficialEvaluatorHandlerOutput, OfficialEvaluatorProcessRequest, OfficialScenarioProviderHandlerOutput, OfficialScenarioProviderProcessRequest } from "../../../src/official/process/ipc.ts";
const FIXTURE_ID = "BG-H05" as const;
const SNAPSHOT_ORDINAL_KEY = "storeSnapshotReferenceOrdinal";
function record(value: unknown, label: string): Record<string, unknown> { if (value === null || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${label} must be an object.`); return value as Record<string, unknown>; }
function unit(value: unknown): UnitPreference { if (value !== "metric" && value !== "imperial") throw new TypeError("H05 store unit is invalid."); return value; }
function canonicalResult(request: OfficialEvaluatorProcessRequest) {
  const transcript = record(request.capture.transcript, "Transcript");
  if (transcript.fixtureId !== FIXTURE_ID || !Array.isArray(transcript.frames)) throw new TypeError("H05 transcript binding is invalid.");
  const references = new Map<number, Readonly<{ snapshot: UnitSnapshot; unit: UnitPreference; revision: number }>>();
  let nextOrdinal = 1;
  const observations = transcript.frames.map((value, index) => {
    const frame = record(value, `Frame ${index}`);
    const observation = record(frame.observation, `Frame ${index} observation`);
    const ordinal = observation[SNAPSHOT_ORDINAL_KEY];
    if (!Number.isInteger(ordinal) || (ordinal as number) < 1) throw new TypeError("H05 snapshot ordinal is invalid.");
    const snapshotValue = record(observation.store, `Frame ${index} store snapshot`);
    const snapshotUnit = unit(snapshotValue.unit);
    if (!Number.isInteger(snapshotValue.revision) || Number(snapshotValue.revision) < 0) throw new TypeError("H05 store revision is invalid.");
    const revision = Number(snapshotValue.revision);
    let reference = references.get(ordinal as number);
    if (!reference) {
      if (ordinal !== nextOrdinal) throw new TypeError("H05 snapshot ordinals must be contiguous and first-seen ordered.");
      const snapshot = Object.freeze({ unit: snapshotUnit, revision });
      reference = Object.freeze({ snapshot, unit: snapshotUnit, revision });
      references.set(ordinal as number, reference);
      nextOrdinal += 1;
    } else if (reference.unit !== snapshotUnit || reference.revision !== revision) {
      throw new TypeError("H05 snapshot ordinal changed its structural snapshot.");
    }
    const { [SNAPSHOT_ORDINAL_KEY]: _ordinal, ...publicObservation } = observation;
    return Object.freeze({ ...publicObservation, store: reference.snapshot }) as UnitStoreObservation;
  });
  if (observations.length === 0) throw new TypeError("H05 transcript has no observations.");
  return evaluateCanonicalObservations(observations);
}
function reasonCorrect(request: OfficialEvaluatorProcessRequest, result: ReturnType<typeof canonicalResult>): boolean { const decision = request.decisions.find(({ arm }) => arm === request.targetArm); if (result.accepted || decision?.verdict !== "reject") return false; const rationale = decision.rationale.toLowerCase().replace(/[^a-z0-9]+/gu, "-"); return [result.behaviorClass, result.failedAction].filter((value): value is string => value !== null).some((value) => rationale.includes(value.toLowerCase().replace(/[^a-z0-9]+/gu, "-"))); }
/** Release only the package-local neutral actions. */
export function OFFICIAL_SCENARIO_PROVIDER_HANDLER(request: OfficialScenarioProviderProcessRequest): OfficialScenarioProviderHandlerOutput { if (request.slot.fixtureId !== FIXTURE_ID) throw new TypeError("H05 scenario-provider slot mismatch."); return OfficialScenarioProviderHandlerOutputSchema.parse(NEUTRAL_SCENARIO_PROVIDER_EXPORT); }
/** Evaluate one immutable H05 observer transcript with the canonical oracle. */
export function OFFICIAL_EVALUATOR_HANDLER(request: OfficialEvaluatorProcessRequest): OfficialEvaluatorHandlerOutput { if (request.slot.fixtureId !== FIXTURE_ID) throw new TypeError("H05 evaluator slot mismatch."); const result = canonicalResult(request); return { groundTruth: result.accepted ? "preserving" : "false_green", reasonCorrectReject: reasonCorrect(request, result), schemaValidCompleteReport: true, evidence: { fixtureId: FIXTURE_ID, canonicalAccepted: result.accepted } }; }
