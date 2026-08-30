#!/usr/bin/env node
/** Adapts the bounded arm-worker command line to the injected D01 runtime engine. */

import path from "node:path";
import { fileURLToPath } from "node:url";

import { executeFixtureEngineBinding } from "../src/d01/engine.ts";
import { runFixtureArmWorker } from "../src/d01/worker-runtime.ts";
import type { ArmId, CandidateId } from "../src/d01/schemas.ts";

/**
 * Runs one isolated comparison-arm execution against an immutable candidate.
 * The worker validates the arm-visible package, proves verifier access is denied,
 * and returns launch-bound evidence; only the BeyondGreen arm may add risk-directed
 * probes and deterministic replay evidence.
 */
export { runFixtureArmWorker } from "../src/d01/worker-runtime.ts";

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { D01_ENGINE } = await import("../src/d01/runtime.ts");
  const arm = executeFixtureEngineBinding(D01_ENGINE, { kind: "parse_arm", value: process.argv[2] }) as ArmId;
  const candidateId = executeFixtureEngineBinding(D01_ENGINE, {
    kind: "parse_candidate", value: process.argv[3],
  }) as CandidateId;
  const launchBindingSha256 = process.argv[4];
  if (!launchBindingSha256) throw new Error("Arm worker launch binding is required.");
  runFixtureArmWorker(D01_ENGINE, process.cwd(), arm, candidateId, launchBindingSha256).then(
    (result) => process.stdout.write(`${JSON.stringify(result)}\n`),
    () => {
      process.stderr.write("ARM_WORKER_FAILED\n");
      process.exitCode = 1;
    },
  );
}
