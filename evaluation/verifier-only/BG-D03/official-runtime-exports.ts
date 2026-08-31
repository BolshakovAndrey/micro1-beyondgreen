import { AssertionError } from "node:assert";

import type { OraclePlanner, OraclePlannerConstructor } from "./oracle-assertions.ts";
import { assertDerivedStateOracle } from "./oracle-assertions.ts";
import { NEUTRAL_SCENARIO_PROVIDER_EXPORT } from "./scenario-provider.ts";
import { OfficialScenarioProviderHandlerOutputSchema } from "../../../src/official/process/ipc.ts";
import type { OfficialEvaluatorHandlerOutput, OfficialEvaluatorProcessRequest, OfficialScenarioProviderHandlerOutput, OfficialScenarioProviderProcessRequest } from "../../../src/official/process/ipc.ts";

const FIXTURE_ID = "BG-D03" as const;
function record(value: unknown, label: string): Record<string, unknown> { if (value === null || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${label} must be an object.`); return value as Record<string, unknown>; }

function evaluateTranscript(request: OfficialEvaluatorProcessRequest): boolean {
  const transcript = record(request.capture.transcript, "Transcript");
  if (transcript.fixtureId !== FIXTURE_ID || !Array.isArray(transcript.frames)) throw new TypeError("D03 transcript binding is invalid.");
  const frames = transcript.frames.map((value, index) => record(value, `Frame ${index}`));
  const operations = ["construct", "add", "set-packet-count", "observe", "render-summary"] as const;
  if (frames.length !== operations.length || frames.some((frame, index) => frame.operation !== operations[index])) {
    throw new TypeError("D03 transcript does not preserve the exact frozen scenario order.");
  }
  const [constructFrame, addFrame, packetFrame, observeFrame, summaryFrame] = frames as [
    Record<string, unknown>, Record<string, unknown>, Record<string, unknown>, Record<string, unknown>, Record<string, unknown>,
  ];
  class TranscriptPlanner implements OraclePlanner {
    constructor(_capacity: number, _varieties: readonly { readonly id: string; readonly label: string; readonly cellsPerPacket: number }[]) { void constructFrame; }
    get snapshot(): OraclePlanner["snapshot"] { return observeFrame.observation as OraclePlanner["snapshot"]; }
    add(_varietyId: string): boolean { return addFrame.result as boolean; }
    setPacketCount(_varietyId: string, _packetCount: number): boolean { return packetFrame.result as boolean; }
  }
  const summary = record(summaryFrame.observation, "Rendered summary observation");
  const snapshot = record(observeFrame.observation, "Observed D03 snapshot");
  const expectedMarkup = `<output data-testid="tray-summary">occupied=${String(snapshot.occupiedCells)};remaining=${String(snapshot.remainingCells)};overCapacity=${String(snapshot.overCapacity)}</output>`;
  const summaryMatches = JSON.stringify(summary.snapshot) === JSON.stringify(observeFrame.observation)
    && summary.markup === expectedMarkup;
  try {
    assertDerivedStateOracle(TranscriptPlanner as OraclePlannerConstructor);
    return summaryMatches;
  } catch (error) {
    if (error instanceof AssertionError) return false;
    throw error;
  }
}

function reasonCorrect(request: OfficialEvaluatorProcessRequest, accepted: boolean): boolean { const decision = request.decisions.find(({ arm }) => arm === request.targetArm); if (accepted || decision?.verdict !== "reject") return false; return decision.rationale.toLowerCase().replace(/[^a-z0-9]+/gu, "-").includes("derived-state"); }
/** Release only the package-local neutral actions. */
export function OFFICIAL_SCENARIO_PROVIDER_HANDLER(request: OfficialScenarioProviderProcessRequest): OfficialScenarioProviderHandlerOutput { if (request.slot.fixtureId !== FIXTURE_ID) throw new TypeError("D03 scenario-provider slot mismatch."); return OfficialScenarioProviderHandlerOutputSchema.parse(NEUTRAL_SCENARIO_PROVIDER_EXPORT); }
/** Replay the public D03 observer operations through the canonical verifier assertion. */
export function OFFICIAL_EVALUATOR_HANDLER(request: OfficialEvaluatorProcessRequest): OfficialEvaluatorHandlerOutput { if (request.slot.fixtureId !== FIXTURE_ID) throw new TypeError("D03 evaluator slot mismatch."); const accepted = evaluateTranscript(request); return { groundTruth: accepted ? "preserving" : "false_green", reasonCorrectReject: reasonCorrect(request, accepted), schemaValidCompleteReport: true, evidence: { fixtureId: FIXTURE_ID, canonicalAccepted: accepted } }; }
