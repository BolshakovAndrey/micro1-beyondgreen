import assert from "node:assert/strict";
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { canonicalJson } from "../../../src/official/canonical-json.ts";
import {
  buildOfficialPostDecisionSourceManifest,
  executeOfficialPostDecisionRecovery,
  loadOfficialPostDecisionRecoverySource,
  OFFICIAL_POST_DECISION_SOURCE_ROOT,
} from "../../../src/official/execution/post-decision-recovery.ts";
import type { OfficialExecutionHooks } from "../../../src/official/execution/coordinator.ts";
import {
  sha256CanonicalJson,
  type OfficialImmutableArmDecision,
} from "../../../src/official/process/ipc.ts";

let ordinal = 0;

function temporaryPath(label: string): string {
  ordinal += 1;
  return `.tmp-postdecision-${process.pid}-${ordinal}-${label}`;
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
    const hooks: OfficialExecutionHooks = {
      staticPreflight: () => ({
        schemaVersion: "beyondgreen-official-static-preflight@1.0.0",
        inventorySha256: loaded.plan.inventorySha256,
        fixtureCount: 10,
        candidateCount: 20,
        executionPlan: loaded.plan,
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
    assert.equal(readdirSync(outputRoot).includes("arm-records"), false);
  } finally {
    rmSync(sourceRoot, { recursive: true, force: true });
    rmSync(manifestPath, { force: true });
    rmSync(outputRoot, { recursive: true, force: true });
  }
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
