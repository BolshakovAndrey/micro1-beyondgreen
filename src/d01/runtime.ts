/** Composes the D01 descriptor and bounded implementations into the sole production engine. */
import {
  assertVerifierAccessDenied,
  classifyLegacyGate,
  compileCandidate,
  runInternalChecks,
  runVisibleLegacyGate,
} from "./arm-checks.ts";
import { defineFixtureEngine } from "./engine.ts";
import { D01_FIXTURE } from "./fixture.ts";
import { offlineReasoningAdapter } from "./reasoning.ts";
import { replayEvidence } from "./replay.ts";
import { validateReasoningReplay } from "./replay-core.ts";
import { buildReportArtifacts } from "./report.ts";
import { D01_RUNTIME_BINDINGS } from "./worker-bindings.ts";
import {
  ArmWorkerOutputSchema,
  ArmIdSchema,
  CandidateIdSchema,
  CandidateObservationOutputSchema,
  CapabilityProofSchema,
  D01EvidenceSchema,
  EvaluatorResultSchema,
  ExecutionEventSchema,
} from "./schemas.ts";

const D01_EXECUTION_VALIDATION = Object.freeze({
  descriptor: D01_FIXTURE,
  schemas: Object.freeze({
    parseExecutionEvent: (value: unknown) => ExecutionEventSchema.parse(value),
    parseCapabilityProof: (value: unknown) => CapabilityProofSchema.parse(value),
  }),
});

/** The only real fixture engine instance; D01 supplies data and bounded runtime contracts. */
export const D01_ENGINE = defineFixtureEngine({
  descriptor: D01_FIXTURE,
  schemas: {
    parseCandidateId: (value: unknown) => CandidateIdSchema.parse(value),
    parseArmId: (value: unknown) => ArmIdSchema.parse(value),
    parseArmWorkerOutput: (value: unknown) => ArmWorkerOutputSchema.parse(value),
    parseObservation: (value: unknown) => CandidateObservationOutputSchema.parse(value),
    parseEvaluatorResult: (value: unknown) => EvaluatorResultSchema.parse(value),
    parseExecutionEvent: (value: unknown) => ExecutionEventSchema.parse(value),
    parseCapabilityProof: (value: unknown) => CapabilityProofSchema.parse(value),
    parseEvidence: (value: unknown) => D01EvidenceSchema.parse(value),
  },
  armChecks: {
    classify: classifyLegacyGate,
    compile: compileCandidate,
    runVisible: runVisibleLegacyGate,
    runInternal: runInternalChecks,
    assertVerifierDenied: assertVerifierAccessDenied,
  },
  reasoning: { execute: (value: unknown) => offlineReasoningAdapter.execute(value as never) },
  evaluator: { workerPath: D01_FIXTURE.scripts.evaluatorWorker },
  runtime: D01_RUNTIME_BINDINGS,
  replay: {
    validateReasoning: validateReasoningReplay,
    replayEvidence: (evidenceJson: string, evidenceHtml: string, replayJsonl: string) => (
      replayEvidence(evidenceJson, evidenceHtml, replayJsonl, D01_EXECUTION_VALIDATION)
    ),
  },
  report: { build: buildReportArtifacts },
});
