import { officialCandidate } from "../contracts.ts";
import { createRoleCapabilityPlan } from "./shared.ts";
import type { RoleAdapterFactory } from "./types.ts";

/** Create a post-decision observer plan that still has no verifier capability. */
export const createObserverAdapterPlan: RoleAdapterFactory = (descriptor, candidateId) => {
  const candidate = officialCandidate(descriptor, candidateId);
  const externalEvaluatorEntrypoint = descriptor.evaluatorEntrypoint.modulePath.startsWith(`${descriptor.verifierOnlyRoot}/`)
    ? []
    : [descriptor.evaluatorEntrypoint.modulePath];
  return createRoleCapabilityPlan({
    descriptor,
    candidateId,
    role: "observer",
    entrypoint: descriptor.observerEntrypoint,
    allowReadPaths: [
      descriptor.armVisible.rootPath,
      candidate.module.modulePath,
      descriptor.observerEntrypoint.modulePath,
      "node_modules",
      "package.json",
    ],
    denyReadPaths: [descriptor.verifierOnlyRoot, ...externalEvaluatorEntrypoint],
  });
};
