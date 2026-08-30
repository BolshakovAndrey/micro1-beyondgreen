/** Shared immutable descriptor surface for every frozen evaluation fixture. */
export type FixtureDescriptor = Readonly<{
  fixtureId: `BG-${"D" | "H"}0${1 | 2 | 3 | 4 | 5 | 6}`;
  membership: "development" | "held_out";
  behaviorClass: "stale_snapshots" | "queued_batched_updates" | "derived_state" | "subscription_cleanup" |
    "prop_reset" | "async_ordering" | "identity_stability" | "conditional_lifecycle" | "external_store" | "rollback";
  candidateIds: readonly [string, string];
  armVisibleRoot: string;
  verifierOnlyRoot: string;
  manifestPaths: readonly string[];
  verificationTask: `${"d" | "h"}0${1 | 2 | 3 | 4 | 5 | 6}:verify`;
}>;

/** Backward-compatible development-only view of the generic fixture descriptor. */
export type DevelopmentFixtureDescriptor = FixtureDescriptor & Readonly<{membership: "development"}>;

/** The exact D01-D04 development set used by task and integration bijection checks. */
export const DEVELOPMENT_FIXTURES = Object.freeze([
  {
    fixtureId: "BG-D01", membership: "development", behaviorClass: "stale_snapshots",
    candidateIds: ["candidate-a", "candidate-b"],
    armVisibleRoot: "evaluation/arm-visible/BG-D01",
    verifierOnlyRoot: "evaluation/verifier-only/BG-D01",
    manifestPaths: [
      "evaluation/manifests/BG-D01/arm-visible.manifest.json",
      "evaluation/manifests/BG-D01/verifier-only.manifest.json",
      "evaluation/manifests/BG-D01/candidate-a.manifest.json",
      "evaluation/manifests/BG-D01/candidate-b.manifest.json",
      "evaluation/manifests/BG-D01/vertical-slice.manifest.json",
    ],
    verificationTask: "d01:verify",
  },
  {
    fixtureId: "BG-D02", membership: "development", behaviorClass: "queued_batched_updates",
    candidateIds: ["candidate-a", "candidate-b"],
    armVisibleRoot: "evaluation/arm-visible/BG-D02",
    verifierOnlyRoot: "evaluation/verifier-only/BG-D02",
    manifestPaths: [
      "evaluation/manifests/BG-D02/arm-visible.manifest.json",
      "evaluation/manifests/BG-D02/verifier-only.manifest.json",
      "evaluation/manifests/BG-D02/candidate-a.manifest.json",
      "evaluation/manifests/BG-D02/candidate-b.manifest.json",
    ],
    verificationTask: "d02:verify",
  },
  {
    fixtureId: "BG-D03", membership: "development", behaviorClass: "derived_state",
    candidateIds: ["candidate-a", "candidate-b"],
    armVisibleRoot: "evaluation/arm-visible/BG-D03",
    verifierOnlyRoot: "evaluation/verifier-only/BG-D03",
    manifestPaths: ["evaluation/manifests/BG-D03/package-manifest.yaml"],
    verificationTask: "d03:verify",
  },
  {
    fixtureId: "BG-D04", membership: "development", behaviorClass: "subscription_cleanup",
    candidateIds: ["preserving", "false-green"],
    armVisibleRoot: "evaluation/arm-visible/BG-D04",
    verifierOnlyRoot: "evaluation/verifier-only/BG-D04",
    manifestPaths: [
      "evaluation/manifests/BG-D04/arm-visible.manifest.json",
      "evaluation/manifests/BG-D04/verifier-only.manifest.json",
      "evaluation/manifests/BG-D04/candidates.manifest.json",
    ],
    verificationTask: "d04:verify",
  },
] as const satisfies readonly DevelopmentFixtureDescriptor[]);

/** The exact six held-out descriptors, with neutral candidate identifiers only. */
export const HELD_OUT_FIXTURES = Object.freeze([
  ["BG-H01", "prop_reset", "h01:verify"],
  ["BG-H02", "async_ordering", "h02:verify"],
  ["BG-H03", "identity_stability", "h03:verify"],
  ["BG-H04", "conditional_lifecycle", "h04:verify"],
  ["BG-H05", "external_store", "h05:verify"],
  ["BG-H06", "rollback", "h06:verify"],
].map(([fixtureId, behaviorClass, verificationTask]) => ({
  fixtureId,
  membership: "held_out" as const,
  behaviorClass,
  candidateIds: ["candidate-a", "candidate-b"] as const,
  armVisibleRoot: `evaluation/arm-visible/${fixtureId}`,
  verifierOnlyRoot: `evaluation/verifier-only/${fixtureId}`,
  manifestPaths: fixtureId === "BG-H03" || fixtureId === "BG-H04"
    ? [`evaluation/manifests/${fixtureId}/implementation.manifest.json`]
    : [
        `evaluation/manifests/${fixtureId}/arm-visible.manifest.json`,
        `evaluation/manifests/${fixtureId}/verifier-only.manifest.json`,
        `evaluation/manifests/${fixtureId}/candidate-a.manifest.json`,
        `evaluation/manifests/${fixtureId}/candidate-b.manifest.json`,
        `evaluation/manifests/${fixtureId}/${fixtureId === "BG-H01" || fixtureId === "BG-H02" ? "fixture-implementation" : "implementation"}.manifest.json`,
      ],
  verificationTask,
}))) as readonly FixtureDescriptor[];

/** Exact ten-fixture registry used for membership and behavior-class bijections. */
export const FIXTURES = Object.freeze([...DEVELOPMENT_FIXTURES, ...HELD_OUT_FIXTURES]);
