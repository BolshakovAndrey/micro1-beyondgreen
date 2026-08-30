import type { ExplicitExportBinding, OfficialFixtureDescriptor } from "../contracts.ts";
import { officialCandidate } from "../contracts.ts";
import type { OfficialRole, RoleCapabilityPlan } from "./types.ts";

function stableUnique(paths: readonly string[]): readonly string[] {
  const sorted = [...paths].sort((left, right) => left.localeCompare(right, "en"));
  if (new Set(sorted).size !== sorted.length) throw new Error("Role capability paths must be explicit and unique.");
  return Object.freeze(sorted);
}

/** Internal constructor used only by physically separate role factories. */
export function createRoleCapabilityPlan(input: Readonly<{
  descriptor: OfficialFixtureDescriptor;
  candidateId: string;
  role: OfficialRole;
  entrypoint: ExplicitExportBinding;
  allowReadPaths: readonly string[];
  denyReadPaths: readonly string[];
}>): RoleCapabilityPlan {
  officialCandidate(input.descriptor, input.candidateId);
  const allowReadPaths = stableUnique(input.allowReadPaths);
  const denyReadPaths = stableUnique(input.denyReadPaths);
  if (allowReadPaths.some((allowed) => denyReadPaths.includes(allowed))) {
    throw new Error("A role cannot both allow and deny the same explicit path.");
  }
  return Object.freeze({
    role: input.role,
    fixtureId: input.descriptor.fixtureId,
    candidateId: input.candidateId,
    entrypoint: input.entrypoint,
    allowReadPaths,
    denyReadPaths,
    networkAllowed: false,
  });
}
