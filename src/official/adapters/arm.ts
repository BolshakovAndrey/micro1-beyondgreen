import { officialCandidate } from "../contracts.ts";
import { createRoleCapabilityPlan } from "./shared.ts";
import type { RoleAdapterFactory } from "./types.ts";

/** Create the oracle-free arm plan from explicit descriptor paths only. */
export const createArmAdapterPlan: RoleAdapterFactory = (descriptor, candidateId) => {
  const candidate = officialCandidate(descriptor, candidateId);
  const distinctConstructionPaths = candidate.construction.binding.modulePath === candidate.module.modulePath
    ? []
    : [candidate.construction.binding.modulePath];
  const externalEvaluatorEntrypoint = descriptor.evaluatorEntrypoint.modulePath.startsWith(`${descriptor.verifierOnlyRoot}/`)
    ? []
    : [descriptor.evaluatorEntrypoint.modulePath];
  return createRoleCapabilityPlan({
    descriptor,
    candidateId,
    role: "arm",
    entrypoint: candidate.construction.binding,
    allowReadPaths: [
      descriptor.armVisible.rootPath,
      candidate.module.modulePath,
      ...distinctConstructionPaths,
      "node_modules",
      "package.json",
    ],
    denyReadPaths: [descriptor.verifierOnlyRoot, ...externalEvaluatorEntrypoint],
  });
};
