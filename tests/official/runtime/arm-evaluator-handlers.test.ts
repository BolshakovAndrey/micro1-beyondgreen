import assert from "node:assert/strict";
import test from "node:test";

import {
  CODEX_EXEC_JSONL_ADAPTER_ID,
  CODEX_EXEC_MODEL,
} from "../../../src/official/reasoning/contract.ts";
import { mapCodexExecFailure } from "../../../src/official/reasoning/errors.ts";
import type { CodexExecParseResult } from "../../../src/official/reasoning/parser.ts";
import type {
  OfficialArmHandlerOutput,
  OfficialArmProcessRequest,
  OfficialEvaluatorProcessRequest,
} from "../../../src/official/process/ipc.ts";
import {
  createBeyondGreenArmHandler,
  createStatusQuoArmHandler,
  type CodexExecJsonlTransport,
} from "../../../src/official/runtime/arm-handler.ts";
import { createEvaluatorHandler } from "../../../src/official/runtime/evaluator-handler.ts";

function armRequest(arm: "status-quo" | "beyondgreen", payload: unknown): OfficialArmProcessRequest {
  return {
    schemaVersion: "beyondgreen-official-process-ipc@1.0.0",
    requestId: `arm:BG-D02:synthetic:${arm}`,
    evaluationVersion: "eval-v1.1.0",
    slot: {
      slotId: "BG-D02:synthetic",
      fixtureId: "BG-D02",
      candidateId: "synthetic",
      candidateSha256: "a".repeat(64),
    },
    inputSha256: "a".repeat(64),
    role: "arm",
    operation: "decide",
    arm,
    attemptOrdinal: 1,
    payload,
  };
}

test("status-quo handler uses zero reasoning and fails closed on inconclusive visible evidence", async () => {
  const handler = createStatusQuoArmHandler();
  const accepted = await handler(armRequest("status-quo", {
    compilation: "passed",
    visibleTests: "passed",
    evidence: { synthetic: true },
  }));
  assert.equal(accepted.verdict, "accept");
  assert.deepEqual(accepted.evidence, {
    compilation: "passed",
    visibleTests: "passed",
    visibleEvidence: { synthetic: true },
    reasoningInvocationCount: 0,
    retryCount: 0,
  });
  const abstained = await handler(armRequest("status-quo", {
    compilation: "passed",
    visibleTests: "inconclusive",
    evidence: { synthetic: true },
  }));
  assert.equal(abstained.verdict, "abstain");
});

test("BeyondGreen handler consumes one injected transport call and permits no retry", async () => {
  let calls = 0;
  const output: OfficialArmHandlerOutput = {
    verdict: "reject",
    rationale: "A synthetic arm-visible contract failed.",
    evidence: { synthetic: true },
  };
  const transport: CodexExecJsonlTransport = {
    async invoke(): Promise<CodexExecParseResult<OfficialArmHandlerOutput>> {
      calls += 1;
      return {
        ok: true,
        adapterId: CODEX_EXEC_JSONL_ADAPTER_ID,
        model: CODEX_EXEC_MODEL,
        output,
        eventCount: 3,
        tokenUsage: "not_measured",
        invocationCount: 1,
        retryCount: 0,
        monetaryCost: "not_applicable_or_not_measured",
        perRunUsdCalculatedOrEstimated: false,
      };
    },
  };
  const handler = createBeyondGreenArmHandler(transport);
  const request = armRequest("beyondgreen", { prompt: "Synthetic public evidence.", outputSchemaPath: "schemas/output.json" });
  assert.deepEqual(await handler(request), output);
  await assert.rejects(handler(request), /single-use/u);
  assert.equal(calls, 1);
});

test("BeyondGreen transport failure becomes abstain without a substitute or retry", async () => {
  const transport: CodexExecJsonlTransport = {
    async invoke() {
      return { ok: false, failure: mapCodexExecFailure({ source: "process", safeClass: "transport", exitCode: 1 }) };
    },
  };
  const result = await createBeyondGreenArmHandler(transport)(armRequest("beyondgreen", {
    prompt: "Synthetic public evidence.",
    outputSchemaPath: "schemas/output.json",
  }));
  assert.equal(result.verdict, "abstain");
  assert.deepEqual(result.evidence, {
    failureCode: "MODEL_TRANSPORT_FAILURE",
    invocationCount: 1,
    retryAllowed: false,
    substituteModelAllowed: false,
  });
});

test("evaluator wrapper calls only the injected evaluator and is single-use", async () => {
  let received: OfficialEvaluatorProcessRequest | undefined;
  const request = { requestId: "synthetic-evaluator" } as OfficialEvaluatorProcessRequest;
  const handler = createEvaluatorHandler((value) => {
    received = value;
    return {
      groundTruth: "preserving",
      reasonCorrectReject: false,
      schemaValidCompleteReport: true,
      evidence: { synthetic: true },
    };
  });
  const output = await handler(request);
  assert.equal(received, request);
  assert.equal(output.groundTruth, "preserving");
  await assert.rejects(handler(request), /single-use/u);
});
