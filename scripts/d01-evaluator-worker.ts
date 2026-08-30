#!/usr/bin/env node
/** Hosts the verifier-only D01 evaluator entrypoint after arm decisions are immutable. */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { evaluateCanonicalObservations } from "../evaluation/verifier-only/BG-D01/canonical-driver.ts";
import { createEvaluatorProcessEvidence, type ExecutionSlot } from "../src/d01/capability.ts";
import { sha256 } from "../src/d01/canonical-json.ts";
import type { FixtureEvaluatorEngineBindings } from "../src/d01/engine.ts";
import { D01_FIXTURE } from "../src/d01/fixture.ts";
import { D01_ENGINE } from "../src/d01/runtime.ts";
import { runFixtureEvaluatorWorker } from "../src/d01/worker-runtime.ts";
import type { CandidateId, WorkerProcessEvidence } from "../src/d01/schemas.ts";

/**
 * Evaluates an immutable arm decision only after its two observations are finalized.
 * The worker rejects mismatched arm, launch, candidate, or observation bindings
 * before invoking the injected verifier-only evaluator and validating its result.
 */
export { runFixtureEvaluatorWorker } from "../src/d01/worker-runtime.ts";

async function readStandardInput(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

/** Compose oracle access only in the evaluator process after arm decisions are immutable. */
const D01_EVALUATOR_ENGINE: FixtureEvaluatorEngineBindings = Object.freeze({
  ...D01_ENGINE,
  runtime: Object.freeze({
    ...D01_ENGINE.runtime,
    evaluateFinalized: (input: Parameters<FixtureEvaluatorEngineBindings["runtime"]["evaluateFinalized"]>[0]) => {
      const finalized = D01_ENGINE.runtime.verifyFinalizedDecision(input.finalized);
      const observations = D01_ENGINE.runtime.finalizeObservationPair(
        input.observations.first, input.observations.second,
      );
      const processEvidence = input.processEvidence as WorkerProcessEvidence;
      const groundTruthDocument = JSON.parse(readFileSync(
        path.resolve(input.repositoryRoot, D01_FIXTURE.verifierOnly.groundTruthPath), "utf8",
      )) as { candidates: Record<CandidateId, "preserving" | "false_green"> };
      const groundTruth = groundTruthDocument.candidates[finalized.decision.candidateId];
      const oracle = evaluateCanonicalObservations(observations.first.observations);
      if (oracle.accepted !== (groundTruth === "preserving")) {
        throw new Error("Frozen evaluator and ground truth disagree.");
      }
      const verdict = finalized.decision.verdict;
      const evaluatorManifestSha256 = sha256(readFileSync(
        path.resolve(input.repositoryRoot, D01_FIXTURE.verifierOnly.manifestPath),
      ));
      return {
        schemaVersion: D01_FIXTURE.schemas.evaluatorResult,
        fixtureId: D01_FIXTURE.fixtureId,
        candidateId: finalized.decision.candidateId,
        arm: finalized.decision.arm,
        decisionSha256: finalized.decisionSha256,
        oracleAcceptedCandidate: oracle.accepted,
        groundTruth,
        correctDecision: (verdict === "accept" && groundTruth === "preserving")
          || (verdict === "reject" && groundTruth === "false_green"),
        reasonCorrectReject: verdict === "reject" && groundTruth === "false_green"
          && finalized.decision.reasonCode === "ordering_contract_violation",
        completedDecision: finalized.decision.evidenceComplete && verdict !== "abstain",
        falseAlarm: groundTruth === "preserving" && (verdict === "reject" || verdict === "abstain"),
        membership: D01_FIXTURE.membership,
        evaluatedAfterDecision: true,
        feedbackRoundsBeforeDecision: 0,
        evaluatorManifestSha256,
        observationPairSha256: observations.pairSha256,
        evaluatorInputSha256: D01_ENGINE.runtime.evaluatorInputSha256(
          finalized, observations, evaluatorManifestSha256,
        ),
        processEvidence,
      };
    },
    createEvaluatorProcessEvidence: (
      repositoryRoot: string, executionSlot: string, launchBindingSha256: string,
    ) => createEvaluatorProcessEvidence(
      repositoryRoot, executionSlot as ExecutionSlot, launchBindingSha256,
    ),
  }),
});

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  readStandardInput().then((input) => runFixtureEvaluatorWorker(
    D01_EVALUATOR_ENGINE, process.cwd(), input, process.argv[2], process.argv[3] ?? "",
  )).then(
    (result) => process.stdout.write(`${JSON.stringify(result)}\n`),
    () => {
      process.stderr.write("EVALUATOR_WORKER_FAILED\n");
      process.exitCode = 1;
    },
  );
}
