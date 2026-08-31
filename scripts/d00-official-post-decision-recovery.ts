#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { realpath, rm } from "node:fs/promises";
import path from "node:path";

import {
  executeOfficialPostDecisionRecovery,
  loadOfficialPostDecisionRecoverySource,
  OFFICIAL_POST_DECISION_CURRENT_INVENTORY_SHA256,
  OFFICIAL_POST_DECISION_INVENTORY_DRIFT_REASON,
  OFFICIAL_POST_DECISION_OUTPUT_ROOT,
  OFFICIAL_POST_DECISION_SOURCE_MANIFEST,
  OFFICIAL_POST_DECISION_SOURCE_INVENTORY_SHA256,
  OFFICIAL_POST_DECISION_SOURCE_ROOT,
} from "../src/official/execution/post-decision-recovery.ts";
import { createOfficialProductionRoot } from "../src/official/execution/production-root.ts";
import { runOfficialStaticPreflight } from "../src/official/integration/preflight.ts";
import type { CodexExecJsonlTransport } from "../src/official/runtime/arm-handler.ts";
import { createMacOsSandboxBackend } from "../src/official/runtime/macos-sandbox-backend.ts";
import { createOfficialRuntimeWorkingDirectory } from "./d00-official-run.ts";

const forbiddenReasoningTransport: CodexExecJsonlTransport = Object.freeze({
  async invoke(): Promise<never> {
    throw new Error("Post-decision recovery forbids every reasoning/model invocation.");
  },
});

function sha256File(repositoryRoot: string, relativePath: string): string {
  return createHash("sha256").update(readFileSync(path.resolve(repositoryRoot, relativePath))).digest("hex");
}

/** Execute only the owner-approved post-decision continuation; no arm hook is reachable. */
export async function main(arguments_: readonly string[] = process.argv.slice(2)): Promise<number> {
  if (arguments_.length !== 2 || arguments_[0] !== "--evaluation-version" || arguments_[1] !== "eval-v1.1.0") {
    throw new Error("Post-decision recovery requires exactly --evaluation-version eval-v1.1.0.");
  }
  const sessionBoundary = process.env.MICRO1_OFFICIAL_SESSION_BOUNDARY;
  if (sessionBoundary !== "SES-20260831-037") {
    throw new Error("Post-decision recovery requires the approved SES-20260831-037 boundary.");
  }
  const repositoryRoot = await realpath(process.cwd());
  const workingDirectoryRoot = await createOfficialRuntimeWorkingDirectory(repositoryRoot);
  try {
    const source = loadOfficialPostDecisionRecoverySource({
      repositoryRoot,
      relativeSourceRoot: OFFICIAL_POST_DECISION_SOURCE_ROOT,
      sourceManifestPath: OFFICIAL_POST_DECISION_SOURCE_MANIFEST,
    });
    const hooks = createOfficialProductionRoot({
      repositoryRoot,
      workingDirectoryRoot,
      osBackend: createMacOsSandboxBackend(),
      reasoningTransport: forbiddenReasoningTransport,
      staticPreflight: runOfficialStaticPreflight,
      hashCandidate: (slot) => sha256File(repositoryRoot, slot.candidate.modulePath),
    });
    const result = await executeOfficialPostDecisionRecovery({
      repositoryRoot,
      relativeSourceRoot: OFFICIAL_POST_DECISION_SOURCE_ROOT,
      sourceManifestPath: OFFICIAL_POST_DECISION_SOURCE_MANIFEST,
      outputRoot: path.resolve(repositoryRoot, OFFICIAL_POST_DECISION_OUTPUT_ROOT),
      provenance: {
        schemaVersion: "beyondgreen-official-post-decision-provenance@1.0.0",
        evaluationVersion: "eval-v1.1.0",
        sessionBoundary,
        sourceOutputRoot: OFFICIAL_POST_DECISION_SOURCE_ROOT,
        sourceBundleSha256: source.manifest.bundleSha256,
        armExecutionCount: 0,
        modelInvocationCount: 0,
        retries: 0,
        recoveryAttemptOrdinal: 4,
        previousCreateOnceRoots: [
          "RUN-BG-OFFICIAL-EVAL-V1.1.0-002-POSTDECISION-001",
          "RUN-BG-OFFICIAL-EVAL-V1.1.0-002-POSTDECISION-002",
          "RUN-BG-OFFICIAL-EVAL-V1.1.0-002-POSTDECISION-003",
        ],
      },
      inventoryDriftDisclosure: {
        expectedSourceInventorySha256: OFFICIAL_POST_DECISION_SOURCE_INVENTORY_SHA256,
        expectedCurrentInventorySha256: OFFICIAL_POST_DECISION_CURRENT_INVENTORY_SHA256,
        reason: OFFICIAL_POST_DECISION_INVENTORY_DRIFT_REASON,
      },
      hooks,
    });
    process.stdout.write(`${JSON.stringify({
      status: "OFFICIAL_POST_DECISION_RECOVERY_COMPLETED",
      sourceBundleSha256: result.sourceBundleSha256,
      armExecutionCount: result.armExecutionCount,
      modelInvocationCount: result.modelInvocationCount,
      captures: result.captureRecordCount,
      evaluatorRecords: result.evaluatorRecordCount,
      evidenceSha256: result.replay.evidenceSha256,
    })}\n`);
    return 0;
  } finally {
    await rm(workingDirectoryRoot, { recursive: true, force: true });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().then((status) => { process.exitCode = status; }).catch((error: unknown) => {
    process.stderr.write(`POST_DECISION_RECOVERY_FAILED ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
