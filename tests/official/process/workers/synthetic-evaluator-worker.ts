import { readFileSync } from "node:fs";

import { z } from "zod";

import { serveOfficialEvaluatorProcess } from "../../../../src/official/process/evaluator-entrypoint.ts";

const PayloadSchema = z.object({
  groundTruth: z.enum(["preserving", "false_green"]),
  reasonCorrectReject: z.boolean(),
  schemaValidCompleteReport: z.boolean(),
  boundaryProbePath: z.string().min(1),
}).strict();

process.exitCode = await serveOfficialEvaluatorProcess((request) => {
  const payload = PayloadSchema.parse(request.payload);
  let boundaryDenied = false;
  try {
    readFileSync(payload.boundaryProbePath);
  } catch (error) {
    boundaryDenied = error !== null && typeof error === "object" && "code" in error
      && error.code === "ERR_ACCESS_DENIED";
  }
  if (!boundaryDenied) throw new Error("Synthetic evaluator boundary probe was unexpectedly readable.");
  return {
    groundTruth: payload.groundTruth,
    reasonCorrectReject: payload.reasonCorrectReject,
    schemaValidCompleteReport: payload.schemaValidCompleteReport,
    evidence: {
      boundaryDenied,
      transcriptSha256: request.capture.transcriptSha256,
      syntheticOnly: true,
    },
  };
});
