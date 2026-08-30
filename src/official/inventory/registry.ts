/** Static string-only binding for one frozen candidate module. */
export type OfficialCandidateInventoryBinding = Readonly<{
  candidateId: string;
  modulePath: string;
  exportName: string;
}>;

/** Static string-only inventory for one frozen fixture. */
export type OfficialFixtureInventoryBinding = Readonly<{
  fixtureId: string;
  membership: "development" | "held_out";
  behaviorClass: string;
  descriptor: Readonly<{modulePath: string; exportName: string}>;
  manifestPaths: readonly string[];
  candidates: readonly OfficialCandidateInventoryBinding[];
}>;

const commonManifestNames = (fixtureId: string): readonly string[] => Object.freeze([
  `evaluation/manifests/${fixtureId}/arm-visible.manifest.json`,
  `evaluation/manifests/${fixtureId}/candidate-a.manifest.json`,
  `evaluation/manifests/${fixtureId}/candidate-b.manifest.json`,
  `evaluation/manifests/${fixtureId}/verifier-only.manifest.json`,
]);

/**
 * Complete pre-unblinding inventory. Every path and export is explicit so no
 * fixture or candidate name can be inferred from repository contents.
 */
const fixtureBindings: readonly OfficialFixtureInventoryBinding[] = [
  {
    fixtureId: "BG-D01",
    membership: "development",
    behaviorClass: "stale_snapshots",
    descriptor: { modulePath: "src/d01/fixture.ts", exportName: "D01_FIXTURE" },
    manifestPaths: commonManifestNames("BG-D01"),
    candidates: [
      { candidateId: "candidate-a", modulePath: "candidates/BG-D01/candidate-a/MuseumBoard.ts", exportName: "MuseumBoard" },
      { candidateId: "candidate-b", modulePath: "candidates/BG-D01/candidate-b/MuseumBoard.ts", exportName: "MuseumBoard" },
    ],
  },
  {
    fixtureId: "BG-D02",
    membership: "development",
    behaviorClass: "queued_batched_updates",
    descriptor: { modulePath: "src/official/fixtures/bg-d02.ts", exportName: "BG_D02_OFFICIAL_FIXTURE_ADAPTER" },
    manifestPaths: commonManifestNames("BG-D02"),
    candidates: [
      { candidateId: "candidate-a", modulePath: "candidates/BG-D02/candidate-a/ParcelDispatchBoard.ts", exportName: "ParcelDispatchBoard" },
      { candidateId: "candidate-b", modulePath: "candidates/BG-D02/candidate-b/ParcelDispatchBoard.ts", exportName: "ParcelDispatchBoard" },
    ],
  },
  {
    fixtureId: "BG-D03",
    membership: "development",
    behaviorClass: "derived_state",
    descriptor: { modulePath: "src/official/fixtures/bg-d03.ts", exportName: "BG_D03_OFFICIAL_ADAPTER" },
    manifestPaths: ["evaluation/manifests/BG-D03/package-manifest.yaml"],
    candidates: [
      { candidateId: "candidate-a", modulePath: "candidates/BG-D03/candidate-a/TrayPlanner.ts", exportName: "TrayPlanner" },
      { candidateId: "candidate-b", modulePath: "candidates/BG-D03/candidate-b/TrayPlanner.ts", exportName: "TrayPlanner" },
    ],
  },
  {
    fixtureId: "BG-D04",
    membership: "development",
    behaviorClass: "subscription_cleanup",
    descriptor: { modulePath: "src/official/fixtures/bg-d04.ts", exportName: "BG_D04_OFFICIAL_FIXTURE_ADAPTER" },
    manifestPaths: [
      "evaluation/manifests/BG-D04/arm-visible.manifest.json",
      "evaluation/manifests/BG-D04/candidates.manifest.json",
      "evaluation/manifests/BG-D04/verifier-only.manifest.json",
    ],
    candidates: [
      { candidateId: "preserving", modulePath: "candidates/BG-D04/preserving/BulletinPanel.ts", exportName: "BulletinPanel" },
      { candidateId: "false-green", modulePath: "candidates/BG-D04/false-green/BulletinPanel.ts", exportName: "BulletinPanel" },
    ],
  },
  {
    fixtureId: "BG-H01",
    membership: "held_out",
    behaviorClass: "prop_reset",
    descriptor: { modulePath: "src/official/fixtures/bg-h01.ts", exportName: "BG_H01_OFFICIAL_FIXTURE" },
    manifestPaths: [
      ...commonManifestNames("BG-H01"),
      "evaluation/manifests/BG-H01/fixture-implementation.manifest.json",
    ],
    candidates: [
      { candidateId: "candidate-a", modulePath: "candidates/BG-H01/candidate-a/DisplayCardEditor.ts", exportName: "DisplayCardEditor" },
      { candidateId: "candidate-b", modulePath: "candidates/BG-H01/candidate-b/DisplayCardEditor.ts", exportName: "DisplayCardEditor" },
    ],
  },
  {
    fixtureId: "BG-H02",
    membership: "held_out",
    behaviorClass: "async_ordering",
    descriptor: { modulePath: "src/official/fixtures/bg-h02.ts", exportName: "BG_H02_OFFICIAL_FIXTURE" },
    manifestPaths: [
      ...commonManifestNames("BG-H02"),
      "evaluation/manifests/BG-H02/fixture-implementation.manifest.json",
    ],
    candidates: [
      { candidateId: "candidate-a", modulePath: "candidates/BG-H02/candidate-a/StargazingGuidePreview.ts", exportName: "StargazingGuidePreview" },
      { candidateId: "candidate-b", modulePath: "candidates/BG-H02/candidate-b/StargazingGuidePreview.ts", exportName: "StargazingGuidePreview" },
    ],
  },
  {
    fixtureId: "BG-H03",
    membership: "held_out",
    behaviorClass: "identity_stability",
    descriptor: { modulePath: "src/official/fixtures/bg-h03.ts", exportName: "BG_H03_OFFICIAL_FIXTURE" },
    manifestPaths: ["evaluation/manifests/BG-H03/implementation.manifest.json"],
    candidates: [
      { candidateId: "candidate-a", modulePath: "candidates/BG-H03/candidate-a/SeedLibrarySelectionDesk.ts", exportName: "SeedLibrarySelectionDesk" },
      { candidateId: "candidate-b", modulePath: "candidates/BG-H03/candidate-b/SeedLibrarySelectionDesk.ts", exportName: "SeedLibrarySelectionDesk" },
    ],
  },
  {
    fixtureId: "BG-H04",
    membership: "held_out",
    behaviorClass: "conditional_lifecycle",
    descriptor: { modulePath: "src/official/fixtures/bg-h04.ts", exportName: "BG_H04_OFFICIAL_FIXTURE" },
    manifestPaths: ["evaluation/manifests/BG-H04/implementation.manifest.json"],
    candidates: [
      { candidateId: "candidate-a", modulePath: "candidates/BG-H04/candidate-a/AstronomyChecklist.ts", exportName: "AstronomyChecklist" },
      { candidateId: "candidate-b", modulePath: "candidates/BG-H04/candidate-b/AstronomyChecklist.ts", exportName: "AstronomyChecklist" },
    ],
  },
  {
    fixtureId: "BG-H05",
    membership: "held_out",
    behaviorClass: "external_store",
    descriptor: { modulePath: "src/official/fixtures/bg-h05.ts", exportName: "BG_H05_OFFICIAL_FIXTURE" },
    manifestPaths: [
      ...commonManifestNames("BG-H05"),
      "evaluation/manifests/BG-H05/implementation.manifest.json",
    ],
    candidates: [
      { candidateId: "candidate-a", modulePath: "candidates/BG-H05/candidate-a/UnitReadout.ts", exportName: "UnitReadout" },
      { candidateId: "candidate-b", modulePath: "candidates/BG-H05/candidate-b/UnitReadout.ts", exportName: "UnitReadout" },
    ],
  },
  {
    fixtureId: "BG-H06",
    membership: "held_out",
    behaviorClass: "rollback",
    descriptor: { modulePath: "src/official/fixtures/bg-h06.ts", exportName: "BG_H06_OFFICIAL_FIXTURE" },
    manifestPaths: [
      ...commonManifestNames("BG-H06"),
      "evaluation/manifests/BG-H06/implementation.manifest.json",
    ],
    candidates: [
      { candidateId: "candidate-a", modulePath: "candidates/BG-H06/candidate-a/ThemePanel.ts", exportName: "ThemePanel" },
      { candidateId: "candidate-b", modulePath: "candidates/BG-H06/candidate-b/ThemePanel.ts", exportName: "ThemePanel" },
    ],
  },
];

export const OFFICIAL_FROZEN_INVENTORY_BINDINGS: readonly OfficialFixtureInventoryBinding[] = Object.freeze(
  fixtureBindings.map((fixture) => Object.freeze({
  ...fixture,
  descriptor: Object.freeze(fixture.descriptor),
  manifestPaths: Object.freeze([...fixture.manifestPaths]),
  candidates: Object.freeze(fixture.candidates.map((candidate) => Object.freeze(candidate))),
  })),
);
