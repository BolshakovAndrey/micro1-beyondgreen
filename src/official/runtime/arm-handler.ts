import { z } from "zod";

import {
  OfficialArmHandlerOutputSchema,
  type OfficialArmHandlerOutput,
  type OfficialArmProcessRequest,
} from "../process/ipc.ts";
import type { OfficialArmProcessHandler } from "../process/arm-entrypoint.ts";
import { CodexExecCommandInputSchema } from "../reasoning/contract.ts";
import type { CodexExecParseResult } from "../reasoning/parser.ts";

const GateOutcomeSchema = z.enum(["passed", "failed", "inconclusive"]);
const StatusQuoPayloadSchema = z.object({
  compilation: GateOutcomeSchema,
  visibleTests: GateOutcomeSchema,
  evidence: z.json(),
}).strict();

/** One-call transport boundary; production CLI execution is injected elsewhere. */
export interface CodexExecJsonlTransport {
  invoke(input: Readonly<{
    request: OfficialArmProcessRequest;
    prompt: string;
    outputSchemaPath: string;
  }>): Promise<CodexExecParseResult<OfficialArmHandlerOutput>>;
}

/** Create the deterministic zero-reasoning status-quo policy. */
export function createStatusQuoArmHandler(): OfficialArmProcessHandler {
  return (request) => {
    if (request.arm !== "status-quo") throw new Error("Status-quo handler received the wrong arm.");
    const payload = StatusQuoPayloadSchema.parse(request.payload);
    const inconclusive = payload.compilation === "inconclusive" || payload.visibleTests === "inconclusive";
    const failed = payload.compilation === "failed" || payload.visibleTests === "failed";
    return Object.freeze({
      verdict: inconclusive ? "abstain" : failed ? "reject" : "accept",
      rationale: inconclusive
        ? "Compilation or visible-test evidence was operationally inconclusive."
        : failed
          ? "Compilation or visible legacy tests deterministically failed."
          : "Compilation and all visible legacy tests passed.",
      evidence: {
        compilation: payload.compilation,
        visibleTests: payload.visibleTests,
        visibleEvidence: payload.evidence,
        reasoningInvocationCount: 0,
        retryCount: 0,
      },
    });
  };
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
