/** Proves a test-only descriptor traverses the real generic engine dispatch boundary. */
import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";

import { executeFixtureEngineBinding } from "../src/d01/engine.ts";
import { defaultProcessRunner, runFixtureVerticalSlice } from "../src/d01/orchestrator.ts";
import { createFixtureSchemaPrimitives } from "../src/d01/schema-factory.ts";
import { TEST_ONLY_ENGINE } from "./fixtures/test-only-engine.ts";

test("TEST-ONLY descriptor traverses the real injected process, evaluator, replay, and report pipeline", () => {
  const descriptor = TEST_ONLY_ENGINE.descriptor;
  const TestObservationSchema = z.object({ values: z.array(z.number()).length(4) }).strict();
  const schemas = createFixtureSchemaPrimitives(descriptor, TestObservationSchema);

  assert.equal(schemas.fixtureId, "TEST-ONLY");
  assert.equal(schemas.CandidateIdSchema.parse("variant-one"), "variant-one");
  assert.throws(() => schemas.CandidateIdSchema.parse("candidate-a"));
  assert.deepEqual(schemas.VisibleTestIdsSchema.parse(["TEST-VIS-1"]), ["TEST-VIS-1"]);
  assert.throws(() => schemas.ObservationSchema.parse({ values: [1, 2, 3] }));

  const evidence = runFixtureVerticalSlice(TEST_ONLY_ENGINE, process.cwd(), "variant-one", {
    processRunner: defaultProcessRunner,
  }) as any;
  assert.equal(evidence.fixtureId, "TEST-ONLY");
  assert.equal(evidence.capabilityProofs.length, 8);
  assert.equal(evidence.executionEvents.length, 18);
  assert.equal(evidence.decisions.statusQuo.decision.verdict, "accept");
  assert.equal(evidence.decisions.beyondGreen.decision.verdict, "reject");
  assert.equal(evidence.evaluatorResults.beyondGreen.decisionSha256,
    evidence.decisions.beyondGreen.decisionSha256);

  const report = executeFixtureEngineBinding(TEST_ONLY_ENGINE, { kind: "build_report", value: evidence }) as any;
  assert.match(report.html, /TEST-ONLY/u);
  const replay = executeFixtureEngineBinding(TEST_ONLY_ENGINE, {
    kind: "replay_evidence",
    evidenceJson: report.json,
    evidenceHtml: report.html,
    replayJsonl: evidence.offlineReplayJsonl,
  }) as any;
  assert.equal(replay.replayed, true);
});
