import { defineOfficialFixtureAdapter } from "../worker-contract.ts";

const contractModule = "evaluation/arm-visible/BG-D02/contract.ts";
const harnessModule = "evaluation/arm-visible/BG-D02/harness.ts";

/** Static pre-unblinding bindings for the frozen BG-D02 fixture package. */
export const BG_D02_OFFICIAL_FIXTURE_ADAPTER = defineOfficialFixtureAdapter({
  fixtureId: "BG-D02",
  membership: "development",
  behaviorClass: "queued_batched_updates",
  candidates: [
    {
      candidateId: "candidate-a",
      module: {
        modulePath: "candidates/BG-D02/candidate-a/ParcelDispatchBoard.ts",
        exportName: "ParcelDispatchBoard",
        symbolKind: "runtime",
      },
      construction: {
        kind: "mount_function",
        binding: {
          modulePath: harnessModule,
          exportName: "mountParcelDispatchBoard",
          symbolKind: "runtime",
        },
        candidateArgument: "component_export",
      },
    },
    {
      candidateId: "candidate-b",
      module: {
        modulePath: "candidates/BG-D02/candidate-b/ParcelDispatchBoard.ts",
        exportName: "ParcelDispatchBoard",
        symbolKind: "runtime",
      },
      construction: {
        kind: "mount_function",
        binding: {
          modulePath: harnessModule,
          exportName: "mountParcelDispatchBoard",
          symbolKind: "runtime",
        },
        candidateArgument: "component_export",
      },
    },
  ],
  armVisible: {
    rootPath: "evaluation/arm-visible/BG-D02",
    contracts: [
      {
        binding: { modulePath: contractModule, exportName: "ParcelDispatchHandle", symbolKind: "type" },
        names: ["dispatch"],
      },
      {
        binding: { modulePath: contractModule, exportName: "ParcelDispatchComponent", symbolKind: "type" },
        names: ["component_export"],
      },
    ],
    invariants: [{
      binding: { modulePath: contractModule, exportName: "ARM_VISIBLE_INVARIANTS", symbolKind: "runtime" },
      names: ["BG-D02-INV-QUEUE-ACCUMULATION"],
    }],
    actions: [{
      binding: { modulePath: contractModule, exportName: "DispatchAction", symbolKind: "type" },
      names: ["select-all", "select-even", "set-unit", "queue", "flush", "reset"],
    }],
    observations: [{
      binding: { modulePath: contractModule, exportName: "DispatchObservation", symbolKind: "type" },
      names: ["laneIds", "pending", "dispatched", "selectedIds", "unit", "actionLog"],
    }],
    visibleAssertions: [{
      binding: {
        modulePath: "evaluation/arm-visible/BG-D02/visible-assertions.ts",
        exportName: "VISIBLE_ASSERTIONS",
        symbolKind: "runtime",
      },
      names: [
        "BG-D02-VIS-001",
        "BG-D02-VIS-002",
        "BG-D02-VIS-003",
        "BG-D02-VIS-004",
        "BG-D02-VIS-005",
      ],
    }],
  },
  verifierOnlyRoot: "evaluation/verifier-only/BG-D02",
  observerEntrypoint: {
    modulePath: harnessModule,
    exportName: "mountParcelDispatchBoard",
    symbolKind: "runtime",
  },
  evaluatorEntrypoint: {
    modulePath: "evaluation/verifier-only/BG-D02/canonical-driver.ts",
    exportName: "evaluateCanonicalObservations",
    symbolKind: "runtime",
  },
});
