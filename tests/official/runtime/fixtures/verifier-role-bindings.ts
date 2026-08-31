import type {
  OfficialEvaluatorProcessRequest,
  OfficialScenarioProviderProcessRequest,
} from "../../../../src/official/process/ipc.ts";

export function OFFICIAL_SCENARIO_PROVIDER_HANDLER(_request: OfficialScenarioProviderProcessRequest) {
  return Object.freeze({
    scenarioId: "synthetic:role-process",
    steps: Object.freeze([
      Object.freeze({ action: "observe", parameters: Object.freeze({}) }),
      Object.freeze({ action: "dispatch", parameters: Object.freeze({ value: Object.freeze({ amount: 2 }) }) }),
      Object.freeze({ action: "dispose", parameters: Object.freeze({}) }),
    ]),
  });
}

export function OFFICIAL_EVALUATOR_HANDLER(_request: OfficialEvaluatorProcessRequest) {
  return Object.freeze({
    groundTruth: "preserving" as const,
    reasonCorrectReject: false,
    schemaValidCompleteReport: true,
    evidence: Object.freeze({ syntheticOnly: true }),
  });
}
