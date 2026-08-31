#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { realpath, rm } from "node:fs/promises";
import path from "node:path";

import { executeOfficialEvaluatorRehearsal } from "../src/official/execution/evaluator-rehearsal.ts";
import {
  loadOfficialPostDecisionRecoverySource,
  OFFICIAL_POST_DECISION_SOURCE_MANIFEST,
  OFFICIAL_POST_DECISION_SOURCE_ROOT,
} from "../src/official/execution/post-decision-recovery.ts";
import { createOfficialProductionRoot } from "../src/official/execution/production-root.ts";
import { OfficialRoleProcessFailureError } from "../src/official/execution/production-composition.ts";
import { runOfficialStaticPreflight } from "../src/official/integration/preflight.ts";
import type { CodexExecJsonlTransport } from "../src/official/runtime/arm-handler.ts";
import { createMacOsSandboxBackend } from "../src/official/runtime/macos-sandbox-backend.ts";
import { createOfficialRuntimeWorkingDirectory } from "./d00-official-run.ts";

const forbiddenReasoningTransport: CodexExecJsonlTransport = Object.freeze({
  async invoke(): Promise<never> {
    throw new Error("Evaluator rehearsal forbids every reasoning/model invocation.");
  },
});

function sha256File(repositoryRoot: string, relativePath: string): string {
  return createHash("sha256").update(readFileSync(path.resolve(repositoryRoot, relativePath))).digest("hex");
}

function frozenGroundTruth(repositoryRoot: string, fixtureId: string, candidateId: string): "preserving" | "false_green" {
  const source = JSON.parse(readFileSync(
    path.join(repositoryRoot, "evaluation", "verifier-only", fixtureId, "ground-truth.json"),
    "utf8",
  )) as Record<string, unknown>;
  const candidates = source.candidates as Record<string, unknown> | undefined;
  const value = fixtureId === "BG-D03"
    ? source[candidateId.replace("-", "_")]
    : candidates?.[candidateId];
  if (value !== "preserving" && value !== "false_green") {
    throw new Error("Frozen ground-truth mapping is missing or malformed.");
  }
  return value;
}

/** Run the owner-approved complete evaluator rehearsal without official writes. */
export async function main(): Promise<number> {
  if (process.env.MICRO1_EVALUATOR_REHEARSAL_SESSION_BOUNDARY !== "SES-20260831-037") {
    throw new Error("Evaluator rehearsal requires the approved SES-20260831-037 boundary.");
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
    const result = await executeOfficialEvaluatorRehearsal({
      source,
      hooks,
      expectedGroundTruth: (fixtureId, candidateId) => frozenGroundTruth(repositoryRoot, fixtureId, candidateId),
    });
    process.stdout.write(`${JSON.stringify({ status: "PASS", ...result })}\n`);
    return 0;
  } finally {
    await rm(workingDirectoryRoot, { recursive: true, force: true });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().then((status) => { process.exitCode = status; }).catch((error: unknown) => {
    if (error instanceof OfficialRoleProcessFailureError) {
      process.stderr.write(`EVALUATOR_REHEARSAL_FAILED request=${error.failure.requestId ?? "unknown"} role=${error.failure.role ?? "unknown"} code=${error.failure.errorCode} stage=${error.failure.failureStage ?? "unknown"}\n`);
    } else {
      process.stderr.write(`EVALUATOR_REHEARSAL_FAILED ${error instanceof Error ? error.message : "safe-local-control-error"}\n`);
    }
    process.exitCode = 1;
  });
}
