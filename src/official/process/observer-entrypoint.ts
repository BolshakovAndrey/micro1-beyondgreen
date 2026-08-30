import {
  OfficialObserverHandlerOutputSchema,
  OfficialObserverProcessRequestSchema,
  OfficialObserverProcessSuccessSchema,
  parseAndFreezeProcessIpc,
  sha256CanonicalJson,
  type OfficialObserverHandlerOutput,
  type OfficialObserverProcessRequest,
  type OfficialObserverProcessSuccess,
} from "./ipc.ts";
import { OfficialProcessContractError, serveOfficialProcessRequest } from "./transport.ts";

export type OfficialObserverProcessHandler = (
  request: OfficialObserverProcessRequest,
) => OfficialObserverHandlerOutput | Promise<OfficialObserverHandlerOutput>;

/** Capture one neutral transcript only after both immutable arm decisions are present. */
export async function serveOfficialObserverProcess(handler: OfficialObserverProcessHandler): Promise<0 | 1> {
  return serveOfficialProcessRequest({
    role: "observer",
    requestSchema: OfficialObserverProcessRequestSchema,
    successSchema: OfficialObserverProcessSuccessSchema,
    async execute(request): Promise<OfficialObserverProcessSuccess> {
      let output: OfficialObserverHandlerOutput;
      try {
        output = parseAndFreezeProcessIpc(OfficialObserverHandlerOutputSchema, await handler(request));
      } catch (error) {
        if (error && typeof error === "object" && "name" in error && error.name === "ZodError") {
          throw new OfficialProcessContractError("OUTPUT_SCHEMA_FAILURE", "Observer handler output is invalid.");
        }
        throw error;
      }
      const decision = request.decisions.find(({ arm }) => arm === request.targetArm);
      if (!decision) {
        throw new OfficialProcessContractError("REQUEST_BINDING_FAILURE", "Target arm decision is absent.");
      }
      const captureCore = {
        schemaVersion: "beyondgreen-official-observer-capture@1.0.0" as const,
        slot: request.slot,
        arm: request.targetArm,
        decisionSha256: decision.decisionSha256,
        transcript: output.transcript,
        transcriptSha256: sha256CanonicalJson(output.transcript),
        immutable: true as const,
      };
      return {
        schemaVersion: "beyondgreen-official-observer-process-result@1.0.0",
        requestId: request.requestId,
        role: "observer",
        status: "ok",
        capture: {
          ...captureCore,
          captureSha256: sha256CanonicalJson(captureCore),
        },
      };
    },
  });
}
