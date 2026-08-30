#!/usr/bin/env node
/** Captures one post-decision D01 observation in a candidate-only worker process. */

import path from "node:path";
import { fileURLToPath } from "node:url";

import { executeFixtureEngineBinding } from "../src/d01/engine.ts";
import { runFixtureObservationWorker } from "../src/d01/worker-runtime.ts";
import type { ArmId, CandidateId } from "../src/d01/schemas.ts";

/**
 * Captures one of the two candidate observations used to detect nondeterminism.
 * The worker binds the arm, capture ordinal, candidate digest, and launch identity
 * into schema-validated process evidence while proving verifier access is denied.
 */
export { runFixtureObservationWorker } from "../src/d01/worker-runtime.ts";

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { D01_ENGINE } = await import("../src/d01/runtime.ts");
  const candidateId = executeFixtureEngineBinding(D01_ENGINE, {
    kind: "parse_candidate", value: process.argv[2],
  }) as CandidateId;
  const captureOrdinal = Number(process.argv[3]);
  if (captureOrdinal !== 1 && captureOrdinal !== 2) throw new Error("Observation capture ordinal must be one or two.");
  const arm = executeFixtureEngineBinding(D01_ENGINE, { kind: "parse_arm", value: process.argv[4] }) as ArmId;
  const launchBindingSha256 = process.argv[5];
  if (!launchBindingSha256) throw new Error("Observation worker launch binding is required.");
  runFixtureObservationWorker(
    D01_ENGINE, process.cwd(), candidateId, captureOrdinal, arm, launchBindingSha256,
  ).then(
    (result) => process.stdout.write(`${JSON.stringify(result)}\n`),
    () => {
      process.stderr.write("CANDIDATE_OBSERVER_WORKER_FAILED\n");
      process.exitCode = 1;
    },
  );
}
