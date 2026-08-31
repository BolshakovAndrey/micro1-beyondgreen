import { defineOfficialFixtureAdapter } from "../worker-contract.ts";

/** Static pre-unblinding adapter for the frozen BG-H01 prop-reset fixture. */
export const BG_H01_OFFICIAL_FIXTURE = defineOfficialFixtureAdapter({
  fixtureId: "BG-H01",
  membership: "held_out",
  behaviorClass: "prop_reset",
  candidates: [
    {
      candidateId: "candidate-a",
      module: { modulePath: "candidates/BG-H01/candidate-a/DisplayCardEditor.ts", exportName: "DisplayCardEditor", symbolKind: "runtime" },
      construction: {
        kind: "mount_function",
        binding: { modulePath: "evaluation/arm-visible/BG-H01/harness.ts", exportName: "mountDisplayCardEditor", symbolKind: "runtime" },
        candidateArgument: "component_export",
      },
    },
    {
      candidateId: "candidate-b",
      module: { modulePath: "candidates/BG-H01/candidate-b/DisplayCardEditor.ts", exportName: "DisplayCardEditor", symbolKind: "runtime" },
      construction: {
        kind: "mount_function",
        binding: { modulePath: "evaluation/arm-visible/BG-H01/harness.ts", exportName: "mountDisplayCardEditor", symbolKind: "runtime" },
        candidateArgument: "component_export",
      },
    },
  ],
  armVisible: {
    rootPath: "evaluation/arm-visible/BG-H01",
    contracts: [
      { binding: { modulePath: "evaluation/arm-visible/BG-H01/contract.ts", exportName: "DisplayCardEditorComponent", symbolKind: "type" }, names: ["DisplayCardEditorComponent"] },
      { binding: { modulePath: "evaluation/arm-visible/BG-H01/contract.ts", exportName: "DisplayCardEditorHandle", symbolKind: "type" }, names: ["dispatch"] },
    ],
    invariants: [
      { binding: { modulePath: "evaluation/arm-visible/BG-H01/contract.ts", exportName: "ARM_VISIBLE_INVARIANTS", symbolKind: "runtime" }, names: ["BG-H01-INV-PROP-RESET"] },
    ],
    actions: [
      { binding: { modulePath: "evaluation/arm-visible/BG-H01/contract.ts", exportName: "EditorAction", symbolKind: "type" }, names: ["edit-title", "edit-theme", "reset-current"] },
      { binding: { modulePath: "evaluation/arm-visible/BG-H01/harness.ts", exportName: "MountedDisplayCardEditor", symbolKind: "type" }, names: ["dispatch", "rerender", "observe", "dispose"] },
    ],
    observations: [
      { binding: { modulePath: "evaluation/arm-visible/BG-H01/contract.ts", exportName: "DisplayCardObservation", symbolKind: "type" }, names: ["cardId", "title", "theme", "dirty", "actionLog"] },
    ],
    visibleAssertions: [
      { binding: { modulePath: "evaluation/arm-visible/BG-H01/visible-assertions.ts", exportName: "VISIBLE_ASSERTIONS", symbolKind: "runtime" }, names: ["BG-H01-VIS-001", "BG-H01-VIS-002", "BG-H01-VIS-003", "BG-H01-VIS-004", "BG-H01-VIS-005"] },
    ],
  },
  verifierOnlyRoot: "evaluation/verifier-only/BG-H01",
  scenarioProviderEntrypoint: { modulePath: "evaluation/verifier-only/BG-H01/scenario-provider.ts", exportName: "NEUTRAL_SCENARIO_PROVIDER_EXPORT", symbolKind: "runtime" },
  observerEntrypoint: { modulePath: "evaluation/arm-visible/BG-H01/harness.ts", exportName: "mountDisplayCardEditor", symbolKind: "runtime" },
  evaluatorEntrypoint: { modulePath: "evaluation/verifier-only/BG-H01/canonical-driver.ts", exportName: "evaluateCanonicalObservations", symbolKind: "runtime" },
});
