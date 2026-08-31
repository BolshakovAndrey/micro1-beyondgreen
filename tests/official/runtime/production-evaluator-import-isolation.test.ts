import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { resolveOfficialProductionSlotBinding } from "../../../src/official/execution/production-root.ts";
import { toOfficialProcessSlot } from "../../../src/official/execution/contracts.ts";
import { OfficialExecutionSlotSchema, type OfficialExecutionSlot } from "../../../src/official/integration/execution-plan.ts";
import { OFFICIAL_FROZEN_INVENTORY_BINDINGS } from "../../../src/official/inventory/registry.ts";
import {
  OfficialEvaluatorProcessSuccessSchema,
  OfficialObserverCaptureSchema,
  sha256CanonicalJson,
  type OfficialImmutableArmDecision,
} from "../../../src/official/process/ipc.ts";
import { createMacOsSandboxBackend } from "../../../src/official/runtime/macos-sandbox-backend.ts";
import { createProductionProcessLauncher } from "../../../src/official/runtime/process-launcher.ts";

function representativeSlots(): readonly OfficialExecutionSlot[] {
  return OFFICIAL_FROZEN_INVENTORY_BINDINGS
    .filter(({ fixtureId }) => fixtureId !== "BG-D03")
    .map((fixture, index) => {
      const candidate = fixture.candidates[0]!;
      return OfficialExecutionSlotSchema.parse({
        ordinal: index + 1,
        slotId: `${fixture.fixtureId}:${candidate.candidateId}`,
        fixtureId: fixture.fixtureId,
        candidateId: candidate.candidateId,
        candidate: {
          modulePath: candidate.modulePath,
          exportName: candidate.exportName,
          sha256: sha256CanonicalJson(candidate),
        },
        descriptor: fixture.descriptor,
        membership: fixture.membership,
        behaviorClass: fixture.behaviorClass,
        arms: ["status-quo", "beyondgreen"],
        attemptOrdinal: 1,
        candidateExecutionAllowed: false,
        officialOrScoredRun: false,
      });
    });
}

function decision(
  slot: ReturnType<typeof toOfficialProcessSlot>,
  arm: "status-quo" | "beyondgreen",
): OfficialImmutableArmDecision {
  const core = {
    schemaVersion: "beyondgreen-official-arm-decision@1.0.0" as const,
    slot,
    arm,
    verdict: "accept" as const,
    rationale: "Synthetic physical evaluator import regression.",
    inputSha256: slot.candidateSha256,
    evidenceSha256: sha256CanonicalJson({ slotId: slot.slotId, arm }),
    immutable: true as const,
  };
  return Object.freeze({ ...core, decisionSha256: sha256CanonicalJson(core) });
}

function syntheticCapture(
  slot: ReturnType<typeof toOfficialProcessSlot>,
  selectedDecision: OfficialImmutableArmDecision,
) {
  const transcript = slot.fixtureId === "BG-D04" || slot.fixtureId === "BG-H04"
    ? { fixtureId: slot.fixtureId, frames: [{ operation: "observe", observation: {} }], disposal: { observation: {} } }
    : { fixtureId: slot.fixtureId, frames: [{ operation: "observe", observation: {} }] };
  const core = {
    schemaVersion: "beyondgreen-official-observer-capture@1.0.0" as const,
    slot,
    arm: selectedDecision.arm,
    decisionSha256: selectedDecision.decisionSha256,
    transcript,
    transcriptSha256: sha256CanonicalJson(transcript),
    immutable: true as const,
  };
  return OfficialObserverCaptureSchema.parse({
    ...core,
    captureSha256: sha256CanonicalJson(core),
  });
}

test("nine affected production evaluators load under exact physical deny rules", {
  skip: process.platform !== "darwin",
}, async () => {
  const work = await mkdtemp(path.join(process.cwd(), ".official-evaluator-import-"));
  try {
    const launch = createProductionProcessLauncher({
      repositoryRoot: process.cwd(),
      workingDirectoryRoot: work,
      backend: createMacOsSandboxBackend(),
    });
    for (const executionSlot of representativeSlots()) {
      const slot = toOfficialProcessSlot(executionSlot);
      const decisions = Object.freeze([
        decision(slot, "status-quo"),
        decision(slot, "beyondgreen"),
      ]) as readonly [OfficialImmutableArmDecision, OfficialImmutableArmDecision];
      const capture = syntheticCapture(slot, decisions[0]);
      const binding = resolveOfficialProductionSlotBinding(executionSlot);
      const result = await launch({
        role: "evaluator",
        capability: binding.evaluator,
        attemptOrdinal: 1,
        request: {
          schemaVersion: "beyondgreen-official-process-ipc@1.0.0",
          requestId: `evaluator:test:${slot.fixtureId}`,
          evaluationVersion: "eval-v1.1.0",
          slot,
          inputSha256: slot.candidateSha256,
          role: "evaluator",
          operation: "evaluate_after_capture",
          targetArm: "status-quo",
          decisions,
          capture,
          payload: binding.evaluatorPayload("status-quo"),
        },
      });
      assert.equal(result.reasoningInvocationCount, 0);
      assert.equal(result.retryCount, 0);
      const response = OfficialEvaluatorProcessSuccessSchema.parse(result.response);
      assert.equal(response.record.fixtureId, slot.fixtureId);
      assert.equal(response.record.arm, "status-quo");
    }
  } finally {
    await rm(work, { recursive: true, force: true });
  }
});
