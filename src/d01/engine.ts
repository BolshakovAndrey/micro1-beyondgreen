/**
 * Defines the fixture-injected engine boundary that keeps orchestration generic while
 * exposing verifier-only operations solely through a narrower evaluator binding.
 */
import type { FinalizedDecision } from "./schemas.ts";

/** Declares all fixture-owned data, paths, schemas, cardinalities, and run identity. */
export type EngineDescriptor = Readonly<{
  fixtureId: string;
  membership: "development" | "held_out";
  candidateIds: readonly [string, ...string[]];
  candidates: Readonly<Record<string, Readonly<{
    sourcePath: string;
    manifestPath: string;
    packageId: string;
    expectedSourceSha256: string;
  }>>>;
  armVisible: Readonly<{
    rootPath: string;
    manifestPath: string;
    packageId: string;
    packageKind: "arm_visible";
    sourcePaths: readonly string[];
    visibleAssertionIds: readonly string[];
    expectedManifestSha256: string;
    expectedPackageSha256: string;
  }>;
  verifierOnly: Readonly<{
    rootPath: string;
    manifestPath: string;
    packageId: string;
    packageKind: "verifier_only";
    sourcePaths: readonly string[];
    groundTruthPath: string;
    expectedManifestSha256: string;
    expectedPackageSha256: string;
  }>;
  scripts: Readonly<{ armWorker: string; observerWorker: string; evaluatorWorker: string }>;
  artifacts: Readonly<{ evidenceJson: string; evidenceHtml: string; replayJsonl: string }>;
  schemas: Readonly<Record<string, string>>;
  engine: Readonly<{
    armIds: readonly ["status-quo", "beyondgreen"];
    riskCategories: readonly [string, ...string[]];
    observationItemCount: number;
    observationRecordCount: number;
    replayRecordTypes: readonly ["header", "reasoning_request", "reasoning_response", "footer"];
  }>;
  run: Readonly<{
    id: string;
    type: string;
    evaluationVersion: string;
    sessionBoundary: string;
  }>;
}>;

/** Supplies the oracle-free operations shared by orchestration, arm, and observer flows. */
export type FixtureEngineBindings = Readonly<{
  descriptor: EngineDescriptor;
  schemas: Readonly<{
    parseCandidateId(value: unknown): string;
    parseArmId(value: unknown): string;
    parseArmWorkerOutput(value: unknown): unknown;
    parseObservation(value: unknown): unknown;
    parseEvaluatorResult(value: unknown): unknown;
    parseExecutionEvent(value: unknown): unknown;
    parseCapabilityProof(value: unknown): unknown;
    parseEvidence(value: unknown): unknown;
  }>;
  armChecks: Readonly<{
    classify: (...arguments_: any[]) => unknown;
    compile: (...arguments_: any[]) => unknown;
    runVisible: (...arguments_: any[]) => unknown;
    runInternal: (...arguments_: any[]) => unknown;
    assertVerifierDenied: (...arguments_: any[]) => unknown;
  }>;
  reasoning: Readonly<{ execute(value: unknown): unknown }>;
  evaluator: Readonly<{ workerPath: string }>;
  runtime: Readonly<{
    describeCandidate(candidateId: string): Readonly<{ sourcePath: string; manifestPath: string }>;
    ingestCandidate(repositoryRoot: string, candidateId: string): any;
    assertCandidateUnchanged(repositoryRoot: string, candidate: any): string;
    validatePackage(repositoryRoot: string, binding: any): string;
    inventoryRisk(repositoryRoot: string, candidate: any): unknown;
    importCandidate(repositoryRoot: string, candidateId: string): Promise<unknown>;
    captureObservations(repositoryRoot: string, candidateId: string): Promise<unknown>;
    decide(input: any): any;
    finalizeDecision(decision: any, capabilityProofSha256?: string | null): any;
    verifyFinalizedDecision(input: unknown): FinalizedDecision;
    finalizeObservationPair(first: any, second: any): any;
    evaluatorInputSha256(decision: unknown, pair: unknown, manifestSha256: string): string;
  }>;
  replay: Readonly<{
    validateReasoning(value: string): unknown;
    replayEvidence(evidenceJson: string, evidenceHtml: string, replayJsonl: string): unknown;
  }>;
  report: Readonly<{ build(value: unknown): unknown }>;
}>;

/** Evaluator-only capabilities are absent from arm and observer engine graphs by construction. */
export type FixtureEvaluatorEngineBindings = Omit<FixtureEngineBindings, "runtime"> & Readonly<{
  runtime: FixtureEngineBindings["runtime"] & Readonly<{
    evaluateFinalized(input: Readonly<{
      repositoryRoot: string;
      finalized: any;
      observations: any;
      requestedArm: string;
      launchBindingSha256: string;
      processEvidence: unknown;
    }>): unknown;
    createEvaluatorProcessEvidence(
      repositoryRoot: string, executionSlot: string, launchBindingSha256: string,
    ): unknown;
  }>;
}>;

