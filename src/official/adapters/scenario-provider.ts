import type { ExplicitExportBinding, OfficialFixtureDescriptor } from "../contracts.ts";
import { officialCandidate } from "../contracts.ts";
import { createRoleCapabilityPlan } from "./shared.ts";
import type { RoleCapabilityPlan } from "./types.ts";

/**
 * Create the post-decision scenario-provider capability. It may read verifier-owned
 * scenario material but can never read candidate or arm-visible bytes.
 */
export function createScenarioProviderAdapterPlan(
  descriptor: OfficialFixtureDescriptor,
  candidateId: string,
  entrypoint: ExplicitExportBinding,
): RoleCapabilityPlan {
  const candidate = officialCandidate(descriptor, candidateId);
  return createRoleCapabilityPlan({
    descriptor,
    candidateId,
    role: "scenario-provider",
    entrypoint,
    allowReadPaths: [
      descriptor.verifierOnlyRoot,
      entrypoint.modulePath,
      "node_modules",
      "package.json",
    ],
    denyReadPaths: [candidate.module.modulePath, descriptor.armVisible.rootPath],
  });
}
