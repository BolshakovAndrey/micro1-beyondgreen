import {
  OfficialEvaluatorHandlerOutputSchema,
  OfficialEvaluatorProcessRequestSchema,
  OfficialEvaluatorProcessSuccessSchema,
  parseAndFreezeProcessIpc,
  sha256CanonicalJson,
  type OfficialEvaluatorHandlerOutput,
  type OfficialEvaluatorProcessRequest,
  type OfficialEvaluatorProcessSuccess,
} from "./ipc.ts";
import { OfficialProcessContractError, serveOfficialProcessRequest } from "./transport.ts";

export type OfficialEvaluatorProcessHandler = (
  request: OfficialEvaluatorProcessRequest,
) => OfficialEvaluatorHandlerOutput | Promise<OfficialEvaluatorHandlerOutput>;

/** Score a captured transcript without changing the already immutable arm verdict. */
export async function serveOfficialEvaluatorProcess(handler: OfficialEvaluatorProcessHandler): Promise<0 | 1> {
  return serveOfficialProcessRequest({
    role: "evaluator",
    requestSchema: OfficialEvaluatorProcessRequestSchema,
    successSchema: OfficialEvaluatorProcessSuccessSchema,
    async execute(request): Promise<OfficialEvaluatorProcessSuccess> {
      let output: OfficialEvaluatorHandlerOutput;
      try {
        output = parseAndFreezeProcessIpc(OfficialEvaluatorHandlerOutputSchema, await handler(request));
      } catch (error) {
        if (error && typeof error === "object" && "name" in error && error.name === "ZodError") {
          throw new OfficialProcessContractError("OUTPUT_SCHEMA_FAILURE", "Evaluator handler output is invalid.");
        }
        throw error;
      }
      const decision = request.decisions.find(({ arm }) => arm === request.targetArm);
      if (!decision) {
        throw new OfficialProcessContractError("REQUEST_BINDING_FAILURE", "Target arm decision is absent.");
      }
      return {
        schemaVersion: "beyondgreen-official-evaluator-process-result@1.0.0",
        requestId: request.requestId,
        role: "evaluator",
        status: "ok",
        decisionSha256: decision.decisionSha256,
        captureSha256: request.capture.captureSha256,
        record: {
          evaluationVersion: request.evaluationVersion,
          fixtureId: request.slot.fixtureId,
          candidateId: request.slot.candidateId,
          arm: request.targetArm,
          verdict: decision.verdict,
          groundTruth: output.groundTruth,
          reasonCorrectReject: output.reasonCorrectReject,
          schemaValidCompleteReport: output.schemaValidCompleteReport,
        },
        evaluatorEvidenceSha256: sha256CanonicalJson(output.evidence),
        immutable: true,
      };
    },
  });
}
