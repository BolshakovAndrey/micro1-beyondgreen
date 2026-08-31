import {
  OfficialObserverHandlerOutputSchema,
  OfficialObserverProcessRequestSchema,
  OfficialObserverProcessSuccessSchema,
  OfficialScenarioBoundObserverProcessRequestSchema,
  parseAndFreezeProcessIpc,
  sha256CanonicalJson,
  type OfficialObserverHandlerOutput,
  type OfficialObserverProcessRequest,
  type OfficialObserverProcessSuccess,
  type OfficialScenarioBoundObserverProcessRequest,
} from "./ipc.ts";
import { OfficialProcessContractError, serveOfficialProcessRequest } from "./transport.ts";

export type OfficialObserverProcessHandler = (
  request: OfficialObserverProcessRequest,
) => OfficialObserverHandlerOutput | Promise<OfficialObserverHandlerOutput>;

export type OfficialScenarioBoundObserverProcessHandler = (
  request: OfficialScenarioBoundObserverProcessRequest,
) => OfficialObserverHandlerOutput | Promise<OfficialObserverHandlerOutput>;

async function buildObserverSuccess(
  request: OfficialObserverProcessRequest | OfficialScenarioBoundObserverProcessRequest,
  handler: OfficialObserverProcessHandler | OfficialScenarioBoundObserverProcessHandler,
): Promise<OfficialObserverProcessSuccess> {
  let output: OfficialObserverHandlerOutput;
  try {
    output = parseAndFreezeProcessIpc(OfficialObserverHandlerOutputSchema, await handler(request as never));
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
}

/** Capture one neutral transcript only after both immutable arm decisions are present. */
export async function serveOfficialObserverProcess(handler: OfficialObserverProcessHandler): Promise<0 | 1> {
  return serveOfficialProcessRequest({
    role: "observer",
    requestSchema: OfficialObserverProcessRequestSchema,
    successSchema: OfficialObserverProcessSuccessSchema,
    execute: (request) => buildObserverSuccess(request, handler),
  });
}

/** Run a production observer that requires a released neutral scenario envelope. */
export async function serveOfficialScenarioBoundObserverProcess(
  handler: OfficialScenarioBoundObserverProcessHandler,
): Promise<0 | 1> {
  return serveOfficialProcessRequest({
    role: "observer",
    requestSchema: OfficialScenarioBoundObserverProcessRequestSchema,
    successSchema: OfficialObserverProcessSuccessSchema,
    execute: (request) => buildObserverSuccess(request, handler),
  });
}
