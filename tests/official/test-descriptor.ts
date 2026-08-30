import { defineOfficialFixtureDescriptor } from "../../src/official/contracts.ts";

const contractModule = "tests/official/fixtures/arm-visible/contract.mjs";

/** Synthetic descriptor that cannot expose or execute a real evaluation candidate. */
export function createTestOfficialDescriptor() {
  return defineOfficialFixtureDescriptor({
    fixtureId: "BG-D02",
    membership: "development",
    behaviorClass: "queued_batched_updates",
    candidates: ["candidate-a", "candidate-b"].map((candidateId) => ({
      candidateId,
      module: {
        modulePath: `tests/official/fixtures/candidates/${candidateId}.mjs`,
        exportName: "TestCandidate",
        symbolKind: "runtime",
      },
      construction: {
        kind: "mount_function",
        binding: {
          modulePath: "tests/official/fixtures/arm-visible/mount.mjs",
          exportName: "mountTestCandidate",
          symbolKind: "runtime",
        },
        candidateArgument: "component_export",
      },
    })),
    armVisible: {
      rootPath: "tests/official/fixtures/arm-visible",
      contracts: [{ binding: { modulePath: contractModule, exportName: "TEST_CONTRACT", symbolKind: "runtime" }, names: ["TEST-CONTRACT"] }],
      invariants: [{ binding: { modulePath: contractModule, exportName: "TEST_INVARIANTS", symbolKind: "runtime" }, names: ["TEST-INVARIANT"] }],
      actions: [{ binding: { modulePath: contractModule, exportName: "TEST_ACTIONS", symbolKind: "runtime" }, names: ["observe"] }],
      observations: [{ binding: { modulePath: contractModule, exportName: "TEST_OBSERVATIONS", symbolKind: "runtime" }, names: ["snapshot"] }],
      visibleAssertions: [{ binding: { modulePath: contractModule, exportName: "TEST_VISIBLE_ASSERTIONS", symbolKind: "runtime" }, names: ["TEST-VIS-001"] }],
    },
    verifierOnlyRoot: "tests/official/fixtures/verifier-only",
    observerEntrypoint: {
      modulePath: "tests/official/fixtures/arm-visible/observer.mjs",
      exportName: "observeTestCandidate",
      symbolKind: "runtime",
    },
    evaluatorEntrypoint: {
      modulePath: "tests/official/fixtures/verifier-only/evaluator.mjs",
      exportName: "evaluateTestObservations",
      symbolKind: "runtime",
    },
  });
}
