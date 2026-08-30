/**
 * Applies the fail-closed D01 verdict policy, freezes decisions before evaluation,
 * and binds deterministic post-decision observations to evaluator input.
 */
import { canonicalJson, deepFreeze, sha256 } from "./canonical-json.ts";
import { D01_FIXTURE } from "./fixture.ts";
import {
  ArmDecisionSchema,
  CandidateObservationOutputSchema,
  FinalizedDecisionSchema,
  PostDecisionObservationPairSchema,
  type ArmDecision,
  type ArmId,
  type FinalizedDecision,
  type ImmutableCandidateRef,
  type InternalCheckResult,
  type LegacyGateResult,
  type ProbePlan,
  type ReasoningEvidence,
  type RiskInventory,
  type OperationalError,
  type CandidateObservationOutput,
  type PostDecisionObservationPair,
} from "./schemas.ts";

type DecisionInput = Readonly<{
  arm: ArmId;
  candidate: ImmutableCandidateRef;
  legacyGate: LegacyGateResult;
  riskInventory: RiskInventory | null;
  probePlan: ProbePlan | null;
  reasoningEvidence: ReasoningEvidence | null;
  internalChecks: InternalCheckResult | null;
  operationalError?: OperationalError | null;
  verifierAccessDenied: true;
}>;

/** Apply the frozen fail-closed verdict policy without any evaluator information. */
export function decide(input: DecisionInput): ArmDecision {
  let evidenceComplete = input.legacyGate.deterministic && input.verifierAccessDenied;
  let verdict: "accept" | "reject" | "abstain" = "abstain";
  let reasonCode: "operational_inconclusive" | "compile_failure" | "visible_test_failure"
    | "visible_gate_green" | "incomplete_beyondgreen_evidence" | "ordering_contract_violation"
    | "all_checks_green" = "operational_inconclusive";
  let rationale = "Required evidence is incomplete or operationally inconclusive.";

  if (input.legacyGate.compileStatus === "failed") {
    evidenceComplete = true;
    verdict = "reject";
    reasonCode = "compile_failure";
    rationale = "Compilation diagnostics prove a blocking candidate failure; visible-test status is reported independently.";
  }
  else if (input.legacyGate.compileStatus !== "passed") {
    evidenceComplete = false;
  }
  else if (input.legacyGate.visibleStatus === "failed") {
    evidenceComplete = true;
    verdict = "reject";
    reasonCode = "visible_test_failure";
    rationale = "A deterministic assertion in the frozen five-test visible legacy gate proves a blocking failure.";
  }
  else if (input.legacyGate.visibleStatus !== "passed" || input.operationalError
    || input.legacyGate.operationalFailure || !input.legacyGate.deterministic) {
    evidenceComplete = false;
  }
  else if (input.arm === "status-quo") {
    evidenceComplete = true;
    verdict = "accept";
    reasonCode = "visible_gate_green";
    rationale = "Compilation and all five frozen visible legacy tests pass; status quo performs no additional checks.";
  }
  else if (!input.riskInventory || !input.probePlan || !input.reasoningEvidence || !input.internalChecks
    || input.riskInventory.unsupportedSyntax || input.riskInventory.externalImport
    || input.internalChecks.errors.length > 0 || !input.internalChecks.deterministic
    || !requiredProbeResultsMatch(input.probePlan, input.internalChecks)) {
    evidenceComplete = false;
    reasonCode = "incomplete_beyondgreen_evidence";
  }
  else if (input.internalChecks.checks.some((check) => !check.passed)) {
    evidenceComplete = true;
    verdict = "reject";
    reasonCode = "ordering_contract_violation";
    rationale = "The arm-owned accumulation probe proves that one allocate-twice event loses a requested update.";
  }
  else {
    evidenceComplete = true;
    verdict = "accept";
    reasonCode = "all_checks_green";
    rationale = "Compilation, all five visible tests, and every required arm-owned probe pass.";
  }

  return ArmDecisionSchema.parse({
    schemaVersion: D01_FIXTURE.schemas.armDecision,
    fixtureId: D01_FIXTURE.fixtureId,
    candidateId: input.candidate.candidateId,
    arm: input.arm,
    attemptOrdinal: 1,
    evidenceComplete,
    verdict,
    reasonCode,
    rationale,
    candidateSha256: input.candidate.sha256Before,
    legacyGate: input.legacyGate,
    riskInventory: input.riskInventory,
    probePlan: input.probePlan,
    reasoningEvidence: input.reasoningEvidence,
    internalChecks: input.internalChecks,
    operationalError: input.operationalError ?? null,
    verifierAccessDenied: input.verifierAccessDenied,
    evaluatorFeedbackRoundsBeforeDecision: 0,
    finalizedBeforeEvaluator: true,
  });
}

