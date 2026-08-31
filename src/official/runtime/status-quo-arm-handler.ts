import { z } from "zod";

import type { OfficialArmProcessHandler } from "../process/arm-entrypoint.ts";

const GateOutcomeSchema = z.enum(["passed", "failed", "inconclusive"]);
const StatusQuoPayloadSchema = z.object({
  compilation: GateOutcomeSchema,
  visibleTests: GateOutcomeSchema,
  evidence: z.json(),
}).strict();

/** Create the deterministic zero-reasoning status-quo policy without loading reasoning modules. */
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
