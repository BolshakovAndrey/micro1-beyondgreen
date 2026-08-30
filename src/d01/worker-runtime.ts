/**
 * Implements role-specific worker flows over injected engine capabilities so arm and
 * observer processes cannot acquire evaluator-only operations by import reachability.
 */
import path from "node:path";

import { canonicalJson, sha256 } from "./canonical-json.ts";
import { createWorkerProcessEvidence } from "./capability.ts";
import {
  executeFixtureEngineBinding, type FixtureEngineBindings, type FixtureEvaluatorEngineBindings,
} from "./engine.ts";
import type {
  ArmId, CandidateId, InternalCheckResult, LegacyGateResult, ProbePlan, ReasoningEvidence,
} from "./schemas.ts";
import type { MuseumBoardComponent } from "../../evaluation/arm-visible/BG-D01/contract.ts";

/** Run one arm through only the capabilities supplied by an injected fixture engine. */
export async function runFixtureArmWorker(
  engine: FixtureEngineBindings,
  repositoryRoot: string,
  arm: ArmId,
  candidateId: CandidateId,
  launchBindingSha256: string,
) {
  const descriptor = engine.descriptor;
  engine.runtime.validatePackage(repositoryRoot, descriptor.armVisible);
  const candidate = engine.runtime.ingestCandidate(repositoryRoot, candidateId);
  const candidatePath = path.resolve(repositoryRoot, engine.runtime.describeCandidate(candidateId).sourcePath);
  const compileDiagnostics = executeFixtureEngineBinding(engine, {
    kind: "check_compile", arguments: [candidatePath],
  }) as string[];
  const verifierAccessDenied = executeFixtureEngineBinding(engine, {
    kind: "check_verifier_denied", arguments: [repositoryRoot],
  }) as boolean;
  const processEvidence = createWorkerProcessEvidence({
    role: "arm", capabilityProfile: "arm_visible", executionSlot: `${arm}:arm`, launchBindingSha256,
    verifierReadAllowed: false, verifierReadDenied: verifierAccessDenied,
    candidateReadAllowed: true, candidateReadDenied: false,
  });
  let module: { MuseumBoard: MuseumBoardComponent };
  try {
    module = await engine.runtime.importCandidate(repositoryRoot, candidateId) as { MuseumBoard: MuseumBoardComponent };
  }
  catch {
    return {
      evidence: {
        arm, candidateId, candidateSha256: candidate.sha256Before,
        legacyGate: executeFixtureEngineBinding(engine, { kind: "check_classify", arguments: [{
          compileDiagnostics, deterministicAssertionFailures: [], operationalFailures: ["Candidate module could not be loaded."],
        }] }) as LegacyGateResult,
        riskInventory: null, probePlan: null, reasoningEvidence: null, internalChecks: null,
        operationalError: null, verifierAccessDenied,
      },
      offlineReplayJsonl: null,
      processEvidence,
    };
  }
  const legacyGate = await executeFixtureEngineBinding(engine, {
    kind: "check_visible", arguments: [module.MuseumBoard, candidatePath, compileDiagnostics],
  }) as LegacyGateResult;
  const riskInventory = arm === "beyondgreen" ? engine.runtime.inventoryRisk(repositoryRoot, candidate) : null;
  const reasoning = riskInventory ? executeFixtureEngineBinding(engine, { kind: "reason", value: {
    schemaVersion: descriptor.schemas.reasoningInput,
    fixtureId: descriptor.fixtureId,
    candidateId,
    candidateSha256: candidate.sha256Before,
    riskInventory,
  } }) as Readonly<{
    output: Readonly<{ probePlan: ProbePlan }>;
    evidence: ReasoningEvidence;
    replayJsonl: string;
  }> : null;
  const probePlan = reasoning?.output.probePlan ?? null;
  const internalChecks = probePlan ? await executeFixtureEngineBinding(engine, {
    kind: "check_internal", arguments: [module.MuseumBoard, probePlan],
  }) as InternalCheckResult : null;
  return {
    evidence: {
      arm, candidateId, candidateSha256: candidate.sha256Before, legacyGate, riskInventory, probePlan,
      reasoningEvidence: reasoning?.evidence ?? null, internalChecks, operationalError: null, verifierAccessDenied,
    },
    offlineReplayJsonl: reasoning?.replayJsonl ?? null,
    processEvidence,
  };
}

/** Capture one post-decision observation through an injected fixture engine. */
export async function runFixtureObservationWorker(
  engine: FixtureEngineBindings,
  repositoryRoot: string,
  candidateId: CandidateId,
  captureOrdinal: 1 | 2,
  arm: ArmId,
  launchBindingSha256: string,
) {
  const descriptor = engine.descriptor;
  const candidate = engine.runtime.ingestCandidate(repositoryRoot, candidateId);
  const verifierAccessDenied = executeFixtureEngineBinding(engine, {
    kind: "check_verifier_denied", arguments: [repositoryRoot],
  }) as boolean;
  const processEvidence = createWorkerProcessEvidence({
    role: "candidate_observer", capabilityProfile: "candidate_observer",
    executionSlot: `${arm}:observer:${captureOrdinal}`, launchBindingSha256,
    verifierReadAllowed: false, verifierReadDenied: verifierAccessDenied,
    candidateReadAllowed: true, candidateReadDenied: false,
  });
  const observations = await engine.runtime.captureObservations(repositoryRoot, candidateId);
  return executeFixtureEngineBinding(engine, { kind: "parse_observation", value: {
    schemaVersion: descriptor.schemas.observations,
    fixtureId: descriptor.fixtureId,
    candidateId,
    candidateSha256: candidate.sha256Before,
    captureOrdinal,
    observations,
    observationsSha256: sha256(canonicalJson(observations)),
    processEvidence,
  } });
}

/** Evaluate a finalized decision through only the injected verifier capabilities. */
export async function runFixtureEvaluatorWorker(
  engine: FixtureEvaluatorEngineBindings,
  repositoryRoot: string,
  serialized: string,
  requestedArmInput: unknown,
  launchBindingSha256: string,
) {
  const envelope = JSON.parse(serialized) as { decision?: unknown; observations?: any };
  const finalized = engine.runtime.verifyFinalizedDecision(envelope.decision);
  const requestedArm = executeFixtureEngineBinding(engine, { kind: "parse_arm", value: requestedArmInput }) as ArmId;
  if (requestedArm !== finalized.decision.arm || !launchBindingSha256) {
    throw new Error("Evaluator launch identity is not bound to the finalized arm decision.");
  }
  const processEvidence = engine.runtime.createEvaluatorProcessEvidence(
    repositoryRoot, `${requestedArm}:evaluator`, launchBindingSha256,
  );
  const observationPair = engine.runtime.finalizeObservationPair(
    envelope.observations?.first, envelope.observations?.second,
  );
  if (observationPair.first.candidateId !== finalized.decision.candidateId
    || observationPair.first.candidateSha256 !== finalized.decision.candidateSha256) {
    throw new Error("Candidate observations are not bound to the finalized decision.");
  }
  return executeFixtureEngineBinding(engine, { kind: "parse_evaluator", value: engine.runtime.evaluateFinalized({
    repositoryRoot, finalized, observations: observationPair, requestedArm, launchBindingSha256, processEvidence,
  }) });
}
