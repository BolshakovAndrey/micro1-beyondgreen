import { defineOfficialFixtureAdapter } from "../worker-contract.ts";

const contractModule = "evaluation/arm-visible/BG-H04/contract.ts";
const harnessModule = "evaluation/arm-visible/BG-H04/harness.ts";
const visibleAssertionsModule = "evaluation/arm-visible/BG-H04/visible-assertions.ts";

/** Static pre-unblinding adapter for the frozen BG-H04 conditional-lifecycle fixture. */
export const BG_H04_OFFICIAL_FIXTURE = defineOfficialFixtureAdapter({
  fixtureId: "BG-H04",
  membership: "held_out",
  behaviorClass: "conditional_lifecycle",
  candidates: ["candidate-a", "candidate-b"].map((candidateId) => ({
    candidateId,
    module: {
      modulePath: `candidates/BG-H04/${candidateId}/AstronomyChecklist.ts`,
      exportName: "AstronomyChecklist",
      symbolKind: "runtime",
    },
    construction: {
      kind: "mount_function",
      binding: {
        modulePath: harnessModule,
        exportName: "mountAstronomyDrawer",
        symbolKind: "runtime",
      },
      candidateArgument: "component_export",
    },
  })),
  armVisible: {
    rootPath: "evaluation/arm-visible/BG-H04",
    contracts: [{
      binding: { modulePath: contractModule, exportName: "AstronomyDrawerComponent", symbolKind: "type" },
      names: ["AstronomyDrawerComponent"],
    }],
    invariants: [{
      binding: { modulePath: contractModule, exportName: "ARM_VISIBLE_INVARIANTS", symbolKind: "runtime" },
      names: ["BG-H04-INV-CONDITIONAL-LIFECYCLE"],
    }],
    actions: [{
      binding: { modulePath: contractModule, exportName: "DrawerAction", symbolKind: "type" },
      names: ["activate", "deactivate", "edit-draft", "set-source-note"],
    }],
    observations: [{
      binding: { modulePath: contractModule, exportName: "DrawerObservation", symbolKind: "type" },
      names: [
        "stationId", "sourceNote", "active", "drawerPresent", "drawerVisible", "generation",
        "draft", "mountCount", "cleanupCount", "activeRegistrationCount", "actionLog",
      ],
    }],
    visibleAssertions: [{
      binding: { modulePath: visibleAssertionsModule, exportName: "VISIBLE_ASSERTIONS", symbolKind: "runtime" },
      names: ["BG-H04-VIS-001", "BG-H04-VIS-002", "BG-H04-VIS-003", "BG-H04-VIS-004"],
    }],
  },
  verifierOnlyRoot: "evaluation/verifier-only/BG-H04",
  observerEntrypoint: {
    modulePath: harnessModule,
    exportName: "mountAstronomyDrawer",
    symbolKind: "runtime",
  },
  evaluatorEntrypoint: {
    modulePath: "evaluation/verifier-only/BG-H04/canonical-driver.ts",
    exportName: "evaluateCanonicalObservations",
    symbolKind: "runtime",
  },
});
