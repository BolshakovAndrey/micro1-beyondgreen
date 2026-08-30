#!/usr/bin/env node

import { runOfficialStaticPreflight } from "../src/official/integration/preflight.ts";

/** Run the bounded static official preflight without importing candidates or scoring. */
export function main(repositoryRoot = process.cwd()): number {
  const result = runOfficialStaticPreflight(repositoryRoot);
  process.stdout.write(`${JSON.stringify({
    status: "OFFICIAL_STATIC_PREFLIGHT_PASSED",
    schemaVersion: result.schemaVersion,
    inventorySha256: result.inventorySha256,
    fixtureCount: result.fixtureCount,
    candidateCount: result.candidateCount,
    executionSlotCount: result.executionPlan.slotCount,
    totalArmPlans: result.executionPlan.totalArmPlans,
    candidateExecutionPerformed: result.candidateExecutionPerformed,
    officialOrScoredRun: result.officialOrScoredRun,
    unblindingPerformed: result.unblindingPerformed,
  })}\n`);
  return 0;
}

try {
  process.exitCode = main();
}
catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`OFFICIAL_STATIC_PREFLIGHT_FAILED ${message}\n`);
  process.exitCode = 1;
}
