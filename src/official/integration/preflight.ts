import { validateOfficialFrozenInventory } from "../inventory/index.ts";
import { createOfficialExecutionPlan, type OfficialExecutionPlan } from "./execution-plan.ts";

export type OfficialStaticPreflightResult = Readonly<{
  schemaVersion: "beyondgreen-official-static-preflight@1.0.0";
  inventorySha256: string;
  fixtureCount: 10;
  candidateCount: 20;
  executionPlan: OfficialExecutionPlan;
  candidateImportsPerformed: false;
  candidateExecutionPerformed: false;
  verifierContentParsed: false;
  officialOrScoredRun: false;
  unblindingPerformed: false;
  readyForSyntheticProcessRehearsal: true;
}>;

/** Validate frozen bytes and create a non-executable plan for the pre-official gate. */
export function runOfficialStaticPreflight(repositoryRoot: string): OfficialStaticPreflightResult {
  const inventory = validateOfficialFrozenInventory(repositoryRoot);
  const executionPlan = createOfficialExecutionPlan(inventory);
  return Object.freeze({
    schemaVersion: "beyondgreen-official-static-preflight@1.0.0",
    inventorySha256: inventory.inventorySha256,
    fixtureCount: 10,
    candidateCount: 20,
    executionPlan,
    candidateImportsPerformed: false,
    candidateExecutionPerformed: false,
    verifierContentParsed: false,
    officialOrScoredRun: false,
    unblindingPerformed: false,
    readyForSyntheticProcessRehearsal: true,
  });
}
