import path from "node:path";
import { pathToFileURL } from "node:url";

import { z } from "zod";

import { serveOfficialArmProcess } from "../process/arm-entrypoint.ts";
import { serveOfficialEvaluatorProcess } from "../process/evaluator-entrypoint.ts";
import { serveOfficialScenarioBoundObserverProcess } from "../process/observer-entrypoint.ts";
import { serveOfficialScenarioProviderProcess } from "../process/scenario-provider-entrypoint.ts";
import { atOfficialHandlerStage } from "../process/handler-stage.ts";
import type {
  OfficialEvaluatorHandlerOutput,
  OfficialEvaluatorProcessRequest,
  OfficialScenarioProviderHandlerOutput,
  OfficialScenarioProviderProcessRequest,
} from "../process/ipc.ts";
import { createStatusQuoArmHandler } from "./status-quo-arm-handler.ts";
import { captureD01ObserverBridgeTranscript } from "./d01-bridge.ts";
import { captureDispatchObserverTranscript } from "./dispatch-observer.ts";
import {
  captureBGD03SpecializedTranscript,
  captureBGH01SpecializedTranscript,
  captureBGH02SpecializedTranscript,
  captureBGH05SpecializedTranscript,
} from "./specialized-observers.ts";

const RelativeModuleBindingSchema = z.object({
  modulePath: z.string().min(1),
  exportName: z.string().min(1),
}).strict();

const ProviderPayloadSchema = z.object({ provider: RelativeModuleBindingSchema }).strict();
const EvaluatorPayloadSchema = z.object({ evaluator: RelativeModuleBindingSchema }).strict();
const ObserverPayloadSchema = z.object({
  candidate: RelativeModuleBindingSchema,
  mount: RelativeModuleBindingSchema.nullable(),
}).strict();
const JsonValueSchema = z.json();
type JsonValue = z.infer<typeof JsonValueSchema>;

export type OfficialRuntimeBinding = z.infer<typeof RelativeModuleBindingSchema>;

function repositoryRoot(): string {
  const value = process.env.OFFICIAL_REPOSITORY_ROOT;
  if (!value || !path.isAbsolute(value)) throw new Error("Official role process requires an absolute injected repository root.");
  return value;
}

function resolveModule(binding: OfficialRuntimeBinding): string {
  if (path.posix.isAbsolute(binding.modulePath) || binding.modulePath.includes("\\") || binding.modulePath.includes("\0")) {
    throw new Error("Official runtime binding must be repository relative.");
  }
  const segments = binding.modulePath.split("/");
  if (segments.some((segment) => segment === "" || segment === "." || segment === "..")) {
    throw new Error("Official runtime binding contains an unsafe path segment.");
  }
  const root = repositoryRoot();
  const resolved = path.resolve(root, ...segments);
  const relative = path.relative(root, resolved);
  if (relative.startsWith(`..${path.sep}`) || relative === ".." || path.isAbsolute(relative)) {
    throw new Error("Official runtime binding escapes the repository root.");
  }
  return resolved;
}

async function loadExport(binding: OfficialRuntimeBinding): Promise<unknown> {
  const module = await import(pathToFileURL(resolveModule(binding)).href);
  if (!(binding.exportName in module)) throw new Error("Official runtime export is absent.");
  return module[binding.exportName];
}

async function runScenarioProvider(): Promise<0 | 1> {
  return serveOfficialScenarioProviderProcess(async (request: OfficialScenarioProviderProcessRequest) => {
    const payload = await atOfficialHandlerStage("REQUEST_BINDING", () => ProviderPayloadSchema.parse(request.payload));
    const exported = await atOfficialHandlerStage("LOAD_PROVIDER", () => loadExport(payload.provider));
    const value = await atOfficialHandlerStage(
      "EXECUTE_PROVIDER",
      () => typeof exported === "function" ? exported(request) : exported,
    );
    return value as OfficialScenarioProviderHandlerOutput;
  });
}

