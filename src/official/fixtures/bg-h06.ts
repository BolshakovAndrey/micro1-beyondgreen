import { defineOfficialFixtureAdapter } from "../worker-contract.ts";

const contractModule = "evaluation/arm-visible/BG-H06/contract.ts";
const harnessModule = "evaluation/arm-visible/BG-H06/harness.ts";
const visibleAssertionsModule = "evaluation/arm-visible/BG-H06/visible-assertions.ts";

/** Static pre-unblinding adapter for the frozen BG-H06 rollback fixture. */
export const BG_H06_OFFICIAL_FIXTURE = defineOfficialFixtureAdapter({
  fixtureId: "BG-H06",
  membership: "held_out",
  behaviorClass: "rollback",
  candidates: ["candidate-a", "candidate-b"].map((candidateId) => ({
    candidateId,
    module: {
      modulePath: `candidates/BG-H06/${candidateId}/ThemePanel.ts`,
      exportName: "ThemePanel",
      symbolKind: "runtime",
    },
    construction: {
      kind: "mount_function",
      binding: {
        modulePath: harnessModule,
        exportName: "mountThemePanel",
        symbolKind: "runtime",
      },
      candidateArgument: "component_export",
    },
  })),
  armVisible: {
    rootPath: "evaluation/arm-visible/BG-H06",
    contracts: [{
      binding: { modulePath: contractModule, exportName: "ThemePanelComponent", symbolKind: "type" },
      names: ["ThemePanelComponent"],
    }],
    invariants: [{
      binding: { modulePath: contractModule, exportName: "initialThemeObservation", symbolKind: "runtime" },
      names: ["displayedTheme", "committedTheme", "status", "error", "pendingCount"],
    }],
    actions: [{
      binding: { modulePath: contractModule, exportName: "ThemeAction", symbolKind: "type" },
      names: ["choose", "resolve", "reject", "dismiss-error"],
    }],
    observations: [{
      binding: { modulePath: contractModule, exportName: "ThemeObservation", symbolKind: "type" },
      names: ["displayedTheme", "committedTheme", "status", "error", "pendingCount"],
    }],
    visibleAssertions: [{
      binding: { modulePath: visibleAssertionsModule, exportName: "VISIBLE_ASSERTIONS", symbolKind: "runtime" },
      names: ["BG-H06-VIS-001", "BG-H06-VIS-002", "BG-H06-VIS-003", "BG-H06-VIS-004"],
    }],
  },
  verifierOnlyRoot: "evaluation/verifier-only/BG-H06",
  scenarioProviderEntrypoint: {
    modulePath: "evaluation/verifier-only/BG-H06/scenario-provider.ts",
    exportName: "NEUTRAL_SCENARIO_PROVIDER_EXPORT",
    symbolKind: "runtime",
  },
  observerEntrypoint: {
    modulePath: harnessModule,
    exportName: "mountThemePanel",
    symbolKind: "runtime",
  },
  evaluatorEntrypoint: {
    modulePath: "evaluation/verifier-only/BG-H06/canonical-driver.ts",
    exportName: "evaluateCanonicalObservations",
    symbolKind: "runtime",
  },
});
