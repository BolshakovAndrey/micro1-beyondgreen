import { readFileSync } from "node:fs";

import { z } from "zod";

import { serveOfficialScenarioProviderProcess } from "../../../../src/official/process/scenario-provider-entrypoint.ts";

process.exitCode = await serveOfficialScenarioProviderProcess((request) => {
  const payload = z.object({
    allowedVerifierPath: z.string().min(1),
    boundaryProbePath: z.string().min(1),
  }).strict().parse(request.payload);
  const verifierBytes = readFileSync(payload.allowedVerifierPath, "utf8");
  if (verifierBytes.length === 0) throw new Error("Synthetic verifier fixture is unexpectedly empty.");
  let candidateReadDenied = false;
  try {
    readFileSync(payload.boundaryProbePath);
  } catch (error) {
    candidateReadDenied = error !== null && typeof error === "object" && "code" in error
      && error.code === "ERR_ACCESS_DENIED";
  }
  if (!candidateReadDenied) throw new Error("Synthetic scenario provider unexpectedly read candidate bytes.");
  return {
    scenarioId: `scenario:${request.slot.fixtureId}`,
    steps: [{ action: "synthetic-action", parameters: { fixtureId: request.slot.fixtureId } }],
  };
});
