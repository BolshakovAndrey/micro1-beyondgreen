/** Supplies a synthetic descriptor and bindings that exercise the production engine generically. */
import { canonicalJson, sha256 } from "../../src/d01/canonical-json.ts";
import { createWorkerProcessEvidence } from "../../src/d01/capability.ts";
import { defineFixtureEngine } from "../../src/d01/engine.ts";
import { CapabilityProofSchema, ExecutionEventSchema } from "../../src/d01/capability-schemas.ts";

const DIGEST = sha256("TEST-ONLY immutable candidate");
const MANIFEST_DIGEST = sha256("TEST-ONLY manifest");
const REPLAY_IDENTITY = Object.freeze({ protocol: "test-only", replaySha256: sha256("test-replay") });

const descriptor = Object.freeze({
  fixtureId: "TEST-ONLY",
  membership: "development" as const,
  candidateIds: ["variant-one"] as const,
  candidates: {
    "variant-one": {
      sourcePath: "evaluation/arm-visible/BG-D01/contract.ts",
      manifestPath: "tests/fixtures/test-only-engine.ts",
      packageId: "TEST-ONLY-candidate",
      expectedSourceSha256: DIGEST,
    },
  },
  armVisible: {
    rootPath: "tests/fixtures",
    manifestPath: "tests/fixtures/test-only-observer-worker.ts",
    packageId: "TEST-ONLY-arm-visible",
    packageKind: "arm_visible" as const,
    sourcePaths: ["tests/fixtures/test-only-observer-worker.ts"],
    visibleAssertionIds: ["TEST-VIS-1"],
    expectedManifestSha256: MANIFEST_DIGEST,
    expectedPackageSha256: MANIFEST_DIGEST,
  },
  verifierOnly: {
    rootPath: "tests/fixtures/verifier-only",
    manifestPath: "tests/fixtures/test-only-engine.ts",
    packageId: "TEST-ONLY-verifier-only",
    packageKind: "verifier_only" as const,
    sourcePaths: ["tests/fixtures/test-only-engine.ts"],
    groundTruthPath: "package.json",
    expectedManifestSha256: MANIFEST_DIGEST,
    expectedPackageSha256: MANIFEST_DIGEST,
  },
  scripts: {
    armWorker: "tests/fixtures/test-only-arm-worker.ts",
    observerWorker: "tests/fixtures/test-only-observer-worker.ts",
    evaluatorWorker: "tests/fixtures/test-only-evaluator-worker.ts",
  },
  artifacts: {
    evidenceJson: "tests/fixtures/test-only-evidence.json",
    evidenceHtml: "tests/fixtures/test-only-evidence.html",
    replayJsonl: "tests/fixtures/test-only-replay.jsonl",
  },
  schemas: {
    reasoningInput: "test-reasoning-input@1",
    observations: "test-observations@1",
    evaluatorResult: "test-evaluator@1",
    evidence: "test-evidence@1",
  },
  engine: {
    armIds: ["status-quo", "beyondgreen"] as const,
    riskCategories: ["synthetic_state"] as const,
    observationItemCount: 4,
    observationRecordCount: 1,
    replayRecordTypes: ["header", "reasoning_request", "reasoning_response", "footer"] as const,
  },
  run: {
    id: "RUN-TEST-ONLY",
    type: "test_only_integration",
    evaluationVersion: "test-eval@1",
    sessionBoundary: "TEST-ONLY",
  },
});

const greenGate = Object.freeze({
  compileStatus: "passed", compilePassed: true, compileDiagnostics: [], visibleTestIds: ["TEST-VIS-1"],
  visibleStatus: "passed", visiblePassed: true, deterministicAssertionFailures: [], operationalFailures: [],
  deterministic: true, operationalFailure: false,
});

const evaluatorInputDigest = (decision: any, pair: any, manifestSha256: string) => sha256(canonicalJson({
  decisionSha256: decision.decisionSha256,
  observationPairSha256: pair.pairSha256,
  evaluatorManifestSha256: manifestSha256,
}));

