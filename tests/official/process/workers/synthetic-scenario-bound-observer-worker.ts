import { readFileSync } from "node:fs";

import { z } from "zod";

import { serveOfficialScenarioBoundObserverProcess } from "../../../../src/official/process/observer-entrypoint.ts";

const PayloadSchema = z.object({
  allowedCandidatePath: z.string().min(1),
  boundaryProbePath: z.string().min(1),
}).strict();

process.exitCode = await serveOfficialScenarioBoundObserverProcess((request) => {
  const payload = PayloadSchema.parse(request.payload);
  const candidateBytes = readFileSync(payload.allowedCandidatePath, "utf8");
  if (candidateBytes.length === 0) throw new Error("Synthetic candidate fixture is unexpectedly empty.");
  let verifierReadDenied = false;
  try {
    readFileSync(payload.boundaryProbePath);
  } catch (error) {
    verifierReadDenied = error !== null && typeof error === "object" && "code" in error
      && error.code === "ERR_ACCESS_DENIED";
  }
  if (!verifierReadDenied) throw new Error("Synthetic observer unexpectedly read verifier bytes.");
  return {
    transcript: {
      scenarioSha256: request.scenario.scenarioSha256,
      actions: request.scenario.steps,
      verifierReadDenied,
      syntheticOnly: true,
    },
  };
});
