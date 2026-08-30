/** Rebuilds D01 reasoning and report artifacts in memory and rejects any replay drift. */
import { validateReasoningReplay } from "./replay-core.ts";
import { buildReportArtifacts } from "./report.ts";
import { evaluatorInputSha256, finalizeObservationPair, verifyFinalizedDecision } from "./decision.ts";
import { deriveExecutionClaims } from "./execution.ts";
import { D01EvidenceSchema } from "./schemas.ts";
import { D01_FIXTURE } from "./fixture.ts";
import type { ExecutionValidationBindings } from "./execution.ts";
import { deriveExpectedExecutionPolicies } from "./capability.ts";

/**
 * Return the one validated final reasoning decision from a frozen JSONL replay.
 * This pure boundary owns no filesystem, network, subprocess, clock, or write capability.
 */
export function replayReasoning(jsonl: string) {
  const replay = validateReasoningReplay(jsonl);
  return Object.freeze({
    schemaVersion: D01_FIXTURE.schemas.reasoningReplayResult,
    replayIdentity: replay.identity,
    finalDecisionOutput: replay.output,
  });
}

/** Rebuild and compare submitted D01 JSON/HTML entirely in memory. */
export function replayEvidence(
  evidenceJson: string,
  evidenceHtml: string,
  replayJsonl: string,
  engine: ExecutionValidationBindings,
) {
  const evidence = D01EvidenceSchema.parse(JSON.parse(evidenceJson));
  for (const arm of ["statusQuo", "beyondGreen"] as const) {
    const decision = verifyFinalizedDecision(evidence.decisions[arm]);
    const pair = evidence.observationPairs[arm];
    const verifiedPair = finalizeObservationPair(pair.first, pair.second);
    const evaluator = evidence.evaluatorResults[arm];
    const verdict = decision.decision.verdict;
    const expectedCorrectDecision = (verdict === "accept" && evaluator.groundTruth === "preserving")
      || (verdict === "reject" && evaluator.groundTruth === "false_green");
    const expectedFalseAlarm = evaluator.groundTruth === "preserving"
      && (verdict === "reject" || verdict === "abstain");
    const expectedOracleAcceptedCandidate = evaluator.groundTruth === "preserving";
    const expectedReasonCorrectReject = verdict === "reject"
      && evaluator.groundTruth === "false_green"
      && decision.decision.reasonCode === "ordering_contract_violation";
    if (verifiedPair.pairSha256 !== pair.pairSha256
      || evaluator.decisionSha256 !== decision.decisionSha256
      || evaluator.observationPairSha256 !== pair.pairSha256
      || evaluator.evaluatorManifestSha256 !== evidence.verifierOnlyManifestSha256
      || evaluator.evaluatorInputSha256 !== evaluatorInputSha256(
        decision, pair, evidence.verifierOnlyManifestSha256,
      ) || evaluator.correctDecision !== expectedCorrectDecision
      || evaluator.oracleAcceptedCandidate !== expectedOracleAcceptedCandidate
      || evaluator.reasonCorrectReject !== expectedReasonCorrectReject
      || evaluator.falseAlarm !== expectedFalseAlarm
      || evaluator.completedDecision !== (decision.decision.evidenceComplete && verdict !== "abstain")) {
      throw new Error("Evaluator result is not bound to replayed decision and observation evidence.");
    }
  }
  const execution = deriveExecutionClaims(
    engine,
    evidence.executionEvents,
    evidence.capabilityProofs,
    { "status-quo": evidence.decisions.statusQuo, beyondgreen: evidence.decisions.beyondGreen },
    deriveExpectedExecutionPolicies(engine.descriptor, ".", evidence.candidateId),
  );
  if (JSON.stringify(execution.order) !== JSON.stringify(evidence.executionOrder)
    || JSON.stringify(execution.claims) !== JSON.stringify(evidence.oracleBoundary)) {
    throw new Error("Measured execution events do not reproduce the stored oracle-boundary claims.");
  }
  if (evidence.offlineReplayJsonl !== replayJsonl) {
    throw new Error("Submitted replay does not match the replay embedded in D01 evidence.");
  }
  const reasoning = replayReasoning(replayJsonl);
  if (reasoning.replayIdentity.replaySha256 !== evidence.replayIdentity?.replaySha256) {
    throw new Error("Submitted replay identity does not match D01 evidence.");
  }
  const rebuilt = buildReportArtifacts(evidence);
  if (rebuilt.json !== evidenceJson || rebuilt.html !== evidenceHtml) {
    throw new Error("Submitted D01 report artifacts do not reproduce in memory.");
  }
  return Object.freeze({
    schemaVersion: D01_FIXTURE.schemas.evidenceReplayResult,
    replayIdentity: reasoning.replayIdentity,
    evidenceJsonSha256: rebuilt.canonicalJsonSha256,
    evidenceHtmlSha256: rebuilt.htmlSha256,
    reportArtifactsMatched: true as const,
  });
}
