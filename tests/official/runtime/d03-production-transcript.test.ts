import assert from "node:assert/strict";
import test from "node:test";

import {
  TrayPlanner as PreservingPlanner,
  TrayPlannerSummary as PreservingSummary,
} from "../../../candidates/BG-D03/candidate-a/TrayPlanner.ts";
import {
  TrayPlanner as FalseGreenPlanner,
  TrayPlannerSummary as FalseGreenSummary,
} from "../../../candidates/BG-D03/candidate-b/TrayPlanner.ts";
import { OFFICIAL_EVALUATOR_HANDLER } from "../../../evaluation/verifier-only/BG-D03/official-runtime-exports.ts";
import { NEUTRAL_SCENARIO_PROVIDER_EXPORT } from "../../../evaluation/verifier-only/BG-D03/scenario-provider.ts";
import { sha256CanonicalJson, type OfficialEvaluatorProcessRequest, type OfficialNeutralScenarioEnvelope } from "../../../src/official/process/ipc.ts";
import { captureBGD03SpecializedTranscript } from "../../../src/official/runtime/specialized-observers.ts";

function scenario(candidateId: string): OfficialNeutralScenarioEnvelope {
  const slot = {
    slotId: `BG-D03:${candidateId}`,
    fixtureId: "BG-D03",
    candidateId,
    candidateSha256: sha256CanonicalJson({ fixtureId: "BG-D03", candidateId }),
  } as const;
  const core = {
    schemaVersion: "beyondgreen-official-neutral-scenario@1.0.0" as const,
    slot,
    scenarioId: NEUTRAL_SCENARIO_PROVIDER_EXPORT.scenarioId,
    decisionSetSha256: sha256CanonicalJson({ frozenDecisions: candidateId }),
    steps: NEUTRAL_SCENARIO_PROVIDER_EXPORT.steps,
    immutable: true as const,
  };
  return { ...core, scenarioSha256: sha256CanonicalJson(core) };
}

async function evaluate(input: Readonly<{
  candidateId: string;
  Planner: typeof PreservingPlanner | typeof FalseGreenPlanner;
  Summary: typeof PreservingSummary | typeof FalseGreenSummary;
}>) {
  const transcript = await captureBGD03SpecializedTranscript({
    bindings: { Planner: input.Planner as never, Summary: input.Summary as never },
    scenario: scenario(input.candidateId),
  });
  const request = {
    slot: { fixtureId: "BG-D03", candidateId: input.candidateId },
    targetArm: "beyondgreen",
    decisions: [{ arm: "beyondgreen", verdict: "reject", rationale: "derived state" }],
    capture: { transcript },
  } as unknown as OfficialEvaluatorProcessRequest;
  return { transcript, output: OFFICIAL_EVALUATOR_HANDLER(request) };
}

test("D03 production transcript preserves all five scenario steps and frozen outcomes", async () => {
  const preserving = await evaluate({ candidateId: "candidate-a", Planner: PreservingPlanner, Summary: PreservingSummary });
  const falseGreen = await evaluate({ candidateId: "candidate-b", Planner: FalseGreenPlanner, Summary: FalseGreenSummary });

  assert.deepEqual(preserving.transcript.frames.map(({ operation }) => operation), [
    "construct", "add", "set-packet-count", "observe", "render-summary",
  ]);
  assert.equal(preserving.output.groundTruth, "preserving");
  assert.equal(falseGreen.output.groundTruth, "false_green");
  assert.match(JSON.stringify(preserving.transcript.frames[4]!.observation), /occupied=9;remaining=-1;overCapacity=true/u);
  assert.match(JSON.stringify(falseGreen.transcript.frames[4]!.observation), /occupied=3;remaining=5;overCapacity=false/u);
});

test("D03 evaluator rejects a transcript that drops or aliases a frozen scenario step", async () => {
  const { transcript } = await evaluate({ candidateId: "candidate-a", Planner: PreservingPlanner, Summary: PreservingSummary });
  const request = {
    slot: { fixtureId: "BG-D03", candidateId: "candidate-a" },
    targetArm: "beyondgreen",
    decisions: [{ arm: "beyondgreen", verdict: "reject", rationale: "derived state" }],
    capture: { transcript: { ...transcript, frames: transcript.frames.slice(0, 4) } },
  } as unknown as OfficialEvaluatorProcessRequest;
  assert.throws(() => OFFICIAL_EVALUATOR_HANDLER(request), /exact frozen scenario order/iu);
});
