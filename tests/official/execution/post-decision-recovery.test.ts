import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { canonicalJson } from "../../../src/official/canonical-json.ts";
import {
  buildOfficialPostDecisionSourceManifest,
  buildOfficialSafeRoleFailureRecord,
  assertOfficialPostDecisionPlanCompatibility,
  executeOfficialPostDecisionRecovery,
  loadOfficialPostDecisionRecoverySource,
  OFFICIAL_POST_DECISION_CURRENT_INVENTORY_SHA256,
  OFFICIAL_POST_DECISION_INVENTORY_DRIFT_REASON,
  OFFICIAL_POST_DECISION_OUTPUT_ROOT,
  OFFICIAL_POST_DECISION_SOURCE_INVENTORY_SHA256,
  OFFICIAL_POST_DECISION_SOURCE_MANIFEST,
  OFFICIAL_POST_DECISION_SOURCE_ROOT,
} from "../../../src/official/execution/post-decision-recovery.ts";
import type { OfficialExecutionPlan } from "../../../src/official/integration/execution-plan.ts";
import type { OfficialExecutionHooks } from "../../../src/official/execution/coordinator.ts";
import { OfficialRoleProcessFailureError } from "../../../src/official/execution/production-composition.ts";
import { runOfficialStaticPreflight } from "../../../src/official/integration/preflight.ts";
import {
  sha256CanonicalJson,
  type OfficialImmutableArmDecision,
} from "../../../src/official/process/ipc.ts";

let ordinal = 0;

function temporaryPath(label: string): string {
  ordinal += 1;
  return `.tmp-postdecision-${process.pid}-${ordinal}-${label}`;
}

function changedInventorySha256(label: string): string {
  return sha256CanonicalJson({ approvedVerifierRepair: label });
}

