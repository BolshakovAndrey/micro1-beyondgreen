import {
  defineOfficialFixtureDescriptor,
  type OfficialFixtureDescriptor,
} from "./contracts.ts";

/** Frozen interface and ownership rules for the SES-018 fixture-adapter workers. */
export const OFFICIAL_FIXTURE_WORKER_CONTRACT = Object.freeze({
  schemaVersion: "beyondgreen-official-fixture-worker@1.0.0",
  descriptorFactory: "defineOfficialFixtureAdapter",
  requiredBindings: Object.freeze([
    "candidate.module",
    "candidate.construction",
    "armVisible.contracts",
    "armVisible.invariants",
    "armVisible.actions",
    "armVisible.observations",
    "armVisible.visibleAssertions",
    "observerEntrypoint",
    "evaluatorEntrypoint",
  ]),
  constructionKinds: Object.freeze(["mount_function", "class_constructor"] as const),
  sharedPathsMutableByWorkers: false,
  candidateExecutionAllowed: false,
  officialOrScoredRunAllowed: false,
  unblindingAllowed: false,
} as const);

/** Validate one fixture-only adapter against the coordinator-frozen descriptor API. */
export function defineOfficialFixtureAdapter(input: unknown): OfficialFixtureDescriptor {
  return defineOfficialFixtureDescriptor(input);
}
