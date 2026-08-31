import assert from "node:assert/strict";
import test from "node:test";

import type { RoleCapabilityPlan } from "../../../src/official/adapters/types.ts";
import { sha256CanonicalJson } from "../../../src/official/process/ipc.ts";
import type { CodexExecJsonlTransport } from "../../../src/official/runtime/arm-handler.ts";
import { createReasoningAwareRoleLauncher } from "../../../src/official/runtime/reasoning-aware-launcher.ts";

const capability: RoleCapabilityPlan = Object.freeze({
  role: "arm",
  fixtureId: "BG-D02",
  candidateId: "candidate-a",
  entrypoint: { modulePath: "src/official/runtime/role-process-entrypoint.ts", exportName: "main", symbolKind: "runtime" },
  allowReadPaths: ["evaluation/arm-visible/BG-D02", "candidates/BG-D02/candidate-a/ParcelDispatchBoard.ts"],
  denyReadPaths: ["evaluation/verifier-only/BG-D02"],
  networkAllowed: false,
});

function request(arm: "status-quo" | "beyondgreen") {
  const slot = { slotId: "BG-D02:candidate-a", fixtureId: "BG-D02", candidateId: "candidate-a", candidateSha256: sha256CanonicalJson({ candidate: "a" }) };
  return {
    schemaVersion: "beyondgreen-official-process-ipc@1.0.0" as const,
    requestId: `arm:${arm}`,
    evaluationVersion: "eval-v1.1.0" as const,
    slot,
    inputSha256: slot.candidateSha256,
    role: "arm" as const,
    operation: "decide" as const,
    arm,
    attemptOrdinal: 1 as const,
    payload: {},
  };
}

test("BeyondGreen invokes one transport with only the injected public bundle", async () => {
  let modelCalls = 0;
  let isolatedCalls = 0;
  const transport: CodexExecJsonlTransport = {
    async invoke({ prompt }) {
      modelCalls += 1;
      assert.match(prompt, /public\/candidate\.ts/u);
      assert.equal(prompt.includes("verifier-only"), false);
      return Object.freeze({
        ok: true as const,
        adapterId: "codex-exec-jsonl-v1" as const,
        model: "gpt-5.6-sol" as const,
        output: { verdict: "reject" as const, rationale: "Synthetic public defect.", evidence: { probe: "failed" } },
        eventCount: 4,
        tokenUsage: "not_measured" as const,
        invocationCount: 1 as const,
        retryCount: 0 as const,
        monetaryCost: "not_applicable_or_not_measured" as const,
        perRunUsdCalculatedOrEstimated: false as const,
      });
    },
  };
  const launcher = createReasoningAwareRoleLauncher({
    transport,
    publicBundleReader: { async read() { return [{ path: "public/candidate.ts", content: "export const safe = true;" }]; } },
    isolatedLauncher: async () => { isolatedCalls += 1; throw new Error("unexpected isolated call"); },
  });
  const output = await launcher({ role: "arm", capability, request: request("beyondgreen"), attemptOrdinal: 1 });
  assert.equal(modelCalls, 1);
  assert.equal(isolatedCalls, 0);
  assert.equal((output.response as any).decision.verdict, "reject");
  assert.equal(output.reasoningInvocationCount, 1);
});

test("status quo remains inside the network-denied isolated launcher", async () => {
  let isolatedCalls = 0;
  const launcher = createReasoningAwareRoleLauncher({
    transport: {} as never,
    publicBundleReader: {} as never,
    isolatedLauncher: async () => {
      isolatedCalls += 1;
      return { response: { synthetic: true }, reasoningInvocationCount: 0, retryCount: 0 };
    },
  });
  await launcher({ role: "arm", capability, request: request("status-quo"), attemptOrdinal: 1 });
  assert.equal(isolatedCalls, 1);
});
