import { defineOfficialFixtureAdapter } from "../worker-contract.ts";

const contractModule = "evaluation/arm-visible/BG-D04/contract.ts";
const harnessModule = "evaluation/arm-visible/BG-D04/harness.ts";

/** Static pre-unblinding bindings for the frozen BG-D04 fixture package. */
export const BG_D04_OFFICIAL_FIXTURE_ADAPTER = defineOfficialFixtureAdapter({
  fixtureId: "BG-D04",
  membership: "development",
  behaviorClass: "subscription_cleanup",
  candidates: [
    {
      candidateId: "preserving",
      module: {
        modulePath: "candidates/BG-D04/preserving/BulletinPanel.ts",
        exportName: "BulletinPanel",
        symbolKind: "runtime",
      },
      construction: {
        kind: "mount_function",
        binding: {
          modulePath: harnessModule,
          exportName: "mountBulletinPanel",
          symbolKind: "runtime",
        },
        candidateArgument: "component_export",
      },
    },
    {
      candidateId: "false-green",
      module: {
        modulePath: "candidates/BG-D04/false-green/BulletinPanel.ts",
        exportName: "BulletinPanel",
        symbolKind: "runtime",
      },
      construction: {
        kind: "mount_function",
        binding: {
          modulePath: harnessModule,
          exportName: "mountBulletinPanel",
          symbolKind: "runtime",
        },
        candidateArgument: "component_export",
      },
    },
  ],
  armVisible: {
    rootPath: "evaluation/arm-visible/BG-D04",
    contracts: [
      {
        binding: { modulePath: contractModule, exportName: "BulletinPanelHandle", symbolKind: "type" },
        names: ["dispatch"],
      },
      {
        binding: { modulePath: contractModule, exportName: "SyntheticBulletinSource", symbolKind: "runtime" },
        names: ["subscribe", "publish", "counts", "resetForFixture"],
      },
    ],
    invariants: [{
      binding: { modulePath: contractModule, exportName: "BulletinObservation", symbolKind: "type" },
      names: [
        "selected-channel-domain",
        "new-channel-clears-bulletin",
        "single-selected-channel-subscription",
        "selected-channel-only-delivery",
        "switch-cleans-obsolete-subscription",
        "unmount-cleans-all-subscriptions",
      ],
    }],
    actions: [{
      binding: { modulePath: contractModule, exportName: "BulletinAction", symbolKind: "type" },
      names: ["switch", "publish", "reset"],
    }],
    observations: [{
      binding: { modulePath: contractModule, exportName: "BulletinObservation", symbolKind: "type" },
      names: ["selectedChannel", "bulletin", "subscribers"],
    }],
    visibleAssertions: [{
      binding: {
        modulePath: "evaluation/arm-visible/BG-D04/visible-assertions.ts",
        exportName: "VISIBLE_ASSERTIONS",
        symbolKind: "runtime",
      },
      names: ["BG-D04-VIS-001", "BG-D04-VIS-002", "BG-D04-VIS-003", "BG-D04-VIS-004"],
    }],
  },
  verifierOnlyRoot: "evaluation/verifier-only/BG-D04",
  observerEntrypoint: {
    modulePath: harnessModule,
    exportName: "mountBulletinPanel",
    symbolKind: "runtime",
  },
  evaluatorEntrypoint: {
    modulePath: "evaluation/verifier-only/BG-D04/canonical-driver.ts",
    exportName: "evaluateCanonicalObservations",
    symbolKind: "runtime",
  },
});
