import { readFileSync } from "node:fs";

import { z } from "zod";

import { serveOfficialArmProcess } from "../../../../src/official/process/arm-entrypoint.ts";

const PayloadSchema = z.object({
  verdict: z.enum(["accept", "reject", "abstain"]),
  rationale: z.string().min(1),
  boundaryProbePath: z.string().min(1),
}).strict();

process.exitCode = await serveOfficialArmProcess((request) => {
  const payload = PayloadSchema.parse(request.payload);
  let boundaryDenied = false;
  try {
    readFileSync(payload.boundaryProbePath);
  } catch (error) {
    boundaryDenied = error !== null && typeof error === "object" && "code" in error
      && error.code === "ERR_ACCESS_DENIED";
  }
  if (!boundaryDenied) throw new Error("Synthetic arm boundary probe was unexpectedly readable.");
  return {
    verdict: payload.verdict,
    rationale: payload.rationale,
    evidence: { boundaryDenied, syntheticOnly: true },
  };
});
