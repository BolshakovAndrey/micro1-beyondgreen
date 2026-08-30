import { officialCandidate } from "../contracts.ts";
import { createRoleCapabilityPlan } from "./shared.ts";
import type { RoleAdapterFactory } from "./types.ts";

/** Create the post-decision evaluator plan without candidate or arm-visible reads. */
export const createEvaluatorAdapterPlan: RoleAdapterFactory = (descriptor, candidateId) => {
  const candidate = officialCandidate(descriptor, candidateId);
  const externalObserverEntrypoint = descriptor.observerEntrypoint.modulePath.startsWith(`${descriptor.armVisible.rootPath}/`)
    ? []
    : [descriptor.observerEntrypoint.modulePath];
  return createRoleCapabilityPlan({
    descriptor,
    candidateId,
    role: "evaluator",
    entrypoint: descriptor.evaluatorEntrypoint,
    allowReadPaths: [
      descriptor.verifierOnlyRoot,
      descriptor.evaluatorEntrypoint.modulePath,
      "node_modules",
      "package.json",
    ],
    denyReadPaths: [candidate.module.modulePath, descriptor.armVisible.rootPath, ...externalObserverEntrypoint],
  });
};