async function runEvaluator(): Promise<0 | 1> {
  return serveOfficialEvaluatorProcess(async (request: OfficialEvaluatorProcessRequest) => {
    const payload = await atOfficialHandlerStage("REQUEST_BINDING", () => EvaluatorPayloadSchema.parse(request.payload));
    const exported = await atOfficialHandlerStage("LOAD_EVALUATOR", () => loadExport(payload.evaluator));
    if (typeof exported !== "function") throw new Error("Official evaluator wrapper must be callable.");
    return await atOfficialHandlerStage("EXECUTE_EVALUATOR", () => exported(request)) as OfficialEvaluatorHandlerOutput;
  });
}

async function runObserver(): Promise<0 | 1> {
  return serveOfficialScenarioBoundObserverProcess(async (request) => {
    const payload = await atOfficialHandlerStage("REQUEST_BINDING", () => ObserverPayloadSchema.parse(request.payload));
    const candidate = await atOfficialHandlerStage("LOAD_CANDIDATE", () => loadExport(payload.candidate));
    const mount = payload.mount === null
      ? null
      : await atOfficialHandlerStage("LOAD_MOUNT", () => loadExport(payload.mount!));
    let transcript: JsonValue;
    switch (request.slot.fixtureId) {
      case "BG-D01":
        if (typeof mount !== "function") throw new Error("D01 mount binding is invalid.");
        transcript = JsonValueSchema.parse(await captureD01ObserverBridgeTranscript({ bindings: { component: candidate as never, mount: mount as never }, scenario: request.scenario }));
        break;
      case "BG-D03":
        if (typeof candidate !== "function") throw new Error("D03 constructor binding is invalid.");
        transcript = await atOfficialHandlerStage("EXECUTE_STEP", async () => JsonValueSchema.parse(await captureBGD03SpecializedTranscript({ bindings: { Planner: candidate as never }, scenario: request.scenario })));
        break;
      case "BG-H01":
        if (typeof mount !== "function") throw new Error("H01 mount binding is invalid.");
        transcript = await atOfficialHandlerStage("EXECUTE_STEP", async () => JsonValueSchema.parse(await captureBGH01SpecializedTranscript({ bindings: { component: candidate as never, mount: mount as never }, scenario: request.scenario })));
        break;
      case "BG-H02":
        if (typeof mount !== "function") throw new Error("H02 mount binding is invalid.");
        transcript = await atOfficialHandlerStage("EXECUTE_STEP", async () => JsonValueSchema.parse(await captureBGH02SpecializedTranscript({ bindings: { component: candidate as never, mount: mount as never }, scenario: request.scenario })));
        break;
      case "BG-H05":
        if (typeof mount !== "function") throw new Error("H05 mount binding is invalid.");
        transcript = await atOfficialHandlerStage("EXECUTE_STEP", async () => JsonValueSchema.parse(await captureBGH05SpecializedTranscript({ bindings: { component: candidate as never, mount: mount as never }, scenario: request.scenario })));
        break;
      default:
        if (typeof mount !== "function") throw new Error("Dispatch observer mount binding is invalid.");
        transcript = await atOfficialHandlerStage("EXECUTE_STEP", async () => JsonValueSchema.parse(await captureDispatchObserverTranscript({ bindings: { candidate, mount: mount as never }, scenario: request.scenario })));
    }
    return { transcript };
  });
}

/** Serve one role selected by the OS-isolated launcher; no fallback role exists. */
export async function main(): Promise<0 | 1> {
  switch (process.env.OFFICIAL_ROLE) {
    case "arm": return serveOfficialArmProcess(createStatusQuoArmHandler());
    case "scenario-provider": return runScenarioProvider();
    case "observer": return runObserver();
    case "evaluator": return runEvaluator();
    default: throw new Error("Official role process received no supported role binding.");
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().then((status) => { process.exitCode = status; }).catch(() => { process.exitCode = 1; });
}
