/**
 * Owns the data-only D01 fixture descriptor: immutable candidates, package digests,
 * worker paths, schema versions, and run identity consumed by the generic engine.
 */

/** Candidate identifiers frozen for the D01 development fixture. */
export const D01_CANDIDATE_IDS = ["candidate-a", "candidate-b"] as const;
/** Restricts candidate selection to the two immutable entries frozen in the descriptor. */
export type CandidateId = (typeof D01_CANDIDATE_IDS)[number];

/** Binds a package identifier and kind to its root, manifest, files, and expected digests. */
export type PackageBinding = Readonly<{
  rootPath: string;
  manifestPath: string;
  packageId: string;
  packageKind: "arm_visible" | "verifier_only" | "candidate";
  sourcePaths: readonly string[];
  expectedManifestSha256: string;
  expectedPackageSha256: string;
}>;

/** Specializes the generic engine descriptor with the exact D01 candidate identifier domain. */
export type FixtureDescriptor = Readonly<{
  fixtureId: string;
  membership: "development" | "held_out";
  behaviorClass: string;
  candidateIds: typeof D01_CANDIDATE_IDS;
  candidates: Readonly<Record<CandidateId, Readonly<{
    sourcePath: string;
    manifestPath: string;
    packageId: string;
    expectedSourceSha256: string;
  }>>>;
  armVisible: PackageBinding & Readonly<{
    visibleAssertionIds: readonly [string, string, string, string, string];
  }>;
  verifierOnly: PackageBinding & Readonly<{ groundTruthPath: string }>;
  scripts: Readonly<{ armWorker: string; observerWorker: string; evaluatorWorker: string }>;
  artifacts: Readonly<{ evidenceJson: string; evidenceHtml: string; replayJsonl: string }>;
  verticalManifestPath: string;
  engine: Readonly<{
    armIds: readonly ["status-quo", "beyondgreen"];
    riskCategories: readonly [
      "state", "reads_writes", "derived_edges", "subscriptions",
      "lifecycle", "ordering", "identity", "rollback",
    ];
    observationItemCount: number;
    observationRecordCount: number;
    replayRecordTypes: readonly ["header", "reasoning_request", "reasoning_response", "footer"];
  }>;
  schemas: Readonly<Record<string, string>>;
  run: Readonly<{
    id: string;
    type: "unscored_d01_vertical_slice_demo";
    evaluationVersion: string;
    sessionBoundary: string;
  }>;
}>;

