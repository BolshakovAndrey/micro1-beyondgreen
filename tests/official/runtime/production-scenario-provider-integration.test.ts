import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { resolveOfficialProductionSlotBinding } from "../../../src/official/execution/production-root.ts";
import { runOfficialStaticPreflight } from "../../../src/official/integration/preflight.ts";
import {
  OfficialScenarioProviderProcessSuccessSchema,
  sha256CanonicalJson,
  type OfficialImmutableArmDecision,
} from "../../../src/official/process/ipc.ts";
import { createMacOsSandboxBackend } from "../../../src/official/runtime/macos-sandbox-backend.ts";
import { createProductionProcessLauncher } from "../../../src/official/runtime/process-launcher.ts";
import { toOfficialProcessSlot } from "../../../src/official/execution/contracts.ts";

function decision(
  slot: ReturnType<typeof toOfficialProcessSlot>,
  arm: "status-quo" | "beyondgreen",
): OfficialImmutableArmDecision {
  const core = {
    schemaVersion: "beyondgreen-official-arm-decision@1.0.0" as const,
    slot,
    arm,
    verdict: "accept" as const,
    rationale: "Synthetic provider-boundary decision.",
    inputSha256: slot.candidateSha256,
    evidenceSha256: sha256CanonicalJson({ slotId: slot.slotId, arm }),
    immutable: true as const,
  };
  return Object.freeze({ ...core, decisionSha256: sha256CanonicalJson(core) });
}

test("all ten production scenario providers load only their neutral module under exact verifier capabilities", {
  skip: process.platform !== "darwin",
}, async () => {
  const preflight = runOfficialStaticPreflight(process.cwd());
  const decisions = Object.freeze(preflight.executionPlan.slots.flatMap((slot) => {
    const processSlot = toOfficialProcessSlot(slot);
    return [decision(processSlot, "status-quo"), decision(processSlot, "beyondgreen")];
  }));
  const representativeSlots = preflight.executionPlan.slots.filter((slot, index, slots) => (
    slots.findIndex(({ fixtureId }) => fixtureId === slot.fixtureId) === index
  ));
  assert.equal(representativeSlots.length, 10);
  const work = await mkdtemp(path.join(process.cwd(), ".official-provider-integration-"));
  try {
    const launch = createProductionProcessLauncher({
      repositoryRoot: process.cwd(),
      workingDirectoryRoot: work,
      backend: createMacOsSandboxBackend(),
    });
    for (const slot of representativeSlots) {
      const binding = resolveOfficialProductionSlotBinding(slot);
      const processSlot = toOfficialProcessSlot(slot);
      const result = await launch({
        role: "scenario-provider",
        capability: binding.scenarioProvider,
        attemptOrdinal: 1,
        request: {
          schemaVersion: "beyondgreen-official-process-ipc@1.0.0",
          requestId: `scenario:test:${slot.fixtureId}`,
          evaluationVersion: "eval-v1.1.0",
          slot: processSlot,
          inputSha256: processSlot.candidateSha256,
          role: "scenario-provider",
          operation: "release_after_all_decisions",
          decisions,
          payload: binding.scenarioProviderPayload(),
        },
      });
      assert.equal(result.reasoningInvocationCount, 0);
      assert.equal(result.retryCount, 0);
      const response = OfficialScenarioProviderProcessSuccessSchema.parse(result.response);
      assert.equal(response.scenario.slot.fixtureId, slot.fixtureId);
      assert.equal(response.scenario.decisionSetSha256, sha256CanonicalJson(decisions));
    }
  } finally {
    await rm(work, { recursive: true, force: true });
  }
});
