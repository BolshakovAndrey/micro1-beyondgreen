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
  const transcript = slot.fixtureId === "BG-H03"
    ? h03SyntheticTranscript()
    : slot.fixtureId === "BG-H05"
      ? h05SyntheticTranscript()
      : slot.fixtureId === "BG-D04" || slot.fixtureId === "BG-H04"
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

function h03SyntheticTranscript() {
  const observation = (
    selectedId: "herbs" | "flowers",
    label: "Herb collection" | "Flower collection",
    searchNote: string,
    previewAttachmentCount: number,
    actionLog: readonly string[],
    selectionHandleReferenceOrdinal: number,
  ) => ({
    selectedId,
    selectionHandle: { id: selectedId, label },
    searchNote,
    previewAttachmentCount,
    actionLog,
    selectionHandleReferenceOrdinal,
  });
  return {
    fixtureId: "BG-H03",
    frames: [
      { operation: "observe", observation: observation("herbs", "Herb collection", "", 1, ["mount"], 1) },
      { operation: "dispatch", observation: observation("herbs", "Herb collection", "spring", 1, ["mount", "note-spring"], 1) },
      { operation: "dispatch", observation: observation("herbs", "Herb collection", "summer", 1, ["mount", "note-spring", "note-summer"], 1) },
      { operation: "dispatch", observation: observation("flowers", "Flower collection", "summer", 2, ["mount", "note-spring", "note-summer", "select-flowers"], 2) },
      { operation: "dispatch", observation: observation("flowers", "Flower collection", "autumn", 2, ["mount", "note-spring", "note-summer", "select-flowers", "note-autumn"], 2) },
      { operation: "dispatch", observation: observation("flowers", "Flower collection", "autumn", 2, ["mount", "note-spring", "note-summer", "select-flowers", "note-autumn", "select-flowers"], 2) },
      { operation: "dispatch", observation: observation("herbs", "Herb collection", "autumn", 3, ["mount", "note-spring", "note-summer", "select-flowers", "note-autumn", "select-flowers", "select-herbs"], 3) },
      { operation: "dispatch", observation: observation("herbs", "Herb collection", "", 3, ["mount", "note-spring", "note-summer", "select-flowers", "note-autumn", "select-flowers", "select-herbs", "reset"], 3) },
    ],
  };
}

function h05SyntheticTranscript() {
  const snapshot = (unit: "metric" | "imperial", revision: number) => ({ unit, revision });
  const observation = (
    store: Readonly<{ unit: "metric" | "imperial"; revision: number }>,
    north: Readonly<{ unit: "metric" | "imperial"; revision: number }>,
    south: Readonly<{ unit: "metric" | "imperial"; revision: number }>,
    subscribers: number,
    notifications: Readonly<{ north: number; south: number }>,
    storeSnapshotReferenceOrdinal: number,
  ) => ({ store, readouts: { north, south }, subscribers, notifications, storeSnapshotReferenceOrdinal });
  const metric0 = snapshot("metric", 0);
  const imperial1 = snapshot("imperial", 1);
  const metric2 = snapshot("metric", 2);
  const imperial3 = snapshot("imperial", 3);
  const terminal = observation(imperial3, imperial3, imperial3, 0, { north: 3, south: 2 }, 4);
  return {
    fixtureId: "BG-H05",
    frames: [
      { operation: "observe", observation: observation(metric0, metric0, metric0, 2, { north: 0, south: 0 }, 1) },
      { operation: "toolbarWrite", observation: observation(imperial1, imperial1, imperial1, 2, { north: 1, south: 1 }, 2) },
      { operation: "externalWrite", observation: observation(metric2, metric2, metric2, 2, { north: 2, south: 2 }, 3) },
      { operation: "unmountSouth", observation: observation(metric2, metric2, metric2, 1, { north: 2, south: 2 }, 3) },
      { operation: "externalWrite", observation: observation(imperial3, imperial3, metric2, 1, { north: 3, south: 2 }, 4) },
      { operation: "remountSouth", observation: observation(imperial3, imperial3, imperial3, 2, { north: 3, south: 2 }, 4) },
      { operation: "externalWrite", observation: observation(imperial3, imperial3, imperial3, 2, { north: 3, south: 2 }, 4) },
      { operation: "dispose", observation: terminal },
    ],
    disposal: { called: true, observation: terminal },
  };
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
