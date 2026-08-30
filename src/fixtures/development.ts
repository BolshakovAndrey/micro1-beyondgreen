/** Shared immutable descriptor surface for the four development fixtures. */
export type DevelopmentFixtureDescriptor = Readonly<{
  fixtureId: `BG-D0${1 | 2 | 3 | 4}`;
  membership: "development";
  behaviorClass: "stale_snapshots" | "queued_batched_updates" | "derived_state" | "subscription_cleanup";
  candidateIds: readonly [string, string];
  armVisibleRoot: string;
  verifierOnlyRoot: string;
  manifestPaths: readonly string[];
  verificationTask: `d0${1 | 2 | 3 | 4}:verify`;
}>;

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

