import assert from "node:assert/strict";
import test from "node:test";

import {
  createOfficialProductionRoleCapabilities,
  officialProductionDescriptors,
} from "../../../src/official/execution/production-registry.ts";
import type { OfficialExecutionSlot } from "../../../src/official/integration/execution-plan.ts";

const candidateIds = new Map<string, readonly string[]>([
  ["BG-D02", ["candidate-a", "candidate-b"]],
  ["BG-D03", ["candidate-a", "candidate-b"]],
  ["BG-D04", ["preserving", "false-green"]],
  ...["BG-H01", "BG-H02", "BG-H03", "BG-H04", "BG-H05", "BG-H06"]
    .map((fixtureId) => [fixtureId, ["candidate-a", "candidate-b"]] as const),
]);

function slot(fixtureId: string, candidateId: string, ordinal: number): OfficialExecutionSlot {
  return {
    ordinal,
    slotId: `${fixtureId}:${candidateId}`,
    fixtureId: fixtureId as OfficialExecutionSlot["fixtureId"],
    candidateId,
    candidate: { modulePath: `candidates/${fixtureId}/${candidateId}/candidate.ts`, exportName: "Candidate", sha256: "a".repeat(64) },
    descriptor: { modulePath: `src/official/fixtures/${fixtureId.toLowerCase()}.ts`, exportName: "DESCRIPTOR" },
    membership: fixtureId.startsWith("BG-H") ? "held_out" : "development",
    behaviorClass: "synthetic",
    arms: ["status-quo", "beyondgreen"],
    attemptOrdinal: 1,
    candidateExecutionAllowed: false,
    officialOrScoredRun: false,
  };
}

test("nine production descriptors bind one explicit neutral scenario provider each", () => {
  const descriptors = officialProductionDescriptors();
  assert.equal(descriptors.length, 9);
  assert.equal(new Set(descriptors.map(({ fixtureId }) => fixtureId)).size, 9);
  for (const descriptor of descriptors) {
    assert.equal(descriptor.scenarioProviderEntrypoint.modulePath, `evaluation/verifier-only/${descriptor.fixtureId}/scenario-provider.ts`);
    assert.equal(descriptor.scenarioProviderEntrypoint.exportName, "NEUTRAL_SCENARIO_PROVIDER_EXPORT");
    assert.equal(descriptor.scenarioProviderEntrypoint.symbolKind, "runtime");
  }
});

test("eighteen non-D01 slots resolve four mutually restricted role capabilities", () => {
  let ordinal = 1;
  for (const descriptor of officialProductionDescriptors()) {
    for (const candidateId of candidateIds.get(descriptor.fixtureId) ?? []) {
      const capabilities = createOfficialProductionRoleCapabilities(slot(descriptor.fixtureId, candidateId, ordinal++));
      assert.equal(capabilities.scenarioProvider.entrypoint, descriptor.scenarioProviderEntrypoint);
      assert.ok(capabilities.arm["status-quo"].denyReadPaths.includes(descriptor.verifierOnlyRoot));
      assert.ok(capabilities.observer.denyReadPaths.includes(descriptor.verifierOnlyRoot));
      assert.ok(capabilities.scenarioProvider.denyReadPaths.some((path) => path.startsWith("candidates/")));
      assert.ok(capabilities.evaluator.denyReadPaths.some((path) => path.startsWith("candidates/")));
      assert.equal(capabilities.scenarioProvider.networkAllowed, false);
    }
  }
  assert.equal(ordinal, 19);
});

test("D01 cannot silently fall through the non-D01 production registry", () => {
  assert.throws(
    () => createOfficialProductionRoleCapabilities(slot("BG-D01", "candidate-a", 1)),
    /No non-D01 production descriptor/,
  );
});