test("post-decision recovery reuses exact decisions and cannot reach an arm or model", async () => {
  const sourceRoot = temporaryPath("source");
  const manifestPath = `${temporaryPath("manifest")}.json`;
  const outputRoot = temporaryPath("output");
  cpSync(OFFICIAL_POST_DECISION_SOURCE_ROOT, sourceRoot, { recursive: true, errorOnExist: true });
  try {
    const manifest = buildOfficialPostDecisionSourceManifest(process.cwd(), sourceRoot);
    writeFileSync(manifestPath, `${canonicalJson(manifest)}\n`, "utf8");
    const loaded = loadOfficialPostDecisionRecoverySource({
      repositoryRoot: process.cwd(),
      relativeSourceRoot: sourceRoot,
      sourceManifestPath: manifestPath,
    });
    assert.equal(loaded.decisions.length, 40);
    assert.equal(loaded.decisions.every(({ immutable }) => immutable), true);

    let armCalls = 0;
    let scenarios = 0;
    let captures = 0;
    let evaluations = 0;
    const currentInventorySha256 = changedInventorySha256("main-recovery-test");
    const currentPlan = Object.freeze({ ...loaded.plan, inventorySha256: currentInventorySha256 });
    const hooks: OfficialExecutionHooks = {
      staticPreflight: () => ({
        schemaVersion: "beyondgreen-official-static-preflight@1.0.0",
        inventorySha256: currentInventorySha256,
        fixtureCount: 10,
        candidateCount: 20,
        executionPlan: currentPlan,
        candidateImportsPerformed: false,
        candidateExecutionPerformed: false,
        verifierContentParsed: false,
        officialOrScoredRun: false,
        unblindingPerformed: false,
        readyForSyntheticProcessRehearsal: true,
      }),
      hashCandidate: (slot) => slot.candidate.sha256,
      executeArm() {
        armCalls += 1;
        throw new Error("Recovery must never execute an arm.");
      },
      beginPostDecisionEvaluation({ decisions, pairs, syntheticOnly }) {
        assert.equal(decisions.length, 40);
        assert.equal(pairs.length, 0);
        assert.equal(syntheticOnly, false);
        return { unblindingPerformed: true };
      },
      releaseNeutralScenario({ slot, decisions }) {
        scenarios += 1;
        const core = {
          schemaVersion: "beyondgreen-official-neutral-scenario@1.0.0" as const,
          slot,
          scenarioId: `scenario:${slot.fixtureId}`,
          decisionSetSha256: sha256CanonicalJson(decisions),
          steps: [{ action: "synthetic-action", parameters: {} }],
          immutable: true as const,
        };
        return Object.freeze({ ...core, scenarioSha256: sha256CanonicalJson(core) });
      },
      captureObservation({ slot, arm, decisions }) {
        captures += 1;
        const selected = decisions.find((entry) => entry.arm === arm)!;
        const transcript = { fixtureId: slot.fixtureId, candidateId: slot.candidateId, arm };
        const core = {
          schemaVersion: "beyondgreen-official-observer-capture@1.0.0" as const,
          slot,
          arm,
          decisionSha256: selected.decisionSha256,
          transcript,
          transcriptSha256: sha256CanonicalJson(transcript),
          immutable: true as const,
        };
        return Object.freeze({ ...core, captureSha256: sha256CanonicalJson(core) });
      },
      evaluate({ slot, arm, decisions, observationPair }) {
        evaluations += 1;
        const selected = decisions.find((entry: OfficialImmutableArmDecision) => entry.arm === arm)!;
        return {
          evaluationVersion: "eval-v1.1.0" as const,
          fixtureId: slot.fixtureId,
          candidateId: slot.candidateId,
          arm,
          verdict: selected.verdict,
          groundTruth: "preserving" as const,
          reasonCorrectReject: false,
          schemaValidCompleteReport: observationPair.immutable,
        };
      },
    };
    const result = await executeOfficialPostDecisionRecovery({
      repositoryRoot: process.cwd(),
      relativeSourceRoot: sourceRoot,
      sourceManifestPath: manifestPath,
      outputRoot: path.resolve(outputRoot),
      provenance: { syntheticRecoveryTest: true },
      inventoryDriftDisclosure: {
        expectedSourceInventorySha256: loaded.plan.inventorySha256,
        expectedCurrentInventorySha256: currentInventorySha256,
        reason: OFFICIAL_POST_DECISION_INVENTORY_DRIFT_REASON,
      },
      hooks,
    });
    assert.equal(armCalls, 0);
    assert.equal(result.armExecutionCount, 0);
    assert.equal(result.modelInvocationCount, 0);
    assert.equal(scenarios, 20);
    assert.equal(captures, 80);
    assert.equal(evaluations, 40);
    assert.equal(readdirSync(path.join(outputRoot, "observer-records")).length, 80);
    assert.equal(readdirSync(path.join(outputRoot, "evaluator-records")).length, 40);
    assert.equal(readFileSync(path.join(outputRoot, "recovery-manifest.json"), "utf8").includes('"armExecutionCount":0'), true);
    const writtenProvenance = JSON.parse(readFileSync(path.join(outputRoot, "provenance.json"), "utf8"));
    assert.equal(writtenProvenance.sourceInventorySha256, loaded.plan.inventorySha256);
    assert.equal(writtenProvenance.currentInventorySha256, currentInventorySha256);
    assert.equal(writtenProvenance.inventorySha256Match, false);
    assert.equal(writtenProvenance.inventoryDriftReason, OFFICIAL_POST_DECISION_INVENTORY_DRIFT_REASON);
    assert.equal(readdirSync(outputRoot).includes("arm-records"), false);
  } finally {
    rmSync(sourceRoot, { recursive: true, force: true });
    rmSync(manifestPath, { force: true });
    rmSync(outputRoot, { recursive: true, force: true });
  }
});

