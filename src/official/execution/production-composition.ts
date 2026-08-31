import type { OfficialExecutionSlot } from "../integration/execution-plan.ts";
import type { OfficialStaticPreflightResult } from "../integration/preflight.ts";
import {
  OfficialArmProcessSuccessSchema,
  OfficialEvaluatorProcessSuccessSchema,
  OfficialProcessFailureSchema,
  OfficialScenarioProviderProcessSuccessSchema,
  OfficialScenarioBoundObserverProcessRequestSchema,
  OfficialObserverProcessSuccessSchema,
  parseAndFreezeProcessIpc,
  sha256CanonicalJson,
  type OfficialNeutralScenarioEnvelope,
} from "../process/ipc.ts";
import type { RoleCapabilityPlan } from "../adapters/types.ts";
import type { OfficialExecutionHooks } from "./coordinator.ts";

type Arm = "status-quo" | "beyondgreen";
type Role = "arm" | "scenario-provider" | "observer" | "evaluator";
type JsonValue = null | boolean | number | string | readonly JsonValue[] | Readonly<{[key: string]: JsonValue}>;

export type OfficialRoleLaunchResult = Readonly<{
  response: unknown;
  reasoningInvocationCount: 0 | 1;
  retryCount: 0;
}>;

export type OfficialRoleProcessLauncher = (input: Readonly<{
  role: Role;
  capability: RoleCapabilityPlan;
  request: unknown;
  attemptOrdinal: 1;
}>) => OfficialRoleLaunchResult | Promise<OfficialRoleLaunchResult>;

export type OfficialProductionSlotBinding = Readonly<{
  arm: Readonly<Record<Arm, RoleCapabilityPlan>>;
  scenarioProvider: RoleCapabilityPlan;
  observer: RoleCapabilityPlan;
  evaluator: RoleCapabilityPlan;
  armPayload(arm: Arm): JsonValue;
  scenarioProviderPayload(): JsonValue;
  observerPayload(arm: Arm, scenario: OfficialNeutralScenarioEnvelope): JsonValue;
  evaluatorPayload(arm: Arm): JsonValue;
}>;

export type OfficialProductionCompositionInput = Readonly<{
  staticPreflight(repositoryRoot: string): OfficialStaticPreflightResult | Promise<OfficialStaticPreflightResult>;
  hashCandidate(slot: OfficialExecutionSlot): string | Promise<string>;
  resolveSlot(slot: OfficialExecutionSlot): OfficialProductionSlotBinding;
  launcher: OfficialRoleProcessLauncher;
}>;

function requestBase(slot: Parameters<OfficialExecutionHooks["executeArm"]>[0]["processSlot"], requestId: string) {
  return {
    schemaVersion: "beyondgreen-official-process-ipc@1.0.0" as const,
    requestId,
    evaluationVersion: "eval-v1.1.0" as const,
    slot,
    inputSha256: slot.candidateSha256,
  };
}

function assertCapability(
  capability: RoleCapabilityPlan,
  role: Role,
  slot: Parameters<OfficialExecutionHooks["executeArm"]>[0]["processSlot"],
): void {
  if (capability.role !== role || capability.fixtureId !== slot.fixtureId
    || capability.candidateId !== slot.candidateId || capability.networkAllowed !== false) {
    throw new Error("Production role capability is not bound to the requested slot and role.");
  }
  if ((role === "arm" || role === "observer")
    && !capability.denyReadPaths.some((entry) => entry.includes("verifier-only"))) {
    throw new Error("Arm and observer capabilities must explicitly deny verifier-only paths.");
  }
  if ((role === "scenario-provider" || role === "evaluator")
    && !capability.denyReadPaths.some((entry) => entry.includes("candidates/"))) {
    throw new Error("Scenario-provider and evaluator capabilities must explicitly deny candidate paths.");
  }
}

function requireSuccess<Output>(input: Readonly<{
  response: unknown;
  schema: { parse(value: unknown): Output };
  role: Exclude<Role, "arm">;
}>): Output {
  const failure = OfficialProcessFailureSchema.safeParse(input.response);
  if (failure.success) {
    throw new Error(`${input.role.toUpperCase()}_PROCESS_FAILURE:${failure.data.errorCode}`);
  }
  return input.schema.parse(input.response);
}

/**
 * Bind the SES-020 coordinator to role-scoped child-process launches. The factory
 * owns no fixture semantics and cannot execute until every explicit slot binding is
 * supplied by a separately reviewed composition registry.
 */
