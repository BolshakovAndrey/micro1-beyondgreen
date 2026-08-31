import {
  OfficialArmHandlerOutputSchema,
  type OfficialArmHandlerOutput,
  type OfficialArmProcessRequest,
} from "../process/ipc.ts";
import { CodexExecCommandInputSchema } from "../reasoning/contract.ts";
import type { CodexExecParseResult } from "../reasoning/parser.ts";
import type { OfficialArmProcessHandler } from "../process/arm-entrypoint.ts";

export { createStatusQuoArmHandler } from "./status-quo-arm-handler.ts";

/** One-call transport boundary; production CLI execution is injected elsewhere. */
export interface CodexExecJsonlTransport {
  invoke(input: Readonly<{
    request: OfficialArmProcessRequest;
    prompt: string;
    outputSchemaPath: string;
  }>): Promise<CodexExecParseResult<OfficialArmHandlerOutput>>;
}

/** Create the BeyondGreen handler with exactly one injected Codex JSONL call and no retry. */
export function createBeyondGreenArmHandler(transport: CodexExecJsonlTransport): OfficialArmProcessHandler {
  let consumed = false;
  return async (request) => {
    if (request.arm !== "beyondgreen") throw new Error("BeyondGreen handler received the wrong arm.");
    if (consumed) throw new Error("BeyondGreen reasoning transport is single-use.");
    consumed = true;
    const payload = CodexExecCommandInputSchema.parse(request.payload);
    const result = await transport.invoke({ request, prompt: payload.prompt, outputSchemaPath: payload.outputSchemaPath });
    if (!result.ok) {
      return Object.freeze({
        verdict: "abstain",
        rationale: "The reasoning transport failed operationally; no retry or substitute is permitted.",
        evidence: {
          failureCode: result.failure.code,
          invocationCount: result.failure.invocationCount,
          retryAllowed: result.failure.retryAllowed,
          substituteModelAllowed: result.failure.substituteModelAllowed,
        },
      });
    }
    if (result.invocationCount !== 1 || result.retryCount !== 0) {
      throw new Error("BeyondGreen transport violated the one-call zero-retry policy.");
    }
    return Object.freeze(OfficialArmHandlerOutputSchema.parse(result.output));
  };
}
