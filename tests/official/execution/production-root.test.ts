import assert from "node:assert/strict";
import test from "node:test";

import { resolveOfficialProductionSlotBinding } from "../../../src/official/execution/production-root.ts";
import { OfficialExecutionSlotSchema } from "../../../src/official/integration/execution-plan.ts";
import { sha256CanonicalJson } from "../../../src/official/process/ipc.ts";

function slot(fixtureId: "BG-D01" | "BG-D02", construction: "d01" | "d02") {
  return OfficialExecutionSlotSchema.parse({
    ordinal: 1,
    slotId: `${fixtureId}:candidate-a`,
    fixtureId,
    candidateId: "candidate-a",
    candidate: {
      modulePath: construction === "d01"
        ? "candidates/BG-D01/candidate-a/MuseumBoard.ts"
        : "candidates/BG-D02/candidate-a/ParcelDispatchBoard.ts",
      exportName: construction === "d01" ? "MuseumBoard" : "ParcelDispatchBoard",
      sha256: sha256CanonicalJson({ fixtureId }),
    },
    descriptor: { modulePath: "tests/official/test-descriptor.ts", exportName: "createTestOfficialDescriptor" },
    membership: "development",
    behaviorClass: "synthetic",
    arms: ["status-quo", "beyondgreen"],
    attemptOrdinal: 1,
    candidateExecutionAllowed: false,
    officialOrScoredRun: false,
  });
}

test("production root binds D01 and registry fixtures to one role worker without importing runtime modules", () => {
  for (const executionSlot of [slot("BG-D01", "d01"), slot("BG-D02", "d02")]) {
    const binding = resolveOfficialProductionSlotBinding(executionSlot);
    for (const capability of [
      binding.arm["status-quo"], binding.arm.beyondgreen,
      binding.scenarioProvider, binding.observer, binding.evaluator,
    ]) {
      assert.equal(capability.entrypoint.modulePath, "src/official/runtime/role-process-entrypoint.ts");
      assert.equal(capability.networkAllowed, false);
    }
    assert.match(JSON.stringify(binding.scenarioProviderPayload()), /OFFICIAL_SCENARIO_PROVIDER_HANDLER/u);
    assert.match(JSON.stringify(binding.evaluatorPayload("status-quo")), /OFFICIAL_EVALUATOR_HANDLER/u);
    assert.equal(JSON.stringify(binding.armPayload("beyondgreen")).includes("verifier"), false);
  }
});
