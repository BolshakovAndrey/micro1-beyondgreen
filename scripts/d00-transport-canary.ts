#!/usr/bin/env node

import { rm } from "node:fs/promises";

import {
  CODEX_EXEC_JSONL_ADAPTER_ID,
  CODEX_EXEC_MODEL,
} from "../src/official/reasoning/contract.ts";
import {
  createCodexExecJsonlTransport,
  type CodexProcessRunner,
} from "../src/official/runtime/codex-transport.ts";
import { createOfficialRuntimeWorkingDirectory } from "./d00-official-run.ts";

export const PUBLIC_TRANSPORT_CANARY_PROMPT = [
  "This is a public, non-scored transport health check.",
  "Use no tools or external data.",
  "Return exactly one schema-valid JSON result with verdict abstain,",
  "a short rationale stating that this is a transport-only health check,",
  "and evidence containing only canary=public_transport_only and externalDataUsed=false.",
].join(" ");

export type PublicTransportCanarySummary = Readonly<{
  status: "PASS" | "FAIL";
  adapter: typeof CODEX_EXEC_JSONL_ADAPTER_ID;
  model: typeof CODEX_EXEC_MODEL;
  invocationCount: 0 | 1;
  retryCount: 0;
  durationMs: number;
  schemaValid: boolean;
  failureCode: string | null;
  officialOrScoredRun: false;
  unblindingPerformed: false;
  rawOutputPublished: false;
}>;

/** Execute one public transport-only call and expose no model JSONL or response body. */
export async function runPublicTransportCanary(input: Readonly<{
  repositoryRoot?: string;
  runner?: CodexProcessRunner;
  now?: () => number;
}> = {}): Promise<PublicTransportCanarySummary> {
  const repositoryRoot = input.repositoryRoot ?? process.cwd();
  const now = input.now ?? Date.now;
  const startedAt = now();
  let invocationCount: 0 | 1 = 0;
  let workingDirectoryRoot: string | undefined;
  try {
    workingDirectoryRoot = await createOfficialRuntimeWorkingDirectory(repositoryRoot);
    const transport = createCodexExecJsonlTransport({ workingDirectoryRoot, runner: input.runner });
    invocationCount = 1;
    // The production transport does not inspect this metadata object. Keeping it
    // empty ensures the canary cannot accidentally acquire evaluation identity.
    const result = await transport.invoke({
      request: Object.freeze({}) as never,
      prompt: PUBLIC_TRANSPORT_CANARY_PROMPT,
      outputSchemaPath: "schemas/official-arm-output.json",
    });
    const durationMs = Math.max(0, now() - startedAt);
    if (result.ok) {
      return Object.freeze({
        status: "PASS",
        adapter: CODEX_EXEC_JSONL_ADAPTER_ID,
        model: CODEX_EXEC_MODEL,
        invocationCount: result.invocationCount,
        retryCount: result.retryCount,
        durationMs,
        schemaValid: true,
        failureCode: null,
        officialOrScoredRun: false,
        unblindingPerformed: false,
        rawOutputPublished: false,
      });
    }
    return Object.freeze({
      status: "FAIL",
      adapter: CODEX_EXEC_JSONL_ADAPTER_ID,
      model: CODEX_EXEC_MODEL,
      invocationCount: result.failure.invocationCount,
      retryCount: 0,
      durationMs,
      schemaValid: false,
      failureCode: result.failure.code,
      officialOrScoredRun: false,
      unblindingPerformed: false,
      rawOutputPublished: false,
    });
  } catch {
    return Object.freeze({
      status: "FAIL",
      adapter: CODEX_EXEC_JSONL_ADAPTER_ID,
      model: CODEX_EXEC_MODEL,
      invocationCount,
      retryCount: 0,
      durationMs: Math.max(0, now() - startedAt),
      schemaValid: false,
      failureCode: "UNEXPECTED_TRANSPORT_EXCEPTION",
      officialOrScoredRun: false,
      unblindingPerformed: false,
      rawOutputPublished: false,
    });
  } finally {
    if (workingDirectoryRoot) await rm(workingDirectoryRoot, { recursive: true, force: true });
  }
}

async function main(): Promise<number> {
  const summary = await runPublicTransportCanary();
  process.stdout.write(`${JSON.stringify(summary)}\n`);
  return summary.status === "PASS" ? 0 : 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().then((status) => { process.exitCode = status; }).catch(() => { process.exitCode = 1; });
}
