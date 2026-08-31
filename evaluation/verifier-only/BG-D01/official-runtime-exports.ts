import type { BoardObservation } from "../../arm-visible/BG-D01/contract.ts";
import { evaluateCanonicalObservations } from "./canonical-driver.ts";
import { NEUTRAL_SCENARIO_PROVIDER_EXPORT } from "./scenario-provider.ts";
import { OfficialScenarioProviderHandlerOutputSchema } from "../../../src/official/process/ipc.ts";
import type {
  OfficialEvaluatorHandlerOutput,
  OfficialEvaluatorProcessRequest,
  OfficialScenarioProviderHandlerOutput,
  OfficialScenarioProviderProcessRequest,
} from "../../../src/official/process/ipc.ts";

const FIXTURE_ID = "BG-D01" as const;

function record(value: unknown, label: string): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${label} must be an object.`);
  return value as Record<string, unknown>;
}

function canonicalResult(request: OfficialEvaluatorProcessRequest) {
  const transcript = record(request.capture.transcript, "Transcript");
  if (transcript.fixtureId !== FIXTURE_ID || !Array.isArray(transcript.frames)) throw new TypeError("D01 transcript binding is invalid.");
  const observations = transcript.frames.map((value, index) => record(value, `Frame ${index}`))
    .filter(({ operation }) => operation !== "dispose")
    .map((frame) => frame.observation as BoardObservation);
  if (observations.length === 0) throw new TypeError("D01 transcript has no observations.");
  return evaluateCanonicalObservations(observations);
}

function reasonCorrect(request: OfficialEvaluatorProcessRequest, result: ReturnType<typeof canonicalResult>): boolean {
  const decision = request.decisions.find(({ arm }) => arm === request.targetArm);
  if (result.accepted || decision?.verdict !== "reject") return false;
  const rationale = decision.rationale.toLowerCase().replace(/[^a-z0-9]+/gu, "-");
  return [result.behaviorClass, result.failedAction]
    .filter((value): value is string => value !== null)
    .some((value) => rationale.includes(value.toLowerCase().replace(/[^a-z0-9]+/gu, "-")));
}

/** Release the verifier-owned neutral D01 scenario after process-level decision gating. */
export function OFFICIAL_SCENARIO_PROVIDER_HANDLER(
  request: OfficialScenarioProviderProcessRequest,
): OfficialScenarioProviderHandlerOutput {
  if (request.slot.fixtureId !== FIXTURE_ID) throw new TypeError("D01 scenario-provider slot mismatch.");
  return OfficialScenarioProviderHandlerOutputSchema.parse(NEUTRAL_SCENARIO_PROVIDER_EXPORT);
}

/** Evaluate the observer transcript with the frozen D01 canonical oracle. */
export function OFFICIAL_EVALUATOR_HANDLER(
  request: OfficialEvaluatorProcessRequest,
): OfficialEvaluatorHandlerOutput {
  if (request.slot.fixtureId !== FIXTURE_ID) throw new TypeError("D01 evaluator slot mismatch.");
  const result = canonicalResult(request);
  return {
    groundTruth: result.accepted ? "preserving" : "false_green",
    reasonCorrectReject: reasonCorrect(request, result),
    schemaValidCompleteReport: true,
    evidence: { fixtureId: FIXTURE_ID, canonicalAccepted: result.accepted },
  };
}
