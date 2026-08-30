import { readFileSync } from "node:fs";

import { z } from "zod";

import { serveOfficialObserverProcess } from "../../../../src/official/process/observer-entrypoint.ts";

const PayloadSchema = z.object({
  frames: z.array(z.json()).min(1),
  boundaryProbePath: z.string().min(1),
}).strict();

process.exitCode = await serveOfficialObserverProcess((request) => {
  const payload = PayloadSchema.parse(request.payload);
  let boundaryDenied = false;
  try {
    readFileSync(payload.boundaryProbePath);
  } catch (error) {
    boundaryDenied = error !== null && typeof error === "object" && "code" in error
      && error.code === "ERR_ACCESS_DENIED";
  }
  if (!boundaryDenied) throw new Error("Synthetic observer boundary probe was unexpectedly readable.");
  const decision = request.decisions.find(({ arm }) => arm === request.targetArm)!;
  return {
    transcript: {
      observedAfterDecisionSha256: decision.decisionSha256,
      frames: payload.frames,
      boundaryDenied,
      syntheticOnly: true,
    },
  };
});
