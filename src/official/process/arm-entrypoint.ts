import {
  OfficialArmHandlerOutputSchema,
  OfficialArmProcessRequestSchema,
  OfficialArmProcessSuccessSchema,
  parseAndFreezeProcessIpc,
  sha256CanonicalJson,
  type OfficialArmHandlerOutput,
  type OfficialArmProcessRequest,
  type OfficialArmProcessSuccess,
} from "./ipc.ts";
import { OfficialProcessContractError, serveOfficialProcessRequest } from "./transport.ts";

export type OfficialArmProcessHandler = (
  request: OfficialArmProcessRequest,
) => OfficialArmHandlerOutput | Promise<OfficialArmHandlerOutput>;

/** Run exactly one arm decision request. Candidate loading remains composition-root owned. */
export async function serveOfficialArmProcess(handler: OfficialArmProcessHandler): Promise<0 | 1> {
  return serveOfficialProcessRequest({
    role: "arm",
    requestSchema: OfficialArmProcessRequestSchema,
    successSchema: OfficialArmProcessSuccessSchema,
    async execute(request): Promise<OfficialArmProcessSuccess> {
      let output: OfficialArmHandlerOutput;
      try {
        output = parseAndFreezeProcessIpc(OfficialArmHandlerOutputSchema, await handler(request));
      } catch (error) {
        if (error && typeof error === "object" && "name" in error && error.name === "ZodError") {
          throw new OfficialProcessContractError("OUTPUT_SCHEMA_FAILURE", "Arm handler output is invalid.");
        }
        throw error;
      }
      const evidenceSha256 = sha256CanonicalJson(output.evidence);
      const decisionCore = {
        schemaVersion: "beyondgreen-official-arm-decision@1.0.0" as const,
        slot: request.slot,
        arm: request.arm,
        verdict: output.verdict,
        rationale: output.rationale,
        inputSha256: request.inputSha256,
        evidenceSha256,
        immutable: true as const,
      };
      return {
        schemaVersion: "beyondgreen-official-arm-process-result@1.0.0",
        requestId: request.requestId,
        role: "arm",
        status: "ok",
        decision: {
          ...decisionCore,
          decisionSha256: sha256CanonicalJson(decisionCore),
        },
      };
    },
  });
}
