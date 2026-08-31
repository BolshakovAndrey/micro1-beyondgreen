import type { CollectionId, SelectionHandle, SelectionObservation } from "../../arm-visible/BG-H03/contract.ts";
import { evaluateCanonicalObservations } from "./canonical-driver.ts";
import { NEUTRAL_SCENARIO_PROVIDER_EXPORT } from "./scenario-provider.ts";
import { OfficialScenarioProviderHandlerOutputSchema } from "../../../src/official/process/ipc.ts";
import type { OfficialEvaluatorHandlerOutput, OfficialEvaluatorProcessRequest, OfficialScenarioProviderHandlerOutput, OfficialScenarioProviderProcessRequest } from "../../../src/official/process/ipc.ts";
const FIXTURE_ID = "BG-H03" as const;
const REFERENCE_ORDINAL_KEY = "selectionHandleReferenceOrdinal";
function record(value: unknown, label: string): Record<string, unknown> { if (value === null || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${label} must be an object.`); return value as Record<string, unknown>; }
function collectionId(value: unknown): CollectionId { if (value !== "herbs" && value !== "flowers" && value !== "grains") throw new TypeError("H03 selection-handle id is invalid."); return value; }
function canonicalResult(request: OfficialEvaluatorProcessRequest) {
  const transcript = record(request.capture.transcript, "Transcript");
  if (transcript.fixtureId !== FIXTURE_ID || !Array.isArray(transcript.frames)) throw new TypeError("H03 transcript binding is invalid.");
  const references = new Map<number, Readonly<{ handle: SelectionHandle; id: CollectionId; label: string }>>();
  let nextOrdinal = 1;
  const observations = transcript.frames
    .map((value, index) => record(value, `Frame ${index}`))
    .filter(({ operation }) => operation !== "dispose")
    .map((frame, index): SelectionObservation => {
      const observation = record(frame.observation, `Frame ${index} observation`);
      const ordinal = observation[REFERENCE_ORDINAL_KEY];
      if (!Number.isInteger(ordinal) || (ordinal as number) < 1) throw new TypeError("H03 reference ordinal is invalid.");
      const handleSnapshot = record(observation.selectionHandle, `Frame ${index} selection handle`);
      const id = collectionId(handleSnapshot.id);
      if (typeof handleSnapshot.label !== "string") throw new TypeError("H03 selection-handle label is invalid.");
      let reference = references.get(ordinal as number);
      if (!reference) {
        if (ordinal !== nextOrdinal) throw new TypeError("H03 reference ordinals must be contiguous and first-seen ordered.");
        const handle = Object.freeze({ id, label: handleSnapshot.label });
        reference = Object.freeze({ handle, id, label: handleSnapshot.label });
        references.set(ordinal as number, reference);
        nextOrdinal += 1;
      } else if (reference.id !== id || reference.label !== handleSnapshot.label) {
        throw new TypeError("H03 reference ordinal changed its structural snapshot.");
      }
      const { [REFERENCE_ORDINAL_KEY]: _ordinal, ...publicObservation } = observation;
      return Object.freeze({ ...publicObservation, selectionHandle: reference.handle }) as SelectionObservation;
    });
  if (observations.length === 0) throw new TypeError("H03 transcript has no observations.");
  return evaluateCanonicalObservations(observations);
}
function reasonCorrect(request: OfficialEvaluatorProcessRequest, result: ReturnType<typeof canonicalResult>): boolean { const decision = request.decisions.find(({ arm }) => arm === request.targetArm); if (result.accepted || decision?.verdict !== "reject") return false; const rationale = decision.rationale.toLowerCase().replace(/[^a-z0-9]+/gu, "-"); return [result.behaviorClass, result.failedAction].filter((value): value is string => value !== null).some((value) => rationale.includes(value.toLowerCase().replace(/[^a-z0-9]+/gu, "-"))); }
/** Release only the package-local neutral actions. */
export function OFFICIAL_SCENARIO_PROVIDER_HANDLER(request: OfficialScenarioProviderProcessRequest): OfficialScenarioProviderHandlerOutput { if (request.slot.fixtureId !== FIXTURE_ID) throw new TypeError("H03 scenario-provider slot mismatch."); return OfficialScenarioProviderHandlerOutputSchema.parse(NEUTRAL_SCENARIO_PROVIDER_EXPORT); }
/** Evaluate one immutable H03 observer transcript with the canonical oracle. */
export function OFFICIAL_EVALUATOR_HANDLER(request: OfficialEvaluatorProcessRequest): OfficialEvaluatorHandlerOutput { if (request.slot.fixtureId !== FIXTURE_ID) throw new TypeError("H03 evaluator slot mismatch."); const result = canonicalResult(request); return { groundTruth: result.accepted ? "preserving" : "false_green", reasonCorrectReject: reasonCorrect(request, result), schemaValidCompleteReport: true, evidence: { fixtureId: FIXTURE_ID, canonicalAccepted: result.accepted } }; }
