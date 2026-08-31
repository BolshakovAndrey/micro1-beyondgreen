#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { realpath, rm } from "node:fs/promises";
import path from "node:path";

import { executeOfficialObserverRehearsal } from "../src/official/execution/observer-rehearsal.ts";
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
    throw new Error("Observer rehearsal forbids every reasoning/model invocation.");
  },
});

function sha256File(repositoryRoot: string, relativePath: string): string {
  return createHash("sha256").update(readFileSync(path.resolve(repositoryRoot, relativePath))).digest("hex");
}

/** Run the owner-approved observer-only production rehearsal without evidence writes. */
export async function main(): Promise<number> {
  if (process.env.MICRO1_OBSERVER_REHEARSAL_SESSION_BOUNDARY !== "SES-20260831-036") {
    throw new Error("Observer rehearsal requires the approved SES-20260831-036 boundary.");
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
    const result = await executeOfficialObserverRehearsal({ source, hooks });
    process.stdout.write(`${JSON.stringify({ status: "PASS", ...result })}\n`);
    return 0;
  } finally {
    await rm(workingDirectoryRoot, { recursive: true, force: true });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().then((status) => { process.exitCode = status; }).catch((error: unknown) => {
    if (error instanceof OfficialRoleProcessFailureError) {
      process.stderr.write(`OBSERVER_REHEARSAL_FAILED role=${error.failure.role ?? "unknown"} code=${error.failure.errorCode} stage=${error.failure.failureStage ?? "unknown"}\n`);
    } else {
      process.stderr.write("OBSERVER_REHEARSAL_FAILED safe-local-control-error\n");
    }
    process.exitCode = 1;
  });
}