/** Require exactly one result for every required probe and no unrelated result. */
function requiredProbeResultsMatch(plan: ProbePlan, checks: InternalCheckResult): boolean {
  const requiredIds = plan.probes.filter((probe) => probe.required).map((probe) => probe.id).sort();
  const actualIds = checks.checks.map((check) => check.probeId).sort();
  return requiredIds.length === actualIds.length
    && requiredIds.every((probeId, index) => probeId === actualIds[index]);
}

/** Freeze and hash the complete decision before an evaluator process may start. */
export function finalizeDecision(decisionInput: ArmDecision, capabilityProofSha256: string | null = null): FinalizedDecision {
  const decision = deepFreeze(ArmDecisionSchema.parse(decisionInput));
  return deepFreeze(FinalizedDecisionSchema.parse({
    decision,
    capabilityProofSha256,
    decisionSha256: sha256(canonicalJson({ decision, capabilityProofSha256 })),
  }));
}

/** Verify that a received immutable decision envelope still matches its digest. */
export function verifyFinalizedDecision(input: unknown): FinalizedDecision {
  const finalized = FinalizedDecisionSchema.parse(input);
  if (sha256(canonicalJson({
    decision: finalized.decision,
    capabilityProofSha256: finalized.capabilityProofSha256,
  })) !== finalized.decisionSha256) {
    throw new Error("Finalized decision digest mismatch.");
  }
  return deepFreeze(finalized);
}

function verifyObservationCapture(input: CandidateObservationOutput): CandidateObservationOutput {
  const capture = CandidateObservationOutputSchema.parse(input);
  if (sha256(canonicalJson(capture.observations)) !== capture.observationsSha256) {
    throw new Error("Candidate observation digest mismatch.");
  }
  return capture;
}

/** Bind two independent post-decision captures and fail closed on any divergence. */
export function finalizeObservationPair(
  firstInput: CandidateObservationOutput,
  secondInput: CandidateObservationOutput,
): PostDecisionObservationPair {
  const first = verifyObservationCapture(firstInput);
  const second = verifyObservationCapture(secondInput);
  if (first.captureOrdinal !== 1 || second.captureOrdinal !== 2
    || first.fixtureId !== second.fixtureId || first.candidateId !== second.candidateId
    || first.candidateSha256 !== second.candidateSha256
    || first.observationsSha256 !== second.observationsSha256
    || canonicalJson(first.observations) !== canonicalJson(second.observations)) {
    throw new Error("Post-decision candidate observations are nondeterministic.");
  }
  const pairSha256 = sha256(canonicalJson({ first, second }));
  return deepFreeze(PostDecisionObservationPairSchema.parse({
    first,
    second,
    deterministic: true,
    observationsSha256: first.observationsSha256,
    pairSha256,
  }));
}

/** Verify the observation pair and bind evaluator input to one immutable decision. */
export function evaluatorInputSha256(
  decisionInput: unknown,
  pairInput: unknown,
  evaluatorManifestSha256: string,
): string {
  const decision = verifyFinalizedDecision(decisionInput);
  const pair = PostDecisionObservationPairSchema.parse(pairInput);
  if (sha256(canonicalJson({ first: pair.first, second: pair.second })) !== pair.pairSha256
    || pair.first.candidateId !== decision.decision.candidateId
    || pair.first.candidateSha256 !== decision.decision.candidateSha256) {
    throw new Error("Observation pair is not bound to the finalized decision.");
  }
  return sha256(canonicalJson({
    decisionSha256: decision.decisionSha256,
    observationPairSha256: pair.pairSha256,
    evaluatorManifestSha256,
  }));
}