/** TEST-ONLY bindings exercise the production orchestration and worker protocol without adding a benchmark fixture. */
export const TEST_ONLY_ENGINE = defineFixtureEngine({
  descriptor,
  schemas: {
    parseCandidateId: (value: unknown) => {
      if (value !== "variant-one") throw new Error("Unknown TEST-ONLY candidate.");
      return value;
    },
    parseArmId: (value: unknown) => {
      if (value !== "status-quo" && value !== "beyondgreen") throw new Error("Unknown TEST-ONLY arm.");
      return value;
    },
    parseArmWorkerOutput: (value: unknown) => value,
    parseObservation: (value: unknown) => value,
    parseEvaluatorResult: (value: unknown) => value,
    parseExecutionEvent: (value: unknown) => ExecutionEventSchema.parse(value),
    parseCapabilityProof: (value: unknown) => CapabilityProofSchema.parse(value),
    parseEvidence: (value: unknown) => value,
  },
  armChecks: {
    classify: () => greenGate,
    compile: () => [],
    runVisible: () => greenGate,
    runInternal: () => ({ deterministic: true, errors: [], checks: [] }),
    assertVerifierDenied: () => true,
  },
  reasoning: {
    execute: (value: any) => {
      const output = { probePlan: { probes: [] } };
      return {
        output,
        evidence: { replayIdentity: REPLAY_IDENTITY, output },
        replayJsonl: "test-replay",
        input: value,
      };
    },
  },
  evaluator: { workerPath: descriptor.scripts.evaluatorWorker },
  runtime: {
    describeCandidate: () => descriptor.candidates["variant-one"],
    ingestCandidate: () => ({
      fixtureId: descriptor.fixtureId, candidateId: "variant-one", relativePath: descriptor.candidates["variant-one"].sourcePath,
      sha256Before: DIGEST, expectedSha256: DIGEST,
    }),
    assertCandidateUnchanged: () => DIGEST,
    validatePackage: (_repositoryRoot: string, binding: { expectedManifestSha256: string }) => binding.expectedManifestSha256,
    inventoryRisk: () => ({ risks: [], unsupportedSyntax: false, externalImport: false }),
    importCandidate: async () => ({ MuseumBoard: {} }),
    captureObservations: async () => [{ values: [1, 2, 3, 4] }],
    createEvaluatorProcessEvidence: (_root: string, executionSlot: string, launchBindingSha256: string) => (
      createWorkerProcessEvidence({
        role: "evaluator", capabilityProfile: "verifier_only", executionSlot: executionSlot as any,
        launchBindingSha256, verifierReadAllowed: true, verifierReadDenied: false,
        candidateReadAllowed: false, candidateReadDenied: true,
      })
    ),
    decide: (input: any) => ({
      schemaVersion: "test-decision@1", fixtureId: descriptor.fixtureId, candidateId: input.candidate.candidateId,
      candidateSha256: input.candidate.sha256Before, arm: input.arm, attemptOrdinal: 1,
      evidenceComplete: true, verdict: input.arm === "status-quo" ? "accept" : "reject",
      reasonCode: input.arm === "status-quo" ? "visible_gate_green" : "synthetic_reject",
      rationale: "TEST-ONLY deterministic decision.", legacyGate: input.legacyGate,
      riskInventory: input.riskInventory, probePlan: input.probePlan, reasoningEvidence: input.reasoningEvidence,
      internalChecks: input.internalChecks, operationalError: input.operationalError ?? null,
      verifierAccessDenied: true, evaluatorFeedbackRoundsBeforeDecision: 0, finalizedBeforeEvaluator: true,
    }),
    finalizeDecision: (decision: any, capabilityProofSha256: string | null = null) => {
      const decisionSha256 = sha256(canonicalJson({ decision, capabilityProofSha256 }));
      return Object.freeze({ decision: Object.freeze(decision), capabilityProofSha256, decisionSha256 });
    },
    verifyFinalizedDecision: (input: any) => {
      if (sha256(canonicalJson({
        decision: input.decision, capabilityProofSha256: input.capabilityProofSha256,
      })) !== input.decisionSha256) throw new Error("TEST-ONLY decision digest mismatch.");
      return input;
    },
    finalizeObservationPair: (first: any, second: any) => {
      if (first.captureOrdinal !== 1 || second.captureOrdinal !== 2
        || first.observationsSha256 !== second.observationsSha256) throw new Error("TEST-ONLY observations differ.");
      return {
        first, second, deterministic: true, observationsSha256: first.observationsSha256,
        pairSha256: sha256(canonicalJson({ first, second })),
      };
    },
    evaluatorInputSha256: evaluatorInputDigest,
    evaluateFinalized: ({ finalized, observations, processEvidence }: any) => ({
      schemaVersion: descriptor.schemas.evaluatorResult, fixtureId: descriptor.fixtureId,
      candidateId: finalized.decision.candidateId, arm: finalized.decision.arm,
      decisionSha256: finalized.decisionSha256, oracleAcceptedCandidate: false, groundTruth: "false_green",
      correctDecision: finalized.decision.verdict === "reject", reasonCorrectReject: finalized.decision.verdict === "reject",
      completedDecision: true, falseAlarm: false, membership: descriptor.membership,
      evaluatedAfterDecision: true, feedbackRoundsBeforeDecision: 0,
      evaluatorManifestSha256: MANIFEST_DIGEST, observationPairSha256: observations.pairSha256,
      evaluatorInputSha256: evaluatorInputDigest(finalized, observations, MANIFEST_DIGEST), processEvidence,
    }),
  },
  replay: {
    validateReasoning: () => ({
      identity: REPLAY_IDENTITY,
      input: {
        candidateId: "variant-one", candidateSha256: DIGEST,
        riskInventory: { risks: [], unsupportedSyntax: false, externalImport: false },
      },
      output: { probePlan: { probes: [] } },
    }),
    replayEvidence: (evidenceJson: string, evidenceHtml: string) => ({
      replayed: true, evidenceJson, evidenceHtml,
    }),
  },
  report: {
    build: (evidence: any) => ({
      evidence,
      json: `${JSON.stringify(evidence)}\n`,
      html: `<p>${evidence.fixtureId}</p>`,
      canonicalJsonSha256: sha256(canonicalJson(evidence)),
      htmlSha256: sha256(`<p>${evidence.fixtureId}</p>`),
    }),
  },
});
