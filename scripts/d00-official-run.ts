#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { mkdtemp, realpath, rm } from "node:fs/promises";
import path from "node:path";

import {
  createOfficialProductionRoot,
  executeOfficialEvaluation,
  type OfficialExecutionHooks,
} from "../src/official/execution/index.ts";
import { runOfficialStaticPreflight } from "../src/official/integration/preflight.ts";
import {
  createCodexExecJsonlTransport,
  createMacOsSandboxBackend,
} from "../src/official/runtime/index.ts";

const OUTPUT_ROOT = "artifacts/evaluation/official/RUN-BG-OFFICIAL-EVAL-V1.1.0-001";

function isInside(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return relative !== "" && relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

/** Create the disposable runtime root inside the clean repository capability boundary. */
export async function createOfficialRuntimeWorkingDirectory(repositoryRoot: string): Promise<string> {
  const root = await realpath(repositoryRoot);
  const workingDirectoryRoot = await mkdtemp(path.join(root, ".official-runtime-"));
  if (!isInside(root, workingDirectoryRoot)) {
    await rm(workingDirectoryRoot, { recursive: true, force: true });
    throw new Error("Official runtime working directory escaped the clean repository root.");
  }
  return workingDirectoryRoot;
}

function sha256File(repositoryRoot: string, relativePath: string): string {
  return createHash("sha256").update(readFileSync(path.resolve(repositoryRoot, relativePath))).digest("hex");
}

/**
 * Repository composition requires explicit role hooks so candidate/evaluator
 * capabilities cannot be silently inherited by the command process.
 */
export async function runOfficialEvaluationCommand(
  hooks: OfficialExecutionHooks,
  repositoryRoot = process.cwd(),
  sessionBoundary: string,
): Promise<void> {
  const result = await executeOfficialEvaluation({
    repositoryRoot,
    outputRoot: path.resolve(repositoryRoot, OUTPUT_ROOT),
    syntheticOnly: false,
    provenance: {
      schemaVersion: "beyondgreen-official-provenance@1.0.0",
      evaluationVersion: "eval-v1.1.0",
      sessionBoundary,
      adapter: "codex-exec-jsonl-v1",
      attemptsPerArmCandidate: 1,
      retries: 0,
    },
    hooks,
  });
  process.stdout.write(`${JSON.stringify({
    status: "OFFICIAL_EVALUATION_COMPLETED",
    evaluationVersion: "eval-v1.1.0",
    slots: result.slotCount,
    armPlans: result.armPlanCount,
    captures: result.captureRecordCount,
    observationPairs: result.finalizedPairCount,
    evidenceSha256: result.replay.evidenceSha256,
  })}\n`);
}

async function main(arguments_: readonly string[] = process.argv.slice(2)): Promise<number> {
  if (arguments_.length !== 2 || arguments_[0] !== "--evaluation-version" || arguments_[1] !== "eval-v1.1.0") {
    throw new Error("Official evaluation requires exactly --evaluation-version eval-v1.1.0.");
  }
  const sessionBoundary = process.env.MICRO1_OFFICIAL_SESSION_BOUNDARY;
  if (!sessionBoundary || !/^SES-[0-9]{8}-[0-9]{3}$/u.test(sessionBoundary)) {
    throw new Error("Official execution requires an explicitly approved MICRO1_OFFICIAL_SESSION_BOUNDARY.");
  }
  const repositoryRoot = process.cwd();
  const workingDirectoryRoot = await createOfficialRuntimeWorkingDirectory(repositoryRoot);
  try {
    const hooks = createOfficialProductionRoot({
      repositoryRoot,
      workingDirectoryRoot,
      osBackend: createMacOsSandboxBackend(),
      reasoningTransport: createCodexExecJsonlTransport({ workingDirectoryRoot }),
      staticPreflight: runOfficialStaticPreflight,
      hashCandidate: (slot) => sha256File(repositoryRoot, slot.candidate.modulePath),
    });
    await runOfficialEvaluationCommand(hooks, repositoryRoot, sessionBoundary);
    return 0;
  } finally {
    await rm(workingDirectoryRoot, { recursive: true, force: true });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().then((status) => { process.exitCode = status; }).catch((error: unknown) => {
    process.stderr.write(`OFFICIAL_EVALUATION_FAILED ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
