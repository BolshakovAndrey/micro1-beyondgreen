import type { ExplicitExportBinding, OfficialFixtureDescriptor } from "../contracts.ts";

/** The three process roles whose filesystem capabilities remain physically disjoint. */
export type OfficialRole = "arm" | "scenario-provider" | "observer" | "evaluator";

/** Immutable launch plan consumed by a future process runner, never by fixture inference. */
export type RoleCapabilityPlan = Readonly<{
  role: OfficialRole;
  fixtureId: OfficialFixtureDescriptor["fixtureId"] | "BG-D01";
  candidateId: string;
  entrypoint: ExplicitExportBinding;
  allowReadPaths: readonly string[];
  denyReadPaths: readonly string[];
  networkAllowed: false;
}>;

/** Factory contract kept separate for each role-specific adapter module. */
export type RoleAdapterFactory = (
  descriptor: OfficialFixtureDescriptor,
  candidateId: string,
) => RoleCapabilityPlan;
