import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import { rehearseSyntheticOfficialRunner } from "../../src/official/rehearsal.ts";
import { createTestOfficialDescriptor } from "./test-descriptor.ts";

function digest(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

test("test-only official runner rehearses two immutable arms through exact offline replay", async () => {
  const descriptor = createTestOfficialDescriptor();
  const events: string[] = [];
  const result = await rehearseSyntheticOfficialRunner(descriptor, "candidate-a", {
    async executeArm(arm, plan) {
      assert.equal(plan.candidateExecutionAllowed, false);
      assert.equal(plan.officialOrScoredRun, false);
      events.push(`decision:${arm}`);
      return {
        arm,
        verdict: "accept",
        rationale: "synthetic visible evidence is complete",
        decisionSha256: digest(`decision:${arm}`),
        immutable: true,
      };
    },
    async captureAfterDecisions(decision, plan) {
      assert.equal(events.filter((event) => event.startsWith("decision:")).length, 2);
      assert.ok(plan.roles.observer.denyReadPaths.includes(descriptor.verifierOnlyRoot));
      events.push(`capture:${decision.arm}`);
      return {
        arm: decision.arm,
        decisionSha256: decision.decisionSha256,
        transcriptSha256: digest(`transcript:${decision.arm}`),
        immutable: true,
      };
    },
    async evaluateAfterCapture({ decision, capture, plan }) {
      assert.equal(events.filter((event) => event.startsWith("capture:")).length, 2);
      assert.ok(plan.roles.evaluator.denyReadPaths.includes(descriptor.candidates[0]!.module.modulePath));
      assert.ok(!plan.roles.evaluator.allowReadPaths.includes(descriptor.candidates[0]!.module.modulePath));
      return {
        evaluationVersion: "eval-v1.1.0",
        fixtureId: descriptor.fixtureId,
        candidateId: "candidate-a",
        arm: decision.arm,
        verdict: decision.verdict,
        groundTruth: "preserving",
        reasonCorrectReject: false,
        schemaValidCompleteReport: true,
      };
    },
  });
  assert.equal(result.decisions.length, 2);
  assert.equal(result.captures.length, 2);
  assert.equal(result.records.length, 2);
  assert.equal(result.replay.aggregates.length, 2);
  assert.match(result.replay.reportJson, /beyondgreen-official-aggregate@1\.0\.0/);
  assert.match(result.replay.reportHtml, /<!doctype html>/);
  assert.equal(result.replayDigestMatched, true);
  assert.equal(result.realCandidateExecution, false);
  assert.equal(result.officialOrScoredRun, false);
  assert.equal(result.unblindingPerformed, false);
  assert.ok(Object.isFrozen(result.decisions));
  assert.ok(Object.isFrozen(result.captures));
});