test("plan compatibility permits only inventorySha256 drift", () => {
  const sourcePlan = JSON.parse(readFileSync(
    path.join(OFFICIAL_POST_DECISION_SOURCE_ROOT, "execution-plan.json"),
    "utf8",
  )) as OfficialExecutionPlan;
  const changedInventoryPlan = {
    ...sourcePlan,
    inventorySha256: changedInventorySha256("isolated-inventory-drift"),
  } as OfficialExecutionPlan;
  assert.doesNotThrow(() => assertOfficialPostDecisionPlanCompatibility(sourcePlan, changedInventoryPlan));

  const leafPaths: Array<readonly (string | number)[]> = [];
  function collectLeaves(value: unknown, currentPath: readonly (string | number)[] = []): void {
    if (Array.isArray(value)) {
      value.forEach((child, index) => collectLeaves(child, [...currentPath, index]));
      return;
    }
    if (value !== null && typeof value === "object") {
      Object.entries(value).forEach(([key, child]) => collectLeaves(child, [...currentPath, key]));
      return;
    }
    leafPaths.push(currentPath);
  }
  collectLeaves(sourcePlan);
  const decisionCriticalPaths = leafPaths.filter((pathParts) => pathParts.join("/") !== "inventorySha256");
  assert.ok(decisionCriticalPaths.length > 300);

  for (const pathParts of decisionCriticalPaths) {
    const changed = structuredClone(sourcePlan) as unknown as Record<string | number, unknown>;
    let parent = changed;
    for (const pathPart of pathParts.slice(0, -1)) {
      parent = parent[pathPart] as Record<string | number, unknown>;
    }
    const finalPart = pathParts.at(-1)!;
    const original = parent[finalPart];
    parent[finalPart] = typeof original === "string"
      ? `${original}-changed`
      : typeof original === "number"
        ? original + 1
        : !original;
    assert.throws(
      () => assertOfficialPostDecisionPlanCompatibility(sourcePlan, changed as unknown as OfficialExecutionPlan),
      /decision-critical execution plan differs/iu,
      `Expected drift at ${pathParts.join("/")} to be blocked.`,
    );
  }

  assert.throws(
    () => assertOfficialPostDecisionPlanCompatibility(
      sourcePlan,
      { ...structuredClone(sourcePlan), unexpectedField: true } as unknown as OfficialExecutionPlan,
    ),
    /decision-critical execution plan differs/iu,
  );
});

test("candidate-byte drift remains blocking after approved inventory drift", async () => {
  const sourceRoot = temporaryPath("candidate-drift-source");
  const manifestPath = `${temporaryPath("candidate-drift-manifest")}.json`;
  const outputRoot = temporaryPath("candidate-drift-output");
  cpSync(OFFICIAL_POST_DECISION_SOURCE_ROOT, sourceRoot, { recursive: true, errorOnExist: true });
  try {
    const manifest = buildOfficialPostDecisionSourceManifest(process.cwd(), sourceRoot);
    writeFileSync(manifestPath, `${canonicalJson(manifest)}\n`, "utf8");
    const loaded = loadOfficialPostDecisionRecoverySource({
      repositoryRoot: process.cwd(),
      relativeSourceRoot: sourceRoot,
      sourceManifestPath: manifestPath,
    });
    const currentInventorySha256 = changedInventorySha256("candidate-drift-test");
    const currentPlan = Object.freeze({ ...loaded.plan, inventorySha256: currentInventorySha256 });
    const hooks = {
      staticPreflight: () => ({
        schemaVersion: "beyondgreen-official-static-preflight@1.0.0" as const,
        inventorySha256: currentInventorySha256,
        fixtureCount: 10 as const,
        candidateCount: 20 as const,
        executionPlan: currentPlan,
        candidateImportsPerformed: false as const,
        candidateExecutionPerformed: false as const,
        verifierContentParsed: false as const,
        officialOrScoredRun: false as const,
        unblindingPerformed: false as const,
        readyForSyntheticProcessRehearsal: true as const,
      }),
      hashCandidate: () => "0".repeat(64),
    } as unknown as OfficialExecutionHooks;
    await assert.rejects(
      executeOfficialPostDecisionRecovery({
        repositoryRoot: process.cwd(),
        relativeSourceRoot: sourceRoot,
        sourceManifestPath: manifestPath,
        outputRoot: path.resolve(outputRoot),
        provenance: { syntheticCandidateDriftTest: true },
        inventoryDriftDisclosure: {
          expectedSourceInventorySha256: loaded.plan.inventorySha256,
          expectedCurrentInventorySha256: currentInventorySha256,
          reason: OFFICIAL_POST_DECISION_INVENTORY_DRIFT_REASON,
        },
        hooks,
      }),
      /Candidate hash differs from the immutable RUN-002 plan/iu,
    );
    assert.equal(existsSync(outputRoot), false);
  } finally {
    rmSync(sourceRoot, { recursive: true, force: true });
    rmSync(manifestPath, { force: true });
    rmSync(outputRoot, { recursive: true, force: true });
  }
});