/** Enumerates the closed dispatch surface available through a generic fixture engine. */
export type FixtureEngineOperation =
  | Readonly<{ kind: "parse_candidate"; value: unknown }>
  | Readonly<{ kind: "parse_arm"; value: unknown }>
  | Readonly<{ kind: "parse_arm_output"; value: unknown }>
  | Readonly<{ kind: "parse_observation"; value: unknown }>
  | Readonly<{ kind: "parse_evaluator"; value: unknown }>
  | Readonly<{ kind: "parse_execution_event"; value: unknown }>
  | Readonly<{ kind: "parse_capability_proof"; value: unknown }>
  | Readonly<{ kind: "parse_evidence"; value: unknown }>
  | Readonly<{ kind: "check_classify"; arguments: readonly unknown[] }>
  | Readonly<{ kind: "check_compile"; arguments: readonly unknown[] }>
  | Readonly<{ kind: "check_visible"; arguments: readonly unknown[] }>
  | Readonly<{ kind: "check_internal"; arguments: readonly unknown[] }>
  | Readonly<{ kind: "check_verifier_denied"; arguments: readonly unknown[] }>
  | Readonly<{ kind: "reason"; value: unknown }>
  | Readonly<{ kind: "evaluator_worker" }>
  | Readonly<{ kind: "replay_reasoning"; value: string }>
  | Readonly<{ kind: "replay_evidence"; evidenceJson: string; evidenceHtml: string; replayJsonl: string }>
  | Readonly<{ kind: "build_report"; value: unknown }>;

/** Execute every fixture-owned contract through the same injected dispatch boundary. */
export function executeFixtureEngineBinding(engine: FixtureEngineBindings, operation: FixtureEngineOperation): unknown {
  switch (operation.kind) {
    case "parse_candidate": return engine.schemas.parseCandidateId(operation.value);
    case "parse_arm": return engine.schemas.parseArmId(operation.value);
    case "parse_arm_output": return engine.schemas.parseArmWorkerOutput(operation.value);
    case "parse_observation": return engine.schemas.parseObservation(operation.value);
    case "parse_evaluator": return engine.schemas.parseEvaluatorResult(operation.value);
    case "parse_execution_event": return engine.schemas.parseExecutionEvent(operation.value);
    case "parse_capability_proof": return engine.schemas.parseCapabilityProof(operation.value);
    case "parse_evidence": return engine.schemas.parseEvidence(operation.value);
    case "check_classify": return engine.armChecks.classify(...operation.arguments);
    case "check_compile": return engine.armChecks.compile(...operation.arguments);
    case "check_visible": return engine.armChecks.runVisible(...operation.arguments);
    case "check_internal": return engine.armChecks.runInternal(...operation.arguments);
    case "check_verifier_denied": return engine.armChecks.assertVerifierDenied(...operation.arguments);
    case "reason": return engine.reasoning.execute(operation.value);
    case "evaluator_worker": return engine.evaluator.workerPath;
    case "replay_reasoning": return engine.replay.validateReasoning(operation.value);
    case "replay_evidence": return engine.replay.replayEvidence(
      operation.evidenceJson, operation.evidenceHtml, operation.replayJsonl,
    );
    case "build_report": return engine.report.build(operation.value);
  }
}

/** Freeze one complete descriptor-driven engine contract before orchestration starts. */
export function defineFixtureEngine<const Engine extends FixtureEngineBindings>(engine: Engine): Engine {
  if (engine.descriptor.candidateIds.length === 0
    || engine.evaluator.workerPath !== engine.descriptor.scripts.evaluatorWorker) {
    throw new Error("Fixture engine bindings are incomplete or contradict the descriptor.");
  }
  return Object.freeze(engine);
}

/** Derive orchestration cardinalities and worker arguments from descriptor data only. */
export function createFixtureExecutionPlan(engine: FixtureEngineBindings, candidateIdInput: unknown) {
  const candidateId = executeFixtureEngineBinding(engine, {
    kind: "parse_candidate", value: candidateIdInput,
  }) as string;
  const descriptor = engine.descriptor;
  return Object.freeze({
    fixtureId: descriptor.fixtureId,
    candidateId,
    arms: Object.freeze(descriptor.engine.armIds.map((arm) => Object.freeze({
      arm,
      workerArguments: Object.freeze([descriptor.scripts.armWorker, arm, candidateId]),
      observationArguments: Object.freeze([1, 2].map((ordinal) => Object.freeze([
        descriptor.scripts.observerWorker, candidateId, String(ordinal), arm,
      ]))),
      evaluatorWorker: descriptor.scripts.evaluatorWorker,
    }))),
    evaluatorInvocationCount: descriptor.engine.armIds.length,
    capabilityProofCount: descriptor.engine.armIds.length * 4,
    eventCount: (descriptor.engine.armIds.length * 8) + 2,
    schemaVersions: Object.freeze({ ...descriptor.schemas }),
    artifacts: Object.freeze({ ...descriptor.artifacts }),
  });
}
