/** Validates the complete D01 pipeline, evidence bindings, and adversarial fail-closed cases. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { classifyLegacyGate } from "../src/d01/arm-checks.ts";
import { ingestCandidate, validateBoundPackage } from "../src/d01/candidate.ts";
import { canonicalJson, sha256 } from "../src/d01/canonical-json.ts";
import { deriveExpectedExecutionPolicies } from "../src/d01/capability.ts";
import { finalizeDecision, decide, finalizeObservationPair, verifyFinalizedDecision } from "../src/d01/decision.ts";
import { deriveExecutionClaims } from "../src/d01/execution.ts";
import { D01_FIXTURE } from "../src/d01/fixture.ts";
import {
  createTotalDeadline, D01IntegrityError, runArmProcess, runD01VerticalSlice, runEvaluatorProcess,
  type ProcessRequest, type ProcessRunner,
} from "../src/d01/orchestrator.ts";
import { offlineReasoningAdapter } from "../src/d01/reasoning.ts";
import { renderEvidenceHtml } from "../src/d01/report.ts";
import { replayEvidence, replayReasoning } from "../src/d01/replay.ts";
import { validateReasoningReplay } from "../src/d01/replay-core.ts";
import { analyzeRiskSource, inventoryRisk } from "../src/d01/risk.ts";
import { D01_ENGINE } from "../src/d01/runtime.ts";
import { CandidateObservationOutputSchema, D01EvidenceSchema, LegacyGateResultSchema } from "../src/d01/schemas.ts";
import { CARD_IDS } from "../evaluation/arm-visible/BG-D01/contract.ts";
import { VISIBLE_ASSERTIONS } from "../evaluation/arm-visible/BG-D01/visible-assertions.ts";

const root = process.cwd();
const visibleIds = [
  "BG-D01-VIS-001", "BG-D01-VIS-002", "BG-D01-VIS-003", "BG-D01-VIS-004", "BG-D01-VIS-005",
] as const;
const greenGate = LegacyGateResultSchema.parse({
  compileStatus: "passed", compilePassed: true, compileDiagnostics: [], visibleTestIds: visibleIds,
  visibleStatus: "passed", visiblePassed: true, deterministicAssertionFailures: [],
  operationalFailures: [], deterministic: true, operationalFailure: false,
});

function verifyExecution(
  evidence: ReturnType<typeof runD01VerticalSlice>,
  events = evidence.executionEvents,
  proofs = evidence.capabilityProofs,
) {
  return deriveExecutionClaims(
    D01_ENGINE,
    events,
    proofs,
    { "status-quo": evidence.decisions.statusQuo, beyondgreen: evidence.decisions.beyondGreen },
    deriveExpectedExecutionPolicies(D01_ENGINE.descriptor, root, evidence.candidateId),
  );
}

function decisionInput(candidate = ingestCandidate(root, "candidate-a")) {
  return {
    arm: "beyondgreen" as const, candidate, legacyGate: greenGate, riskInventory: null, probePlan: null,
    reasoningEvidence: null, internalChecks: null, operationalError: null, verifierAccessDenied: true as const,
  };
}

test("immutable ingestion binds repository path, candidate ID, and frozen hash", () => {
  const candidate = ingestCandidate(root, "candidate-a");
  assert.equal(candidate.sha256Before, "f46b2ed8c85e8558b5c8812491c09d89530099b0890454415579ea4c5d69e8a5");
  assert.equal(candidate.sha256Before, candidate.expectedSha256);
  assert.throws(() => ingestCandidate(root, "candidate-a", "../outside.ts"), /does not match/);
  assert.throws(() => ingestCandidate(root, "not-a-candidate"), /Invalid option/);
});

test("FixtureDescriptor owns candidates, schemas, manifests, and the five assertion IDs", () => {
  assert.deepEqual(D01_FIXTURE.candidateIds, ["candidate-a", "candidate-b"]);
  assert.deepEqual(VISIBLE_ASSERTIONS.map((assertion) => assertion.id), D01_FIXTURE.armVisible.visibleAssertionIds);
  assert.equal(validateBoundPackage(root, D01_FIXTURE.armVisible), D01_FIXTURE.armVisible.expectedManifestSha256);
  assert.throws(() => validateBoundPackage(root, {
    ...D01_FIXTURE.armVisible,
    expectedManifestSha256: "0".repeat(64),
  }), /manifest digest mismatch/);
});

test("legacy gate keeps compilation and the exact five visible assertions independent", () => {
  const compileOnly = classifyLegacyGate({
    compileDiagnostics: ["synthetic compile diagnostic"], deterministicAssertionFailures: [], operationalFailures: [],
  });
  assert.equal(compileOnly.compilePassed, false);
  assert.equal(compileOnly.visiblePassed, true);
  assert.deepEqual(compileOnly.visibleTestIds, visibleIds);
  const visibleOnly = classifyLegacyGate({
    compileDiagnostics: [], deterministicAssertionFailures: ["BG-D01-VIS-003: failed"], operationalFailures: [],
  });
  assert.equal(visibleOnly.compilePassed, true);
  assert.equal(visibleOnly.visiblePassed, false);
  const operational = classifyLegacyGate({
    compileDiagnostics: [], deterministicAssertionFailures: [], operationalFailures: ["execution unavailable"],
  });
  assert.equal(operational.compileStatus, "passed");
  assert.equal(operational.visibleStatus, "not_run");
  assert.equal(operational.operationalFailure, true);
});

test("verdict policy distinguishes compile, deterministic-visible, and operational failures", () => {
  const base = decisionInput();
  const compile = decide({ ...base, legacyGate: classifyLegacyGate({
    compileDiagnostics: ["diagnostic"], deterministicAssertionFailures: [], operationalFailures: [],
  }) });
  assert.equal(compile.verdict, "reject");
  assert.match(compile.rationale, /Compilation/);
  const visible = decide({ ...base, legacyGate: classifyLegacyGate({
    compileDiagnostics: [], deterministicAssertionFailures: ["assertion"], operationalFailures: [],
  }) });
  assert.equal(visible.verdict, "reject");
  assert.match(visible.rationale, /five-test/);
  const operational = decide({ ...base, legacyGate: classifyLegacyGate({
    compileDiagnostics: [], deterministicAssertionFailures: [], operationalFailures: ["unavailable"],
  }) });
  assert.equal(operational.verdict, "abstain");
  assert.equal(operational.evidenceComplete, false);

  const compileWithOperationalFailure = decide({ ...base, legacyGate: classifyLegacyGate({
    compileDiagnostics: ["diagnostic"], deterministicAssertionFailures: [],
    operationalFailures: ["module unavailable"],
  }) });
  assert.equal(compileWithOperationalFailure.verdict, "reject");
  assert.equal(compileWithOperationalFailure.reasonCode, "compile_failure");
  assert.throws(() => LegacyGateResultSchema.parse({
    ...greenGate,
    compileStatus: "not_run",
    compilePassed: false,
  }), /not-run gate/u);
});

test("BeyondGreen evidence requires exact replay and required-probe bindings", () => {
  const candidate = ingestCandidate(root, "candidate-b");
  const riskInventory = inventoryRisk(root, candidate);
  const reasoning = offlineReasoningAdapter.execute({
    schemaVersion: D01_FIXTURE.schemas.reasoningInput,
    fixtureId: D01_FIXTURE.fixtureId,
    candidateId: candidate.candidateId,
    candidateSha256: candidate.sha256Before,
    riskInventory,
  });
  const unrelatedChecks = {
    oracleFree: true as const,
    deterministic: true,
    oracleAccessAttempted: false as const,
    checks: [{ probeId: "UNRELATED-PROBE", passed: true, observationSha256: "1".repeat(64) }],
    counterexample: null,
    errors: [],
  };
  const mismatchedDecision = decide({
    ...decisionInput(candidate),
    riskInventory,
    probePlan: reasoning.output.probePlan,
    reasoningEvidence: reasoning.evidence,
    internalChecks: unrelatedChecks,
  });
  assert.equal(mismatchedDecision.verdict, "abstain");
  assert.equal(mismatchedDecision.evidenceComplete, false);

  const tamperedEvidence = structuredClone(reasoning.evidence);
  tamperedEvidence.output.probePlan.probes[0]!.id = "DIFFERENT-PROBE";
  const runner: ProcessRunner = () => ({
    status: 0,
    stdout: JSON.stringify({
      evidence: {
        arm: "beyondgreen",
        candidateId: candidate.candidateId,
        candidateSha256: candidate.sha256Before,
        legacyGate: greenGate,
        riskInventory,
        probePlan: reasoning.output.probePlan,
        reasoningEvidence: tamperedEvidence,
        internalChecks: unrelatedChecks,
        operationalError: null,
        verifierAccessDenied: true,
      },
      offlineReplayJsonl: reasoning.replayJsonl,
    }),
  });
  const rejected = runArmProcess(root, "beyondgreen", candidate, createTotalDeadline({ now: () => 0 }), runner);
  assert.equal(rejected.finalized.decision.verdict, "abstain");
  assert.equal(rejected.finalized.decision.operationalError?.errorClass, "arm_invalid_evidence");
});

test("ProbePlan is derived from the same arm-visible invariants without seeded-defect knowledge", () => {
  const plans = D01_FIXTURE.candidateIds.map((candidateId) => {
    const candidate = ingestCandidate(root, candidateId);
    return offlineReasoningAdapter.execute({
      schemaVersion: D01_FIXTURE.schemas.reasoningInput,
      fixtureId: D01_FIXTURE.fixtureId,
      candidateId,
      candidateSha256: candidate.sha256Before,
      riskInventory: inventoryRisk(root, candidate),
    }).output.probePlan;
  });
  assert.deepEqual(
    plans.map((plan) => plan.derivation.invariantContractIds),
    [["BG-D01-INV-ACCUMULATE-REQUESTS"], ["BG-D01-INV-ACCUMULATE-REQUESTS"]],
  );
  assert.ok(plans.every((plan) => plan.derivation.seededDefectKnowledgeUsed === false));
  assert.deepEqual(plans[0]!.probes.map((probe) => probe.id), plans[1]!.probes.map((probe) => probe.id));
});

test("one monotonic deadline preserves the 165-second engine budget and 15-second reserve", () => {
  let now = 1_000;
  const deadline = createTotalDeadline({ now: () => now });
  assert.equal(deadline.remainingEngineMs(), 165_000);
  assert.equal(deadline.remainingTotalMs(), 180_000);
  now += 12_345;
  assert.equal(deadline.remainingEngineMs(), 152_655);
  assert.equal(deadline.remainingTotalMs(), 167_655);
  now = 166_001;
  assert.equal(deadline.remainingEngineMs(), 0);
  assert.equal(deadline.remainingTotalMs(), 14_999);
});

test("each arm deadline starts with an independent full budget", () => {
  let now = 1_000;
  const statusQuo = createTotalDeadline({ now: () => now });
  now += 90_000;
  const beyondGreen = createTotalDeadline({ now: () => now });
  assert.equal(statusQuo.remainingEngineMs(), 75_000);
  assert.equal(beyondGreen.remainingEngineMs(), 165_000);
  assert.equal(beyondGreen.remainingTotalMs(), 180_000);
});

test("arm crash, timeout, invalid JSON, and invalid evidence finalize abstain once", () => {
  const candidate = ingestCandidate(root, "candidate-a");
  const cases = [
    { expected: "arm_crash", result: { status: 1, stdout: "" } },
    { expected: "arm_timeout", result: { status: null, stdout: "", errorCode: "ETIMEDOUT" } },
    { expected: "arm_invalid_json", result: { status: 0, stdout: "not-json" } },
    { expected: "arm_invalid_evidence", result: { status: 0, stdout: "{}" } },
  ] as const;
  for (const item of cases) {
    let calls = 0;
    const runner: ProcessRunner = () => { calls += 1; return item.result; };
    const result = runArmProcess(root, "beyondgreen", candidate, createTotalDeadline({ now: () => 0 }), runner);
    assert.equal(calls, 1);
    assert.equal(result.finalized.decision.verdict, "abstain");
    assert.equal(result.finalized.decision.operationalError?.errorClass, item.expected);
    assert.equal(result.finalized.decision.operationalError?.retryCount, 0);
    assert.doesNotMatch(result.finalized.decision.operationalError?.sanitizedEvidence ?? "", /not-json|\/Users\//u);
  }
});

test("expired engine budget abstains without starting a process", () => {
  const candidate = ingestCandidate(root, "candidate-a");
  let calls = 0;
  const deadline = createTotalDeadline({ now: () => 200_000 }, 0);
  const result = runArmProcess(root, "status-quo", candidate, deadline, () => {
    calls += 1;
    return { status: 0, stdout: "{}" };
  });
  assert.equal(calls, 0);
  assert.equal(result.finalized.decision.operationalError?.errorClass, "arm_timeout");
});

test("evaluator corruption invalidates the run instead of becoming arm uncertainty", () => {
  const candidate = ingestCandidate(root, "candidate-a");
  const decision = finalizeDecision(decide({
    ...decisionInput(candidate), arm: "status-quo", reasoningEvidence: null,
  }));
  assert.throws(() => runEvaluatorProcess(
    root, decision, createTotalDeadline({ now: () => 0 }), () => ({ status: 0, stdout: "{}" }),
  ), D01IntegrityError);
});

test("structural risk analysis detects captured reads and repository-escaping imports", () => {
  const captured = analyzeRiskSource(`
    import { useSignal as createContainer } from "@preact/signals-react";
    const storage = createContainer(0);
    const snapshot = storage.value;
    for (let index = 0; index < 2; index += 1) storage.value = snapshot + 1;
  `, "src/neutral.ts", root, "candidate-a");
  assert.match(captured.risks.find((risk) => risk.category === "ordering")?.evidence ?? "", /captured before/iu);
  assert.equal(captured.externalImport, false);
  const latest = analyzeRiskSource(`
    import { useSignal } from "@preact/signals-react";
    const cell = useSignal(0);
    for (let n = 0; n < 2; n += 1) cell.value = cell.value + 1;
  `,
    "src/neutral.ts", root, "candidate-a");
  assert.match(latest.risks.find((risk) => risk.category === "ordering")?.evidence ?? "", /latest signal value/iu);
  for (const specifier of ["/outside.ts", "file:///outside.ts", "../../outside.ts"]) {
    const result = analyzeRiskSource(`import { x } from ${JSON.stringify(specifier)};`,
      "src/neutral.ts", root, "candidate-a");
    assert.equal(result.externalImport, true);
  }
});

test("provider-neutral offline adapter emits deterministic frozen JSONL and rejects tampering", () => {
  const candidate = ingestCandidate(root, "candidate-b");
  const input = {
    schemaVersion: D01_FIXTURE.schemas.reasoningInput,
    fixtureId: D01_FIXTURE.fixtureId,
    candidateId: candidate.candidateId,
    candidateSha256: candidate.sha256Before,
    riskInventory: inventoryRisk(root, candidate),
  };
  const first = offlineReasoningAdapter.execute(input);
  const second = offlineReasoningAdapter.execute(input);
  assert.equal(first.replayJsonl, second.replayJsonl);
  assert.equal(first.evidence.modelInvocationCount, 0);
  assert.equal(replayReasoning(first.replayJsonl).finalDecisionOutput.evidenceClass, "approved_synthetic_offline");
  assert.equal(validateReasoningReplay(first.replayJsonl).identity.recordCount, 4);
  assert.doesNotMatch(first.replayJsonl, /verifier-only|ground-truth|oracleAcceptedCandidate/iu);
  assert.throws(() => validateReasoningReplay(first.replayJsonl.replace("approved_synthetic_offline", "tampered")));
  assert.throws(() => validateReasoningReplay(first.replayJsonl.replaceAll("\n", "\r\n")));
  assert.throws(() => validateReasoningReplay(` ${first.replayJsonl}`), /JCS-canonical/);
  assert.throws(() => validateReasoningReplay(first.replayJsonl.split("\n").slice(0, 3).join("\n") + "\n"));
  for (const sourcePath of ["src/d01/replay-core.ts", "src/d01/replay.ts"]) {
    const source = readFileSync(sourcePath, "utf8");
    assert.doesNotMatch(source, /node:(?:fs|net|http|https|child_process)|spawn\s*\(|exec(?:File|Sync)?\s*\(|writeFile|fetch\s*\(/u);
  }
});

test("decisions remain immutable before evaluator access", () => {
  const baseline = decide({ ...decisionInput(), arm: "status-quo" });
  const finalized = finalizeDecision(baseline);
  assert.equal(finalized.decision.verdict, "accept");
  assert.equal(Object.isFrozen(finalized.decision), true);
  assert.deepEqual(verifyFinalizedDecision(finalized), finalized);
  assert.throws(() => verifyFinalizedDecision({ ...finalized, decisionSha256: "0".repeat(64) }), /digest mismatch/);
});

function syntheticObservationCapture(
  candidateId: "candidate-a" | "candidate-b",
  candidateSha256: string,
  captureOrdinal: 1 | 2,
  changed = false,
  arm: "status-quo" | "beyondgreen" = "status-quo",
  launchBindingSha256 = sha256(`synthetic-launch:${arm}:${captureOrdinal}:${changed}`),
) {
  const observations = Array.from({ length: 9 }, (_, index) => ({
    cardIds: [...CARD_IDS],
    allocations: Array.from({ length: 300 }, (__, allocationIndex) => (
      changed && index === 8 && allocationIndex === 0 ? 1 : 0
    )),
    selectedIds: [],
    step: 1,
    actionLog: ["synthetic-observation"],
  }));
  return CandidateObservationOutputSchema.parse({
    schemaVersion: D01_FIXTURE.schemas.observations,
    fixtureId: D01_FIXTURE.fixtureId,
    candidateId,
    candidateSha256,
    captureOrdinal,
    observations,
    observationsSha256: sha256(canonicalJson(observations)),
    processEvidence: {
      role: "candidate_observer",
      capabilityProfile: "candidate_observer",
      executionSlot: `${arm}:observer:${captureOrdinal}`,
      launchBindingSha256,
      processIdentitySha256: sha256(`observer:${captureOrdinal}:${changed}`),
      verifierReadAllowed: false,
      verifierReadDenied: true,
      candidateReadAllowed: true,
      candidateReadDenied: false,
    },
  });
}

function syntheticLaunchEvidence(request: ProcessRequest) {
  return {
    schemaVersion: "beyondgreen-runner-capability@1.1.0" as const,
    capabilityProfile: request.capabilityProfile,
    executionSlot: request.executionSlot,
    launchBindingSha256: request.launchBindingSha256,
    sandbox: "macos_sandbox_exec" as const,
    sandboxPolicyCanonical: {
      platform: "darwin" as const,
      executable: "/usr/bin/sandbox-exec" as const,
      profile: "(version 1) (allow default) (deny network*)" as const,
      nodePermissionModelApplied: true as const,
      networkEgressDenied: true as const,
      hostPathInherited: false as const,
    },
    sandboxPolicySha256: request.sandboxPolicySha256,
    nodePermissionModelApplied: true as const,
    allowedReadPathsCanonical: request.allowedReadPathsCanonical,
    allowedReadPathsSha256: request.allowedReadPathsSha256,
    networkEgressDenied: true as const,
    hostPathInherited: false as const,
    childCompleted: true as const,
  };
}

test("two post-decision captures fail closed on nondeterminism before evaluator start", () => {
  const candidate = ingestCandidate(root, "candidate-a");
  const decision = finalizeDecision(decide({ ...decisionInput(candidate), arm: "status-quo" }));
  const first = syntheticObservationCapture(candidate.candidateId, candidate.sha256Before, 1);
  const second = syntheticObservationCapture(candidate.candidateId, candidate.sha256Before, 2, true);
  assert.throws(() => finalizeObservationPair(first, second), /nondeterministic/);
  let calls = 0;
  const runner: ProcessRunner = (request) => {
    calls += 1;
    const captureOrdinal = calls === 1 ? 1 : 2;
    const capture = syntheticObservationCapture(
      candidate.candidateId,
      candidate.sha256Before,
      captureOrdinal,
      calls === 2,
      "status-quo",
      request.launchBindingSha256,
    );
    return {
      status: 0,
      stdout: JSON.stringify(capture),
      launchEvidence: syntheticLaunchEvidence(request),
    };
  };
  assert.throws(() => runEvaluatorProcess(
    root, decision, createTotalDeadline({ now: () => 0 }), runner,
  ), /nondeterministic/);
  assert.equal(calls, 2);
});

test("full candidate-a slice accepts in both arms with K=0", () => {
  const packageOrder: string[] = [];
  const evidence = runD01VerticalSlice(root, "candidate-a", {
    packageValidator: (repositoryRoot, binding) => {
      packageOrder.push(binding.packageKind);
      return validateBoundPackage(repositoryRoot, binding);
    },
  });
  assert.deepEqual(packageOrder, ["arm_visible", "verifier_only"]);
  assert.equal(evidence.decisions.statusQuo.decision.verdict, "accept");
  assert.equal(evidence.decisions.beyondGreen.decision.verdict, "accept");
  assert.equal(evidence.evaluatorResults.statusQuo.correctDecision, true);
  assert.equal(evidence.evaluatorResults.beyondGreen.correctDecision, true);
  assert.equal(evidence.oracleBoundary.k, 0);
  assert.equal(evidence.oracleBoundary.derivedFromMeasuredEvents, true);
  assert.equal(evidence.timing.durationMs >= 0, true);
  assert.equal(evidence.membership, "development");
  assert.equal(evidence.evaluatorResults.statusQuo.falseAlarm, false);
  assert.equal(evidence.evaluatorResults.beyondGreen.falseAlarm, false);
  assert.ok(evidence.decisions.statusQuo.capabilityProofSha256);
  assert.ok(evidence.decisions.beyondGreen.capabilityProofSha256);
  assert.ok(evidence.capabilityProofs.some((proof) => (
    proof.proofSha256 === evidence.decisions.statusQuo.capabilityProofSha256
  )));
  const tamperedEvents = structuredClone(evidence.executionEvents);
  const evaluatorStart = tamperedEvents.find((event) => event.kind === "evaluator_started");
  assert.ok(evaluatorStart);
  evaluatorStart.sequence = 1;
  assert.throws(() => verifyExecution(evidence, tamperedEvents), /monotonic sequence|before both/);

  assert.throws(() => verifyExecution(evidence,
    evidence.executionEvents, evidence.capabilityProofs.slice(1)), /cardinality is incomplete/u);
  const tamperedProofs = structuredClone(evidence.capabilityProofs);
  tamperedProofs[0]!.launch.allowedReadPathsSha256 = "0".repeat(64);
  assert.throws(() => verifyExecution(evidence, evidence.executionEvents, tamperedProofs), /tampered/u);
  const extraPathProofs = structuredClone(evidence.capabilityProofs);
  const extraPathProof = extraPathProofs[0]!;
  extraPathProof.launch.allowedReadPathsCanonical = [
    ...extraPathProof.launch.allowedReadPathsCanonical, "unexpected/extra.ts",
  ].sort();
  extraPathProof.launch.allowedReadPathsSha256 = sha256(canonicalJson(extraPathProof.launch.allowedReadPathsCanonical));
  extraPathProof.launch.launchBindingSha256 = "1".repeat(64);
  extraPathProof.worker.launchBindingSha256 = "1".repeat(64);
  extraPathProof.proofSha256 = sha256(canonicalJson({ launch: extraPathProof.launch, worker: extraPathProof.worker }));
  assert.throws(() => verifyExecution(evidence, evidence.executionEvents, extraPathProofs), /tampered/u);
  const missingPathProofs = structuredClone(evidence.capabilityProofs);
  const missingPathProof = missingPathProofs[0]!;
  missingPathProof.launch.allowedReadPathsCanonical = missingPathProof.launch.allowedReadPathsCanonical.slice(1);
  missingPathProof.launch.allowedReadPathsSha256 = sha256(canonicalJson(missingPathProof.launch.allowedReadPathsCanonical));
  missingPathProof.launch.launchBindingSha256 = "3".repeat(64);
  missingPathProof.worker.launchBindingSha256 = "3".repeat(64);
  missingPathProof.proofSha256 = sha256(canonicalJson({ launch: missingPathProof.launch, worker: missingPathProof.worker }));
  assert.throws(() => verifyExecution(evidence, evidence.executionEvents, missingPathProofs), /tampered/u);
  const changedPathProofs = structuredClone(evidence.capabilityProofs);
  const changedPathProof = changedPathProofs[0]!;
  changedPathProof.launch.allowedReadPathsCanonical[0] = "changed/path.ts";
  changedPathProof.launch.allowedReadPathsCanonical.sort();
  changedPathProof.launch.allowedReadPathsSha256 = sha256(canonicalJson(changedPathProof.launch.allowedReadPathsCanonical));
  changedPathProof.launch.launchBindingSha256 = "4".repeat(64);
  changedPathProof.worker.launchBindingSha256 = "4".repeat(64);
  changedPathProof.proofSha256 = sha256(canonicalJson({ launch: changedPathProof.launch, worker: changedPathProof.worker }));
  assert.throws(() => verifyExecution(evidence, evidence.executionEvents, changedPathProofs), /tampered/u);
  const slotSubstitutedPolicies = structuredClone(evidence.capabilityProofs);
  const observerPolicy = slotSubstitutedPolicies.find((proof) => proof.worker.executionSlot === "status-quo:observer:1")!;
  const evaluatorPolicy = slotSubstitutedPolicies.find((proof) => proof.worker.executionSlot === "status-quo:evaluator")!;
  observerPolicy.launch.allowedReadPathsCanonical = [...evaluatorPolicy.launch.allowedReadPathsCanonical];
  observerPolicy.launch.allowedReadPathsSha256 = evaluatorPolicy.launch.allowedReadPathsSha256;
  observerPolicy.launch.launchBindingSha256 = "5".repeat(64);
  observerPolicy.worker.launchBindingSha256 = "5".repeat(64);
  observerPolicy.proofSha256 = sha256(canonicalJson({ launch: observerPolicy.launch, worker: observerPolicy.worker }));
  assert.throws(() => verifyExecution(evidence, evidence.executionEvents, slotSubstitutedPolicies), /tampered/u);
  const contradictoryProofs = structuredClone(evidence.capabilityProofs);
  const evaluatorProof = contradictoryProofs.find((proof) => proof.worker.role === "evaluator");
  assert.ok(evaluatorProof);
  evaluatorProof.worker.candidateReadAllowed = true;
  evaluatorProof.worker.candidateReadDenied = false;
  evaluatorProof.proofSha256 = sha256(canonicalJson({ launch: evaluatorProof.launch, worker: evaluatorProof.worker }));
  assert.throws(() => verifyExecution(evidence, evidence.executionEvents, contradictoryProofs), /contradicts/u);
  const duplicateIdentityProofs = structuredClone(evidence.capabilityProofs);
  duplicateIdentityProofs[1]!.worker.processIdentitySha256 = duplicateIdentityProofs[0]!.worker.processIdentitySha256;
  duplicateIdentityProofs[1]!.proofSha256 = sha256(canonicalJson({
    launch: duplicateIdentityProofs[1]!.launch,
    worker: duplicateIdentityProofs[1]!.worker,
  }));
  assert.throws(() => verifyExecution(evidence, evidence.executionEvents, duplicateIdentityProofs), /inconsistent process identity/u);
  const missingEvent = structuredClone(evidence.executionEvents)
    .filter((event, index) => !(event.kind === "observation_completed" && index > 0));
  missingEvent.forEach((event, index) => { event.sequence = index + 1; });
  assert.throws(() => verifyExecution(evidence, missingEvent), /cardinality is incomplete/u);
  const wrongEvaluatorDecision = structuredClone(evidence.executionEvents);
  const beyondEvaluatorEvent = wrongEvaluatorDecision.find((event) => (
    event.arm === "beyondgreen" && event.kind === "evaluator_started"
  ));
  assert.ok(beyondEvaluatorEvent);
  beyondEvaluatorEvent.decisionSha256 = evidence.decisions.statusQuo.decisionSha256;
  assert.throws(() => verifyExecution(evidence, wrongEvaluatorDecision), /state machine/u);
  const arbitraryConsistentDecision = structuredClone(evidence.executionEvents);
  for (const event of arbitraryConsistentDecision.filter((item) => item.arm === "beyondgreen").slice(1)) {
    event.decisionSha256 = "2".repeat(64);
  }
  assert.throws(() => verifyExecution(evidence, arbitraryConsistentDecision), /state machine/u);
  const wrongLaunchBinding = structuredClone(evidence.capabilityProofs);
  wrongLaunchBinding[0]!.worker.launchBindingSha256 = "0".repeat(64);
  wrongLaunchBinding[0]!.proofSha256 = sha256(canonicalJson({
    launch: wrongLaunchBinding[0]!.launch,
    worker: wrongLaunchBinding[0]!.worker,
  }));
  assert.throws(() => verifyExecution(evidence, evidence.executionEvents, wrongLaunchBinding), /tampered/u);
  assert.equal(evidence.candidate.unchanged, true);
});

test("full candidate-b slice preserves false green and rejects by arm-owned evidence", () => {
  const evidence = runD01VerticalSlice(root, "candidate-b");
  assert.equal(evidence.decisions.statusQuo.decision.verdict, "accept");
  assert.equal(evidence.decisions.beyondGreen.decision.verdict, "reject");
  assert.equal(evidence.evaluatorResults.statusQuo.correctDecision, false);
  assert.equal(evidence.evaluatorResults.beyondGreen.correctDecision, true);
  assert.equal(evidence.resources.modelStatus, "not_applicable_not_invoked");
  assert.equal(evidence.resources.modelInvocationCount, 0);
  const counterexample = evidence.decisions.beyondGreen.decision.internalChecks?.counterexample;
  assert.equal(counterexample?.differingItems.length, 5);
  assert.equal(counterexample?.omittedDifferingItemCount, 295);
});

test("static HTML contains decision-critical evidence and escapes every dynamic string", () => {
  const evidence = runD01VerticalSlice(root, "candidate-b");
  const html = renderEvidenceHtml(evidence);
  for (const required of [
    "not an official or scored run", "Candidate identity", "Frozen legacy gate", "Risk inventory",
    "Oracle-free ProbePlan", "Post-decision independent evaluator", "Offline replay identity",
    "Resources and limitations", "BG-D01-VIS-005", "not_applicable_not_invoked",
  ]) assert.match(html, new RegExp(required, "u"));
  const injected = structuredClone(evidence);
  injected.decisions.beyondGreen.decision.rationale = "<script>alert('x')</script>";
  const escaped = renderEvidenceHtml(injected);
  assert.doesNotMatch(escaped, /<script>/u);
  assert.match(escaped, /&lt;script&gt;/u);
  assert.throws(() => renderEvidenceHtml({ ...evidence, officialOrScored: true }));
});

test("offline evidence replay rebuilds JSON and HTML in memory and rejects report tampering", () => {
  const evidence = runD01VerticalSlice(root, "candidate-b");
  const json = `${JSON.stringify(evidence, null, 2)}\n`;
  const html = renderEvidenceHtml(evidence);
  const replayJsonl = evidence.offlineReplayJsonl;
  assert.ok(replayJsonl);
  const replayed = replayEvidence(json, html, replayJsonl, D01_ENGINE);
  assert.equal(replayed.reportArtifactsMatched, true);
  assert.throws(() => replayEvidence(json, `${html}tamper`, replayJsonl, D01_ENGINE));
  const unbound = structuredClone(evidence);
  unbound.evaluatorResults.beyondGreen.evaluatorInputSha256 = "0".repeat(64);
  assert.throws(() => replayEvidence(
    `${JSON.stringify(unbound, null, 2)}\n`, html, replayJsonl, D01_ENGINE,
  ), /not bound/);
  const crossRole = structuredClone(evidence);
  crossRole.observationPairs.statusQuo.first.processEvidence = structuredClone(
    crossRole.evaluatorResults.statusQuo.processEvidence,
  ) as never;
  assert.throws(() => D01EvidenceSchema.parse(crossRole), /positionally bound/u);
  for (const field of ["reasonCorrectReject", "oracleAcceptedCandidate"] as const) {
    const tampered = structuredClone(evidence);
    tampered.evaluatorResults.beyondGreen[field] = !tampered.evaluatorResults.beyondGreen[field];
    assert.throws(() => replayEvidence(
      `${JSON.stringify(tampered, null, 2)}\n`, renderEvidenceHtml(tampered), replayJsonl, D01_ENGINE,
    ), /not bound/u);
  }
});
