import { defineOfficialFixtureAdapter } from "../worker-contract.ts";

/** Static pre-unblinding adapter for the frozen BG-H02 async-ordering fixture. */
export const BG_H02_OFFICIAL_FIXTURE = defineOfficialFixtureAdapter({
  fixtureId: "BG-H02",
  membership: "held_out",
  behaviorClass: "async_ordering",
  candidates: [
    {
      candidateId: "candidate-a",
      module: { modulePath: "candidates/BG-H02/candidate-a/StargazingGuidePreview.ts", exportName: "StargazingGuidePreview", symbolKind: "runtime" },
      construction: {
        kind: "mount_function",
        binding: { modulePath: "evaluation/arm-visible/BG-H02/harness.ts", exportName: "mountStargazingGuidePreview", symbolKind: "runtime" },
        candidateArgument: "component_export",
      },
    },
    {
      candidateId: "candidate-b",
      module: { modulePath: "candidates/BG-H02/candidate-b/StargazingGuidePreview.ts", exportName: "StargazingGuidePreview", symbolKind: "runtime" },
      construction: {
        kind: "mount_function",
        binding: { modulePath: "evaluation/arm-visible/BG-H02/harness.ts", exportName: "mountStargazingGuidePreview", symbolKind: "runtime" },
        candidateArgument: "component_export",
      },
    },
  ],
  armVisible: {
    rootPath: "evaluation/arm-visible/BG-H02",
    contracts: [
      { binding: { modulePath: "evaluation/arm-visible/BG-H02/contract.ts", exportName: "StargazingGuideComponent", symbolKind: "type" }, names: ["StargazingGuideComponent"] },
      { binding: { modulePath: "evaluation/arm-visible/BG-H02/contract.ts", exportName: "DeferredGuideSource", symbolKind: "type" }, names: ["request"] },
      { binding: { modulePath: "evaluation/arm-visible/BG-H02/contract.ts", exportName: "StargazingGuideHandle", symbolKind: "type" }, names: ["select", "reset"] },
    ],
    invariants: [
      { binding: { modulePath: "evaluation/arm-visible/BG-H02/contract.ts", exportName: "ARM_VISIBLE_INVARIANTS", symbolKind: "runtime" }, names: ["BG-H02-INV-CURRENT-EPOCH"] },
    ],
    actions: [
      { binding: { modulePath: "evaluation/arm-visible/BG-H02/contract.ts", exportName: "StargazingGuideHandle", symbolKind: "type" }, names: ["select", "reset"] },
      { binding: { modulePath: "evaluation/arm-visible/BG-H02/harness.ts", exportName: "MountedStargazingGuidePreview", symbolKind: "type" }, names: ["select", "complete", "reset", "observe", "dispose"] },
    ],
    observations: [
      { binding: { modulePath: "evaluation/arm-visible/BG-H02/contract.ts", exportName: "GuidePreviewObservation", symbolKind: "type" }, names: ["selectedGuideId", "status", "content", "actionLog", "createdRequestIds"] },
      { binding: { modulePath: "evaluation/arm-visible/BG-H02/contract.ts", exportName: "RequestHandle", symbolKind: "type" }, names: ["requestId", "guideId"] },
    ],
    visibleAssertions: [
      { binding: { modulePath: "evaluation/arm-visible/BG-H02/visible-assertions.ts", exportName: "VISIBLE_ASSERTIONS", symbolKind: "runtime" }, names: ["BG-H02-VIS-001", "BG-H02-VIS-002", "BG-H02-VIS-003", "BG-H02-VIS-004", "BG-H02-VIS-005"] },
    ],
  },
  verifierOnlyRoot: "evaluation/verifier-only/BG-H02",
  scenarioProviderEntrypoint: { modulePath: "evaluation/verifier-only/BG-H02/scenario-provider.ts", exportName: "NEUTRAL_SCENARIO_PROVIDER_EXPORT", symbolKind: "runtime" },
  observerEntrypoint: { modulePath: "evaluation/arm-visible/BG-H02/harness.ts", exportName: "mountStargazingGuidePreview", symbolKind: "runtime" },
  evaluatorEntrypoint: { modulePath: "evaluation/verifier-only/BG-H02/canonical-driver.ts", exportName: "evaluateCanonicalObservations", symbolKind: "runtime" },
});
