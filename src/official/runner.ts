import type { OfficialFixtureDescriptor } from "./contracts.ts";
import { officialCandidate } from "./contracts.ts";
import { createArmAdapterPlan } from "./adapters/arm.ts";
import { createEvaluatorAdapterPlan } from "./adapters/evaluator.ts";
import { createObserverAdapterPlan } from "./adapters/observer.ts";
import type { RoleCapabilityPlan } from "./adapters/types.ts";

/** A safe plan proves role separation but cannot execute or consume an official attempt. */
export type PreUnblindingRunPlan = Readonly<{
  schemaVersion: "beyondgreen-official-pre-unblinding-plan@1.0.0";
  fixtureId: OfficialFixtureDescriptor["fixtureId"];
  candidateId: string;
  candidateModulePath: string;
  constructionKind: "mount_function" | "class_constructor";
  roles: Readonly<{
    arm: RoleCapabilityPlan;
    observer: RoleCapabilityPlan;
    evaluator: RoleCapabilityPlan;
  }>;
  officialOrScoredRun: false;
  candidateExecutionAllowed: false;
  unblindingPerformed: false;
  runRecordCreated: false;
}>;

/** Build role-scoped infrastructure only; this function deliberately has no executor. */
export function createPreUnblindingRunPlan(
  descriptor: OfficialFixtureDescriptor,
  candidateId: string,
): PreUnblindingRunPlan {
  const candidate = officialCandidate(descriptor, candidateId);
  return Object.freeze({
    schemaVersion: "beyondgreen-official-pre-unblinding-plan@1.0.0",
    fixtureId: descriptor.fixtureId,
    candidateId,
    candidateModulePath: candidate.module.modulePath,
    constructionKind: candidate.construction.kind,
    roles: Object.freeze({
      arm: createArmAdapterPlan(descriptor, candidateId),
      observer: createObserverAdapterPlan(descriptor, candidateId),
      evaluator: createEvaluatorAdapterPlan(descriptor, candidateId),
    }),
    officialOrScoredRun: false,
    candidateExecutionAllowed: false,
    unblindingPerformed: false,
    runRecordCreated: false,
  });
}
