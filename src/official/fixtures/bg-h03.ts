import { defineOfficialFixtureAdapter } from "../worker-contract.ts";

/** Static pre-unblinding adapter for the frozen BG-H03 identity-stability fixture. */
export const BG_H03_OFFICIAL_FIXTURE = defineOfficialFixtureAdapter({
  fixtureId: "BG-H03",
  membership: "held_out",
  behaviorClass: "identity_stability",
  candidates: [
    {
      candidateId: "candidate-a",
      module: { modulePath: "candidates/BG-H03/candidate-a/SeedLibrarySelectionDesk.ts", exportName: "SeedLibrarySelectionDesk", symbolKind: "runtime" },
      construction: {
        kind: "mount_function",
        binding: { modulePath: "evaluation/arm-visible/BG-H03/harness.ts", exportName: "mountSelectionDesk", symbolKind: "runtime" },
        candidateArgument: "component_export",
      },
    },
    {
      candidateId: "candidate-b",
      module: { modulePath: "candidates/BG-H03/candidate-b/SeedLibrarySelectionDesk.ts", exportName: "SeedLibrarySelectionDesk", symbolKind: "runtime" },
      construction: {
        kind: "mount_function",
        binding: { modulePath: "evaluation/arm-visible/BG-H03/harness.ts", exportName: "mountSelectionDesk", symbolKind: "runtime" },
        candidateArgument: "component_export",
      },
    },
  ],
  armVisible: {
    rootPath: "evaluation/arm-visible/BG-H03",
    contracts: [
      { binding: { modulePath: "evaluation/arm-visible/BG-H03/contract.ts", exportName: "SelectionDeskComponent", symbolKind: "type" }, names: ["SelectionDeskComponent"] },
      { binding: { modulePath: "evaluation/arm-visible/BG-H03/contract.ts", exportName: "SelectionDeskHandle", symbolKind: "type" }, names: ["dispatch", "observe"] },
    ],
    invariants: [
      { binding: { modulePath: "evaluation/arm-visible/BG-H03/contract.ts", exportName: "ARM_VISIBLE_INVARIANTS", symbolKind: "runtime" }, names: ["BG-H03-INV-HANDLE-IDENTITY"] },
    ],
    actions: [
      { binding: { modulePath: "evaluation/arm-visible/BG-H03/contract.ts", exportName: "SelectionAction", symbolKind: "type" }, names: ["set-note", "select", "reset"] },
      { binding: { modulePath: "evaluation/arm-visible/BG-H03/harness.ts", exportName: "MountedSelectionDesk", symbolKind: "type" }, names: ["dispatch", "observe", "dispose"] },
    ],
    observations: [
      { binding: { modulePath: "evaluation/arm-visible/BG-H03/contract.ts", exportName: "SelectionObservation", symbolKind: "type" }, names: ["selectedId", "selectionHandle", "searchNote", "previewAttachmentCount", "actionLog"] },
      { binding: { modulePath: "evaluation/arm-visible/BG-H03/contract.ts", exportName: "SelectionHandle", symbolKind: "type" }, names: ["id", "label"] },
    ],
    visibleAssertions: [
      { binding: { modulePath: "evaluation/arm-visible/BG-H03/visible-assertions.ts", exportName: "VISIBLE_ASSERTIONS", symbolKind: "runtime" }, names: ["BG-H03-VIS-001", "BG-H03-VIS-002", "BG-H03-VIS-003", "BG-H03-VIS-004"] },
    ],
  },
  verifierOnlyRoot: "evaluation/verifier-only/BG-H03",
  observerEntrypoint: { modulePath: "evaluation/arm-visible/BG-H03/harness.ts", exportName: "mountSelectionDesk", symbolKind: "runtime" },
  evaluatorEntrypoint: { modulePath: "evaluation/verifier-only/BG-H03/canonical-driver.ts", exportName: "evaluateCanonicalObservations", symbolKind: "runtime" },
});
