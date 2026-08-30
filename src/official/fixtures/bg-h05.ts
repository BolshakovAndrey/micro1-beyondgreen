import { defineOfficialFixtureAdapter } from "../worker-contract.ts";

const contractModule = "evaluation/arm-visible/BG-H05/contract.ts";
const harnessModule = "evaluation/arm-visible/BG-H05/harness.ts";
const visibleAssertionsModule = "evaluation/arm-visible/BG-H05/visible-assertions.ts";

/** Static pre-unblinding adapter for the frozen BG-H05 external-store fixture. */
export const BG_H05_OFFICIAL_FIXTURE = defineOfficialFixtureAdapter({
  fixtureId: "BG-H05",
  membership: "held_out",
  behaviorClass: "external_store",
  candidates: ["candidate-a", "candidate-b"].map((candidateId) => ({
    candidateId,
    module: {
      modulePath: `candidates/BG-H05/${candidateId}/UnitReadout.ts`,
      exportName: "UnitReadout",
      symbolKind: "runtime",
    },
    construction: {
      kind: "mount_function",
      binding: {
        modulePath: harnessModule,
        exportName: "mountUnitStoreFixture",
        symbolKind: "runtime",
      },
      candidateArgument: "component_export",
    },
  })),
  armVisible: {
    rootPath: "evaluation/arm-visible/BG-H05",
    contracts: [{
      binding: { modulePath: contractModule, exportName: "UnitReadoutComponent", symbolKind: "type" },
      names: ["UnitReadoutComponent"],
    }],
    invariants: [{
      binding: { modulePath: contractModule, exportName: "SharedUnitStore", symbolKind: "runtime" },
      names: ["getSnapshot", "subscribe", "write", "subscriberCount", "notificationCounts"],
    }],
    actions: [{
      binding: { modulePath: harnessModule, exportName: "MountedUnitStoreFixture", symbolKind: "type" },
      names: ["toolbarWrite", "externalWrite", "unmountSouth", "remountSouth", "dispose"],
    }],
    observations: [{
      binding: { modulePath: contractModule, exportName: "UnitStoreObservation", symbolKind: "type" },
      names: ["store", "readouts", "subscribers", "notifications"],
    }],
    visibleAssertions: [{
      binding: { modulePath: visibleAssertionsModule, exportName: "VISIBLE_ASSERTIONS", symbolKind: "runtime" },
      names: ["BG-H05-VIS-001", "BG-H05-VIS-002", "BG-H05-VIS-003", "BG-H05-VIS-004"],
    }],
  },
  verifierOnlyRoot: "evaluation/verifier-only/BG-H05",
  observerEntrypoint: {
    modulePath: harnessModule,
    exportName: "mountUnitStoreFixture",
    symbolKind: "runtime",
  },
  evaluatorEntrypoint: {
    modulePath: "evaluation/verifier-only/BG-H05/canonical-driver.ts",
    exportName: "evaluateCanonicalObservations",
    symbolKind: "runtime",
  },
});
