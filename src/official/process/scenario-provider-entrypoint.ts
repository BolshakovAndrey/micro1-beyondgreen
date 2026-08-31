import {
  OfficialScenarioProviderHandlerOutputSchema,
  OfficialScenarioProviderProcessRequestSchema,
  OfficialScenarioProviderProcessSuccessSchema,
  parseAndFreezeProcessIpc,
  sha256CanonicalJson,
  type OfficialScenarioProviderHandlerOutput,
  type OfficialScenarioProviderProcessRequest,
  type OfficialScenarioProviderProcessSuccess,
} from "./ipc.ts";
import { OfficialProcessContractError, serveOfficialProcessRequest } from "./transport.ts";

export type OfficialScenarioProviderHandler = (
  request: OfficialScenarioProviderProcessRequest,
) => OfficialScenarioProviderHandlerOutput | Promise<OfficialScenarioProviderHandlerOutput>;

/** Release only neutral actions after the complete immutable decision set exists. */
export async function serveOfficialScenarioProviderProcess(
  handler: OfficialScenarioProviderHandler,
): Promise<0 | 1> {
  return serveOfficialProcessRequest({
    role: "scenario-provider",
    requestSchema: OfficialScenarioProviderProcessRequestSchema,
    successSchema: OfficialScenarioProviderProcessSuccessSchema,
    async execute(request): Promise<OfficialScenarioProviderProcessSuccess> {
      let output: OfficialScenarioProviderHandlerOutput;
      try {
        output = parseAndFreezeProcessIpc(OfficialScenarioProviderHandlerOutputSchema, await handler(request));
      } catch (error) {
        if (error && typeof error === "object" && "name" in error && error.name === "ZodError") {
          throw new OfficialProcessContractError("OUTPUT_SCHEMA_FAILURE", "Scenario-provider output is invalid.");
        }
        throw error;
      }
      const decisionSetSha256 = sha256CanonicalJson(request.decisions);
      const core = {
        schemaVersion: "beyondgreen-official-neutral-scenario@1.0.0" as const,
        slot: request.slot,
        scenarioId: output.scenarioId,
        decisionSetSha256,
        steps: output.steps,
        immutable: true as const,
      };
      return {
        schemaVersion: "beyondgreen-official-scenario-provider-result@1.0.0",
        requestId: request.requestId,
        role: "scenario-provider",
        status: "ok",
        scenario: {
          ...core,
          scenarioSha256: sha256CanonicalJson(core),
        },
      };
    },
  });
}