test("production continuation reserves POSTDECISION-004", () => {
  assert.match(OFFICIAL_POST_DECISION_OUTPUT_ROOT, /POSTDECISION-004$/u);
});

test("role failure evidence contains only the approved non-disclosing projection", () => {
  const record = buildOfficialSafeRoleFailureRecord({
    ordinal: 1,
    arm: "status-quo",
    processPhase: "observer-capture",
    captureOrdinal: 1,
    failure: {
      schemaVersion: "beyondgreen-official-process-failure@1.0.0",
      requestId: "observer:BG-D01:candidate-a:status-quo:1",
      role: "observer",
      status: "error",
      disposition: "abstain",
      retryAllowed: false,
      errorCode: "HANDLER_FAILURE",
      failureStage: "NORMALIZE_SCENARIO",
      message: "This text must never enter persisted evidence.",
    },
  });
  assert.deepEqual(Object.keys(record).sort(), [
    "arm", "captureOrdinal", "disposition", "errorCode", "failureStage",
    "ordinal", "processPhase", "requestId", "retryAllowed", "role", "schemaVersion",
  ]);
  assert.equal(JSON.stringify(record).includes("This text"), false);
  assert.equal(Object.isFrozen(record), true);

  const evaluatorRecord = buildOfficialSafeRoleFailureRecord({
    ordinal: 5,
    arm: "status-quo",
    processPhase: "evaluator",
    failure: {
      schemaVersion: "beyondgreen-official-process-failure@1.0.0",
      requestId: "evaluator:BG-D03:candidate-a:status-quo",
      role: "evaluator",
      status: "error",
      disposition: "abstain",
      retryAllowed: false,
      errorCode: "HANDLER_FAILURE",
      failureStage: "EXECUTE_EVALUATOR",
      message: "Raw evaluator diagnostics must not be persisted.",
    },
  });
  assert.equal(evaluatorRecord.processPhase, "evaluator");
  assert.equal(evaluatorRecord.captureOrdinal, null);
  assert.equal(JSON.stringify(evaluatorRecord).includes("Raw evaluator"), false);
});

test("post-decision recovery persists a privacy-safe evaluator failure before stopping", async () => {
  const outputRoot = temporaryPath("evaluator-failure-output");
  try {
    const source = loadOfficialPostDecisionRecoverySource({
      repositoryRoot: process.cwd(),
      relativeSourceRoot: OFFICIAL_POST_DECISION_SOURCE_ROOT,
      sourceManifestPath: OFFICIAL_POST_DECISION_SOURCE_MANIFEST,
    });
    const currentInventorySha256 = changedInventorySha256("evaluator-failure-test");
    const currentPlan = Object.freeze({ ...source.plan, inventorySha256: currentInventorySha256 });
    const hooks: OfficialExecutionHooks = {
      staticPreflight: () => ({
        schemaVersion: "beyondgreen-official-static-preflight@1.0.0",
        inventorySha256: currentInventorySha256,
        fixtureCount: 10,
        candidateCount: 20,
        executionPlan: currentPlan,
        candidateImportsPerformed: false,
        candidateExecutionPerformed: false,
        verifierContentParsed: false,
        officialOrScoredRun: false,
        unblindingPerformed: false,
        readyForSyntheticProcessRehearsal: true,
      }),
      hashCandidate: (slot) => slot.candidate.sha256,
      executeArm() { throw new Error("Evaluator failure test must never execute an arm."); },
      beginPostDecisionEvaluation: () => ({ unblindingPerformed: true }),
      releaseNeutralScenario({ slot, decisions }) {
        const core = {
          schemaVersion: "beyondgreen-official-neutral-scenario@1.0.0" as const,
          slot,
          scenarioId: `scenario:${slot.fixtureId}`,
          decisionSetSha256: sha256CanonicalJson(decisions),
          steps: [{ action: "synthetic-action", parameters: {} }],
          immutable: true as const,
        };
        return { ...core, scenarioSha256: sha256CanonicalJson(core) };
      },
      captureObservation({ slot, arm, decisions }) {
        const selected = decisions.find((entry) => entry.arm === arm)!;
        const transcript = { fixtureId: slot.fixtureId, candidateId: slot.candidateId, arm };
        const core = {
          schemaVersion: "beyondgreen-official-observer-capture@1.0.0" as const,
          slot,
          arm,
          decisionSha256: selected.decisionSha256,
          transcript,
          transcriptSha256: sha256CanonicalJson(transcript),
          immutable: true as const,
        };
        return { ...core, captureSha256: sha256CanonicalJson(core) };
      },
      evaluate() {
        throw new OfficialRoleProcessFailureError({
          schemaVersion: "beyondgreen-official-process-failure@1.0.0",
          requestId: "evaluator:BG-D01:candidate-a:status-quo",
          role: "evaluator",
          status: "error",
          disposition: "abstain",
          retryAllowed: false,
          errorCode: "HANDLER_FAILURE",
          failureStage: "EXECUTE_EVALUATOR",
          message: "Sensitive evaluator detail must remain absent.",
        });
      },
    };
    await assert.rejects(executeOfficialPostDecisionRecovery({
      repositoryRoot: process.cwd(),
      relativeSourceRoot: OFFICIAL_POST_DECISION_SOURCE_ROOT,
      sourceManifestPath: OFFICIAL_POST_DECISION_SOURCE_MANIFEST,
      outputRoot: path.resolve(outputRoot),
      provenance: { syntheticEvaluatorFailureTest: true },
      inventoryDriftDisclosure: {
        expectedSourceInventorySha256: source.plan.inventorySha256,
        expectedCurrentInventorySha256: currentInventorySha256,
        reason: OFFICIAL_POST_DECISION_INVENTORY_DRIFT_REASON,
      },
      hooks,
    }), OfficialRoleProcessFailureError);
    const failurePath = path.join(outputRoot, "failure-records", "01-status-quo-evaluator.json");
    const persisted = JSON.parse(readFileSync(failurePath, "utf8"));
    assert.equal(persisted.processPhase, "evaluator");
    assert.equal(persisted.captureOrdinal, null);
    assert.equal(persisted.failureStage, "EXECUTE_EVALUATOR");
    assert.equal(JSON.stringify(persisted).includes("Sensitive evaluator"), false);
  } finally {
    rmSync(outputRoot, { recursive: true, force: true });
  }
});

