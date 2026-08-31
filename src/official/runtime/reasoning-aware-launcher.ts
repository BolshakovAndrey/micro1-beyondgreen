import { readdir, readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";

import type { RoleCapabilityPlan } from "../adapters/types.ts";
import type { OfficialRoleProcessLauncher } from "../execution/production-composition.ts";
import {
  OfficialArmProcessRequestSchema,
  sha256CanonicalJson,
} from "../process/ipc.ts";
import type { CodexExecJsonlTransport } from "./arm-handler.ts";
import { createBeyondGreenArmHandler } from "./arm-handler.ts";

const MAX_PROMPT_BYTES = 768 * 1024;
const SOURCE_SUFFIXES = new Set([".ts", ".tsx", ".js", ".mjs", ".json", ".md"]);

export type PublicSourceBundle = readonly Readonly<{ path: string; content: string }>[];

export interface PublicBundleReader {
  read(capability: RoleCapabilityPlan): Promise<PublicSourceBundle>;
}

function isWithin(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

async function filesUnder(value: string): Promise<readonly string[]> {
  if (!(await stat(value)).isDirectory()) return [value];
  const output: string[] = [];
  for (const entry of await readdir(value, { withFileTypes: true })) {
    const child = path.join(value, entry.name);
    if (entry.isDirectory()) output.push(...await filesUnder(child));
    else if (entry.isFile() && SOURCE_SUFFIXES.has(path.extname(entry.name))) output.push(child);
  }
  return output;
}

/** Read only the candidate, arm-visible package, and package metadata named by the arm capability. */
export function createPublicBundleReader(repositoryRoot: string): PublicBundleReader {
  return {
    async read(capability): Promise<PublicSourceBundle> {
      const root = await realpath(repositoryRoot);
      const selected = capability.allowReadPaths.filter((value) => value === "package.json"
        || value.startsWith("candidates/") || value.startsWith("evaluation/arm-visible/"));
      if (selected.length === 0 || capability.denyReadPaths.some((value) => selected.includes(value))) {
        throw new Error("BeyondGreen arm has no safe public source bundle.");
      }
      const files = new Set<string>();
      for (const relativePath of selected) {
        if (relativePath.includes("verifier-only") || relativePath.includes("..") || path.isAbsolute(relativePath)) {
          throw new Error("BeyondGreen source bundle contains an unsafe path.");
        }
        const physical = await realpath(path.resolve(root, relativePath));
        if (!isWithin(root, physical)) throw new Error("BeyondGreen source bundle escapes the repository root.");
        for (const file of await filesUnder(physical)) files.add(file);
      }
      const bundle: Array<Readonly<{path: string; content: string}>> = [];
      for (const file of [...files].sort((left, right) => left.localeCompare(right, "en"))) {
        const relativePath = path.relative(root, file).split(path.sep).join("/");
        bundle.push(Object.freeze({ path: relativePath, content: await readFile(file, "utf8") }));
      }
      return Object.freeze(bundle);
    },
  };
}

function buildPrompt(bundle: PublicSourceBundle): string {
  const prompt = [
    "You are the BeyondGreen verification arm. Review only the supplied immutable synthetic candidate and public contracts.",
    "Return one JSON object matching the supplied schema. Accept only when evidence is complete; reject only a reproducible defect; otherwise abstain.",
    "Do not request files, tools, network resources, hidden tests, verifier data, or a retry.",
    ...bundle.flatMap(({ path: filePath, content }) => [`\n--- ${filePath} ---\n`, content]),
  ].join("\n");
  if (Buffer.byteLength(prompt, "utf8") > MAX_PROMPT_BYTES) throw new Error("BeyondGreen public source prompt exceeds its byte limit.");
  return prompt;
}

/**
 * Keep the network-denied candidate process launcher separate from the one allowed
 * reasoning transport. BeyondGreen receives an explicit oracle-free source bundle
 * in a disposable empty repository; all other roles use the OS-isolated launcher.
 */
export function createReasoningAwareRoleLauncher(input: Readonly<{
  isolatedLauncher: OfficialRoleProcessLauncher;
  transport: CodexExecJsonlTransport;
  publicBundleReader: PublicBundleReader;
}>): OfficialRoleProcessLauncher {
  return async (launch) => {
    if (launch.role !== "arm" || launch.request === null || typeof launch.request !== "object"
      || !("arm" in launch.request) || launch.request.arm !== "beyondgreen") {
      return input.isolatedLauncher(launch);
    }
    const request = OfficialArmProcessRequestSchema.parse(launch.request);
    const bundle = await input.publicBundleReader.read(launch.capability);
    const handler = createBeyondGreenArmHandler(input.transport);
    const output = await handler({
      ...request,
      payload: {
        prompt: buildPrompt(bundle),
        outputSchemaPath: "schemas/official-arm-output.json",
      },
    });
    const evidenceSha256 = sha256CanonicalJson(output.evidence);
    const core = {
      schemaVersion: "beyondgreen-official-arm-decision@1.0.0" as const,
      slot: request.slot,
      arm: request.arm,
      verdict: output.verdict,
      rationale: output.rationale,
      inputSha256: request.inputSha256,
      evidenceSha256,
      immutable: true as const,
    };
    return Object.freeze({
      response: Object.freeze({
        schemaVersion: "beyondgreen-official-arm-process-result@1.0.0" as const,
        requestId: request.requestId,
        role: "arm" as const,
        status: "ok" as const,
        decision: Object.freeze({ ...core, decisionSha256: sha256CanonicalJson(core) }),
      }),
      reasoningInvocationCount: 1 as const,
      retryCount: 0 as const,
    });
  };
}
