import type { RoleCapabilityPlan } from "../adapters/types.ts";
import { officialCandidate } from "../contracts.ts";
import type { OfficialExecutionSlot } from "../integration/execution-plan.ts";
import type { OfficialStaticPreflightResult } from "../integration/preflight.ts";
import type { CodexExecJsonlTransport } from "../runtime/arm-handler.ts";
import { createProductionProcessLauncher, type OsIsolationBackend } from "../runtime/process-launcher.ts";
import {
  createPublicBundleReader,
  createReasoningAwareRoleLauncher,
} from "../runtime/reasoning-aware-launcher.ts";
import {
  createOfficialProductionExecutionHooks,
  type OfficialProductionSlotBinding,
} from "./production-composition.ts";
import { createOfficialProductionRoleCapabilities } from "./production-registry.ts";

const ROLE_WORKER = Object.freeze({
  modulePath: "src/official/runtime/role-process-entrypoint.ts",
  exportName: "main",
  symbolKind: "runtime" as const,
});
const TRUSTED_RUNTIME_READS = Object.freeze([
  "src/official/runtime",
  "src/official/process",
  "node_modules",
  "package.json",
]);
const STANDARD_PROVIDER_EXPORT = "NEUTRAL_SCENARIO_PROVIDER_EXPORT";
const STANDARD_EVALUATOR_EXPORT = "OFFICIAL_EVALUATOR_HANDLER";

function unique(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)]);
}

function roleWorkerCapability(capability: RoleCapabilityPlan): RoleCapabilityPlan {
  return Object.freeze({
    ...capability,
    entrypoint: ROLE_WORKER,
    allowReadPaths: unique([...capability.allowReadPaths, ...TRUSTED_RUNTIME_READS]),
  });
}

function d01Capabilities(slot: OfficialExecutionSlot) {
  const candidatePath = slot.candidate.modulePath;
  const armVisibleRoot = "evaluation/arm-visible/BG-D01";
  const verifierRoot = "evaluation/verifier-only/BG-D01";
  const base = { fixtureId: "BG-D01" as const, candidateId: slot.candidateId, networkAllowed: false as const };
  const arm = roleWorkerCapability({
    ...base,
    role: "arm",
    entrypoint: ROLE_WORKER,
    allowReadPaths: [armVisibleRoot, candidatePath, "node_modules", "package.json"],
    denyReadPaths: [verifierRoot],
  });
  const observer = roleWorkerCapability({
    ...base,
    role: "observer",
    entrypoint: ROLE_WORKER,
    allowReadPaths: [armVisibleRoot, candidatePath, "node_modules", "package.json"],
    denyReadPaths: [verifierRoot],
  });
  const verifier = (role: "scenario-provider" | "evaluator") => roleWorkerCapability({
    ...base,
    role,
    entrypoint: ROLE_WORKER,
    allowReadPaths: [verifierRoot, "node_modules", "package.json"],
    denyReadPaths: [candidatePath, armVisibleRoot],
  });
  return Object.freeze({ arm, observer, scenarioProvider: verifier("scenario-provider"), evaluator: verifier("evaluator") });
}

/** Resolve all role capabilities and payload bindings without importing candidate or verifier modules. */
export function resolveOfficialProductionSlotBinding(slot: OfficialExecutionSlot): OfficialProductionSlotBinding {
  let arm: Readonly<Record<"status-quo" | "beyondgreen", RoleCapabilityPlan>>;
  let scenarioProvider: RoleCapabilityPlan;
  let observer: RoleCapabilityPlan;
  let evaluator: RoleCapabilityPlan;
  let mount: Readonly<{modulePath: string; exportName: string}> | null;
  if (slot.fixtureId === "BG-D01") {
    const capabilities = d01Capabilities(slot);
    arm = Object.freeze({ "status-quo": capabilities.arm, beyondgreen: capabilities.arm });
    scenarioProvider = capabilities.scenarioProvider;
    observer = capabilities.observer;
    evaluator = capabilities.evaluator;
    mount = Object.freeze({ modulePath: "evaluation/arm-visible/BG-D01/harness.ts", exportName: "mountMuseumBoard" });
  } else {
    const capabilities = createOfficialProductionRoleCapabilities(slot);
    const candidate = officialCandidate(capabilities.descriptor, slot.candidateId);
    arm = Object.freeze({
      "status-quo": roleWorkerCapability(capabilities.arm["status-quo"]),
      beyondgreen: roleWorkerCapability(capabilities.arm.beyondgreen),
    });
    scenarioProvider = roleWorkerCapability(capabilities.scenarioProvider);
    observer = roleWorkerCapability(capabilities.observer);
    evaluator = roleWorkerCapability(capabilities.evaluator);
    mount = candidate.construction.kind === "class_constructor"
      ? null
      : Object.freeze({
        modulePath: candidate.construction.binding.modulePath,
        exportName: candidate.construction.binding.exportName,
      });
  }
  const verifierModule = `evaluation/verifier-only/${slot.fixtureId}/official-runtime-exports.ts`;
  const neutralScenarioModule = `evaluation/verifier-only/${slot.fixtureId}/scenario-provider.ts`;
  return Object.freeze({
    arm,
    scenarioProvider,
    observer,
    evaluator,
    armPayload: (selectedArm) => selectedArm === "status-quo"
      ? Object.freeze({
        compilation: "passed",
        visibleTests: "passed",
        evidence: Object.freeze({ source: "frozen-preflight", candidateSha256: slot.candidate.sha256 }),
      })
      : Object.freeze({ source: "reasoning-aware-launcher" }),
    scenarioProviderPayload: () => Object.freeze({
      // Loading the neutral module directly prevents scenario release from importing
      // evaluator/oracle dependencies before the observer handoff exists.
      provider: Object.freeze({ modulePath: neutralScenarioModule, exportName: STANDARD_PROVIDER_EXPORT }),
    }),
    observerPayload: () => Object.freeze({
      candidate: Object.freeze({ modulePath: slot.candidate.modulePath, exportName: slot.candidate.exportName }),
      mount,
      summary: slot.fixtureId === "BG-D03"
        ? Object.freeze({ modulePath: slot.candidate.modulePath, exportName: "TrayPlannerSummary" })
        : null,
    }),
    evaluatorPayload: () => Object.freeze({
      evaluator: Object.freeze({ modulePath: verifierModule, exportName: STANDARD_EVALUATOR_EXPORT }),
    }),
  });
}

/** Create the complete production hook set without executing any candidate or model. */
export function createOfficialProductionRoot(input: Readonly<{
  repositoryRoot: string;
  workingDirectoryRoot: string;
  osBackend: OsIsolationBackend;
  reasoningTransport: CodexExecJsonlTransport;
  staticPreflight(repositoryRoot: string): OfficialStaticPreflightResult | Promise<OfficialStaticPreflightResult>;
  hashCandidate(slot: OfficialExecutionSlot): string | Promise<string>;
}>) {
  const isolatedLauncher = createProductionProcessLauncher({
    repositoryRoot: input.repositoryRoot,
    workingDirectoryRoot: input.workingDirectoryRoot,
    backend: input.osBackend,
  });
  const launcher = createReasoningAwareRoleLauncher({
    isolatedLauncher,
    transport: input.reasoningTransport,
    publicBundleReader: createPublicBundleReader(input.repositoryRoot),
  });
  return createOfficialProductionExecutionHooks({
    staticPreflight: input.staticPreflight,
    hashCandidate: input.hashCandidate,
    resolveSlot: resolveOfficialProductionSlotBinding,
    launcher,
  });
}