/** Code-owned D01 package, path, schema, and run binding. */
export const D01_FIXTURE = Object.freeze({
  fixtureId: "BG-D01",
  membership: "development",
  behaviorClass: "stale_snapshots",
  candidateIds: D01_CANDIDATE_IDS,
  candidates: {
    "candidate-a": {
      sourcePath: "candidates/BG-D01/candidate-a/MuseumBoard.ts",
      manifestPath: "evaluation/manifests/BG-D01/candidate-a.manifest.json",
      packageId: "BG-D01-candidate-a",
      expectedSourceSha256: "f46b2ed8c85e8558b5c8812491c09d89530099b0890454415579ea4c5d69e8a5",
    },
    "candidate-b": {
      sourcePath: "candidates/BG-D01/candidate-b/MuseumBoard.ts",
      manifestPath: "evaluation/manifests/BG-D01/candidate-b.manifest.json",
      packageId: "BG-D01-candidate-b",
      expectedSourceSha256: "9e2a9151531aa961cf0ace3e20520fdcfa45ff0bff0f13ae214f7e5fbdad7d2b",
    },
  },
  armVisible: {
    rootPath: "evaluation/arm-visible/BG-D01",
    manifestPath: "evaluation/manifests/BG-D01/arm-visible.manifest.json",
    packageId: "BG-D01-arm-visible",
    packageKind: "arm_visible",
    sourcePaths: [
      "evaluation/arm-visible/BG-D01/LegacyMuseumBoard.ts",
      "evaluation/arm-visible/BG-D01/contract.ts",
      "evaluation/arm-visible/BG-D01/denied-probe.mjs",
      "evaluation/arm-visible/BG-D01/harness.ts",
      "evaluation/arm-visible/BG-D01/render.ts",
      "evaluation/arm-visible/BG-D01/step-contract.test.ts",
      "evaluation/arm-visible/BG-D01/visible-assertions.ts",
      "evaluation/arm-visible/BG-D01/visible.test.ts",
    ],
    visibleAssertionIds: [
      "BG-D01-VIS-001", "BG-D01-VIS-002", "BG-D01-VIS-003", "BG-D01-VIS-004", "BG-D01-VIS-005",
    ],
    expectedManifestSha256: "38646e48c033a43ced083a6581f3135388afc297c27eb29cf7064f11047e9f02",
    expectedPackageSha256: "ade0223f33d045972798e9bdcb1c2931c032a76e630ff701c1afdfc891e77d6a",
  },
  verifierOnly: {
    rootPath: "evaluation/verifier-only/BG-D01",
    groundTruthPath: "evaluation/verifier-only/BG-D01/ground-truth.json",
    manifestPath: "evaluation/manifests/BG-D01/verifier-only.manifest.json",
    packageId: "BG-D01-verifier-only",
    packageKind: "verifier_only",
    sourcePaths: [
      "evaluation/verifier-only/BG-D01/canonical-driver.ts",
      "evaluation/verifier-only/BG-D01/evaluator-denied-probe.mjs",
      "evaluation/verifier-only/BG-D01/ground-truth.json",
      "evaluation/verifier-only/BG-D01/self-check.test.ts",
    ],
    expectedManifestSha256: "4db90457a79b2991cb7646f55a0697b78d99d878a317c9cff21548297124bcdf",
    expectedPackageSha256: "b00e9ceeadb691f1b4c38c0e13219f554f7a0ee75f5e52fb5e8a3cda3a117175",
  },
  scripts: {
    armWorker: "scripts/d01-arm-worker.ts",
    observerWorker: "scripts/d01-candidate-observer-worker.ts",
    evaluatorWorker: "scripts/d01-evaluator-worker.ts",
  },
  artifacts: {
    evidenceJson: "artifacts/evaluation/BG-D01-VERTICAL-SLICE.json",
    evidenceHtml: "artifacts/evaluation/BG-D01-VERTICAL-SLICE.html",
    replayJsonl: "artifacts/evaluation/BG-D01-OFFLINE-REPLAY.jsonl",
  },
  verticalManifestPath: "evaluation/manifests/BG-D01/vertical-slice.manifest.json",
  engine: {
    armIds: ["status-quo", "beyondgreen"],
    riskCategories: [
      "state", "reads_writes", "derived_edges", "subscriptions",
      "lifecycle", "ordering", "identity", "rollback",
    ],
    observationItemCount: 300,
    observationRecordCount: 9,
    replayRecordTypes: ["header", "reasoning_request", "reasoning_response", "footer"],
  },
  schemas: {
    riskInventory: "beyondgreen-risk-inventory@1.1.0",
    probePlan: "beyondgreen-probe-plan@1.1.0",
    reasoningInput: "beyondgreen-reasoning-input@1.1.0",
    reasoningOutput: "beyondgreen-reasoning-output@1.1.0",
    armDecision: "beyondgreen-arm-decision@1.1.0",
    evaluatorResult: "beyondgreen-evaluator-result@1.1.0",
    observations: "beyondgreen-candidate-observations@1.1.0",
    evidence: "beyondgreen-evidence@1.1.0",
    replayJsonl: "beyondgreen-replay-jsonl@1.0.0",
    reasoningReplayResult: "beyondgreen-offline-replay-result@1.0.0",
    evidenceReplayResult: "beyondgreen-evidence-replay-result@1.0.0",
  },
  run: {
    id: "RUN-BG-D01-VERTICAL-001",
    type: "unscored_d01_vertical_slice_demo",
    evaluationVersion: "eval-v1.1.0",
    sessionBoundary: "artifacts/trajectories/session-boundaries/SES-20260830-001.yaml",
  },
} as const satisfies FixtureDescriptor);

/** Resolve a candidate only through its frozen fixture descriptor entry. */
export function candidateDescriptor(candidateId: CandidateId) {
  return D01_FIXTURE.candidates[candidateId];
}
