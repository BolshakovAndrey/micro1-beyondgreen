import { createArmAdapterPlan } from "../adapters/arm.ts";
import { createEvaluatorAdapterPlan } from "../adapters/evaluator.ts";
import { createObserverAdapterPlan } from "../adapters/observer.ts";
import { createScenarioProviderAdapterPlan } from "../adapters/scenario-provider.ts";
import type { RoleCapabilityPlan } from "../adapters/types.ts";
import type { OfficialFixtureDescriptor } from "../contracts.ts";
import { BG_D02_OFFICIAL_FIXTURE_ADAPTER } from "../fixtures/bg-d02.ts";
import { BG_D03_OFFICIAL_ADAPTER } from "../fixtures/bg-d03.ts";
import { BG_D04_OFFICIAL_FIXTURE_ADAPTER } from "../fixtures/bg-d04.ts";
import { BG_H01_OFFICIAL_FIXTURE } from "../fixtures/bg-h01.ts";
import { BG_H02_OFFICIAL_FIXTURE } from "../fixtures/bg-h02.ts";
import { BG_H03_OFFICIAL_FIXTURE } from "../fixtures/bg-h03.ts";
import { BG_H04_OFFICIAL_FIXTURE } from "../fixtures/bg-h04.ts";
import { BG_H05_OFFICIAL_FIXTURE } from "../fixtures/bg-h05.ts";
import { BG_H06_OFFICIAL_FIXTURE } from "../fixtures/bg-h06.ts";
import type { OfficialExecutionSlot } from "../integration/execution-plan.ts";

const PRODUCTION_DESCRIPTORS = Object.freeze([
  BG_D02_OFFICIAL_FIXTURE_ADAPTER,
  BG_D03_OFFICIAL_ADAPTER,
  BG_D04_OFFICIAL_FIXTURE_ADAPTER,
  BG_H01_OFFICIAL_FIXTURE,
  BG_H02_OFFICIAL_FIXTURE,
  BG_H03_OFFICIAL_FIXTURE,
  BG_H04_OFFICIAL_FIXTURE,
  BG_H05_OFFICIAL_FIXTURE,
  BG_H06_OFFICIAL_FIXTURE,
] as const);

const DESCRIPTOR_BY_FIXTURE = new Map<string, OfficialFixtureDescriptor>(
  PRODUCTION_DESCRIPTORS.map((descriptor) => [descriptor.fixtureId, descriptor]),
);

export type OfficialProductionRoleCapabilities = Readonly<{
  descriptor: OfficialFixtureDescriptor;
  arm: Readonly<Record<"status-quo" | "beyondgreen", RoleCapabilityPlan>>;
  scenarioProvider: RoleCapabilityPlan;
  observer: RoleCapabilityPlan;
  evaluator: RoleCapabilityPlan;
}>;

/** Return the nine frozen non-D01 descriptors without importing candidates or verifier modules. */
export function officialProductionDescriptors(): readonly OfficialFixtureDescriptor[] {
  return PRODUCTION_DESCRIPTORS;
}

/**
 * Resolve one slot to four disjoint role capabilities. D01 remains on its proven
 * dedicated runtime and must be supplied by the final composition root.
 */
export function createOfficialProductionRoleCapabilities(
  slot: OfficialExecutionSlot,
): OfficialProductionRoleCapabilities {
  const descriptor = DESCRIPTOR_BY_FIXTURE.get(slot.fixtureId);
  if (!descriptor) throw new Error(`No non-D01 production descriptor for ${slot.fixtureId}.`);
  if (!descriptor.candidates.some(({ candidateId }) => candidateId === slot.candidateId)) {
    throw new Error(`Unknown production candidate ${slot.slotId}.`);
  }
  const arm = createArmAdapterPlan(descriptor, slot.candidateId);
  return Object.freeze({
    descriptor,
    arm: Object.freeze({ "status-quo": arm, beyondgreen: arm }),
    scenarioProvider: createScenarioProviderAdapterPlan(
      descriptor,
      slot.candidateId,
      descriptor.scenarioProviderEntrypoint,
    ),
    observer: createObserverAdapterPlan(descriptor, slot.candidateId),
    evaluator: createEvaluatorAdapterPlan(descriptor, slot.candidateId),
  });
}