test("production inventory disclosure matches RUN-002 and current static validation", () => {
  const source = loadOfficialPostDecisionRecoverySource({
    repositoryRoot: process.cwd(),
    relativeSourceRoot: OFFICIAL_POST_DECISION_SOURCE_ROOT,
    sourceManifestPath: OFFICIAL_POST_DECISION_SOURCE_MANIFEST,
  });
  const current = runOfficialStaticPreflight(process.cwd());
  assert.equal(source.plan.inventorySha256, OFFICIAL_POST_DECISION_SOURCE_INVENTORY_SHA256);
  assert.equal(current.inventorySha256, OFFICIAL_POST_DECISION_CURRENT_INVENTORY_SHA256);
  assert.doesNotThrow(() => assertOfficialPostDecisionPlanCompatibility(source.plan, current.executionPlan));
  assert.equal(current.candidateExecutionPerformed, false);
  assert.equal(current.officialOrScoredRun, false);
  assert.equal(current.unblindingPerformed, false);
});

test("post-decision source manifest fails closed after one byte changes", () => {
  const sourceRoot = temporaryPath("tamper-source");
  const manifestPath = `${temporaryPath("tamper-manifest")}.json`;
  cpSync(OFFICIAL_POST_DECISION_SOURCE_ROOT, sourceRoot, { recursive: true, errorOnExist: true });
  try {
    const manifest = buildOfficialPostDecisionSourceManifest(process.cwd(), sourceRoot);
    writeFileSync(manifestPath, `${canonicalJson(manifest)}\n`, "utf8");
    const target = path.join(sourceRoot, "arm-records", "01-status-quo.json");
    writeFileSync(target, `${readFileSync(target, "utf8")} `, "utf8");
    assert.throws(() => loadOfficialPostDecisionRecoverySource({
      repositoryRoot: process.cwd(),
      relativeSourceRoot: sourceRoot,
      sourceManifestPath: manifestPath,
    }), /source bytes no longer match/iu);
  } finally {
    rmSync(sourceRoot, { recursive: true, force: true });
    rmSync(manifestPath, { force: true });
  }
});
