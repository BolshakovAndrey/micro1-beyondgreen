import assert from "node:assert/strict";
import test from "node:test";

import {
  OfficialEvaluatorProcessRequestSchema,
  OfficialImmutableArmDecisionSchema,
  OfficialObserverCaptureSchema,
  OfficialObserverProcessRequestSchema,
  sha256CanonicalJson,
} from "../../../src/official/process/ipc.ts";

const hash = (label: string): string => sha256CanonicalJson({ label });
const slot = Object.freeze({
  slotId: "BG-D02:candidate-a",
  fixtureId: "BG-D02" as const,
  candidateId: "candidate-a",
  candidateSha256: hash("candidate"),
});
const inputSha256 = hash("input");

function decision(arm: "status-quo" | "beyondgreen") {
  const core = {
    schemaVersion: "beyondgreen-official-arm-decision@1.0.0" as const,
    slot,
    arm,
    verdict: "accept" as const,
    rationale: `synthetic ${arm}`,
    inputSha256,
    evidenceSha256: hash(`evidence-${arm}`),
    immutable: true as const,
  };
  return OfficialImmutableArmDecisionSchema.parse({
    ...core,
    decisionSha256: sha256CanonicalJson(core),
  });
}

function capture(target = decision("status-quo")) {
  const transcript = { frames: [{ value: 1 }], syntheticOnly: true };
  const core = {
    schemaVersion: "beyondgreen-official-observer-capture@1.0.0" as const,
    slot,
    arm: target.arm,
    decisionSha256: target.decisionSha256,
    transcript,
    transcriptSha256: sha256CanonicalJson(transcript),
    immutable: true as const,
  };
  return OfficialObserverCaptureSchema.parse({ ...core, captureSha256: sha256CanonicalJson(core) });
}

test("strict IPC schemas bind canonical immutable decisions and captures", () => {
  const first = decision("status-quo");
  const second = decision("beyondgreen");
  assert.equal(Object.isFrozen(first), false, "schema parsing alone does not claim runtime freezing");
  assert.throws(() => OfficialImmutableArmDecisionSchema.parse({ ...first, rationale: "tampered" }), /digest mismatch/i);
  const observed = capture(first);
  assert.throws(() => OfficialObserverCaptureSchema.parse({ ...observed, transcript: { frames: [] } }), /digest mismatch/i);
  assert.throws(() => OfficialImmutableArmDecisionSchema.parse({ ...second, unknown: true }), /unrecognized/i);
});

test("observer and evaluator requests fail closed unless both decisions precede capture", () => {
  const statusQuo = decision("status-quo");
  const beyondGreen = decision("beyondgreen");
  const base = {
    schemaVersion: "beyondgreen-official-process-ipc@1.0.0" as const,
    requestId: "observer-1",
    evaluationVersion: "eval-v1.1.0" as const,
    slot,
    inputSha256,
    role: "observer" as const,
    operation: "capture_after_decisions" as const,
    targetArm: "status-quo" as const,
    decisions: [statusQuo, beyondGreen],
    payload: {},
  };
  assert.equal(OfficialObserverProcessRequestSchema.safeParse(base).success, true);
  assert.equal(OfficialObserverProcessRequestSchema.safeParse({
    ...base,
    decisions: [statusQuo, statusQuo],
  }).success, false);

  const evaluator = {
    ...base,
    requestId: "evaluator-1",
    role: "evaluator" as const,
    operation: "evaluate_after_capture" as const,
    capture: capture(statusQuo),
  };
  assert.equal(OfficialEvaluatorProcessRequestSchema.safeParse(evaluator).success, true);
  assert.equal(OfficialEvaluatorProcessRequestSchema.safeParse({
    ...evaluator,
    targetArm: "beyondgreen",
  }).success, false);
});