export function createOfficialProductionExecutionHooks(
  input: OfficialProductionCompositionInput,
): OfficialExecutionHooks {
  let postDecisionStageOpen = false;
  return {
    staticPreflight: input.staticPreflight,
    hashCandidate: input.hashCandidate,
    async executeArm({ slot, processSlot, arm, inputSha256, attemptOrdinal }) {
      const binding = input.resolveSlot(slot);
      const capability = binding.arm[arm];
      assertCapability(capability, "arm", processSlot);
      const launch = await input.launcher({
        role: "arm",
        capability,
        attemptOrdinal,
        request: {
          ...requestBase(processSlot, `arm:${processSlot.slotId}:${arm}`),
          role: "arm",
          operation: "decide",
          arm,
          attemptOrdinal,
          payload: binding.armPayload(arm),
        },
      });
      if (launch.retryCount !== 0 || launch.reasoningInvocationCount !== (arm === "status-quo" ? 0 : 1)) {
        throw new Error("Production arm launch violates the frozen invocation or retry policy.");
      }
      const failure = OfficialProcessFailureSchema.safeParse(launch.response);
      if (failure.success) {
        const core = {
          schemaVersion: "beyondgreen-official-arm-decision@1.0.0" as const,
          slot: processSlot,
          arm,
          verdict: "abstain" as const,
          rationale: "The isolated arm process failed operationally; no retry is permitted.",
          inputSha256,
          evidenceSha256: sha256CanonicalJson({ errorCode: failure.data.errorCode, retryAllowed: false }),
          immutable: true as const,
        };
        return {
          decision: { ...core, decisionSha256: sha256CanonicalJson(core) },
          reasoningInvocationCount: launch.reasoningInvocationCount,
          retryCount: 0,
        };
      }
      return {
        decision: OfficialArmProcessSuccessSchema.parse(launch.response).decision,
        reasoningInvocationCount: launch.reasoningInvocationCount,
        retryCount: 0,
      };
    },
    beginPostDecisionEvaluation({ decisions, pairs, syntheticOnly }) {
      if (decisions.length !== 40 || pairs.length !== 0 || decisions.some(({ immutable }) => !immutable)) {
        throw new Error("Post-decision stage requires all 40 immutable decisions and no observations.");
      }
      postDecisionStageOpen = true;
      return { unblindingPerformed: !syntheticOnly };
    },
    async releaseNeutralScenario({ executionSlot, slot, decisions }) {
      if (!postDecisionStageOpen || decisions.length !== 40) {
        throw new Error("Scenario release is forbidden before all immutable decisions.");
      }
      const binding = input.resolveSlot(executionSlot);
      assertCapability(binding.scenarioProvider, "scenario-provider", slot);
      const launch = await input.launcher({
        role: "scenario-provider",
        capability: binding.scenarioProvider,
        attemptOrdinal: 1,
        request: {
          ...requestBase(slot, `scenario:${slot.slotId}`),
          role: "scenario-provider",
          operation: "release_after_all_decisions",
          decisions,
          payload: binding.scenarioProviderPayload(),
        },
      });
      if (launch.reasoningInvocationCount !== 0 || launch.retryCount !== 0) {
        throw new Error("Scenario provider cannot invoke reasoning or retry.");
      }
      return requireSuccess({
        response: launch.response,
        schema: OfficialScenarioProviderProcessSuccessSchema,
        role: "scenario-provider",
      }).scenario;
    },
    async captureObservation({ executionSlot, slot, arm, decisions, scenario, captureOrdinal }) {
      const binding = input.resolveSlot(executionSlot);
      assertCapability(binding.observer, "observer", slot);
      const request = parseAndFreezeProcessIpc(OfficialScenarioBoundObserverProcessRequestSchema, {
        ...requestBase(slot, `observer:${slot.slotId}:${arm}:${captureOrdinal}`),
        role: "observer",
        operation: "capture_after_decisions",
        targetArm: arm,
        decisions,
        scenario,
        payload: binding.observerPayload(arm, scenario),
      });
      const launch = await input.launcher({
        role: "observer",
        capability: binding.observer,
        attemptOrdinal: 1,
        request,
      });
      if (launch.reasoningInvocationCount !== 0 || launch.retryCount !== 0) {
        throw new Error("Observer cannot invoke reasoning or retry.");
      }
      return requireSuccess({ response: launch.response, schema: OfficialObserverProcessSuccessSchema, role: "observer" }).capture;
    },
    async evaluate({ executionSlot, slot, arm, decisions, observationPair }) {
      const binding = input.resolveSlot(executionSlot);
      assertCapability(binding.evaluator, "evaluator", slot);
      const launch = await input.launcher({
        role: "evaluator",
        capability: binding.evaluator,
        attemptOrdinal: 1,
        request: {
          ...requestBase(slot, `evaluator:${slot.slotId}:${arm}`),
          role: "evaluator",
          operation: "evaluate_after_capture",
          targetArm: arm,
          decisions,
          capture: observationPair.captures[0],
          payload: binding.evaluatorPayload(arm),
        },
      });
      if (launch.reasoningInvocationCount !== 0 || launch.retryCount !== 0) {
        throw new Error("Evaluator cannot invoke reasoning or retry.");
      }
      return requireSuccess({
        response: launch.response,
        schema: OfficialEvaluatorProcessSuccessSchema,
        role: "evaluator",
      }).record;
    },
  };
}
