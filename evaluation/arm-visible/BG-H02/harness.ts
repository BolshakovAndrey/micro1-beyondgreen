/** Mounts BG-H02 candidates with a controlled source and deterministic settlement. */
import { JSDOM } from "jsdom";
import React, { act, createRef } from "react";
import { createRoot } from "react-dom/client";

import type { GuideId, GuidePreviewObservation, RequestHandle, StargazingGuideComponent, StargazingGuideHandle } from "./contract.ts";
import { ControlledDeferredGuideSource } from "./deferred-source.ts";

type GlobalKey = "window" | "document" | "navigator" | "IS_REACT_ACT_ENVIRONMENT";
function installGlobal(key: GlobalKey, value: unknown): () => void {
  const previous = Object.getOwnPropertyDescriptor(globalThis, key);
  Object.defineProperty(globalThis, key, { configurable: true, value });
  return () => { if (previous) Object.defineProperty(globalThis, key, previous); else delete (globalThis as Record<string, unknown>)[key]; };
}
async function settle(action: () => void | Promise<void>): Promise<void> { await act(async () => { await action(); await Promise.resolve(); }); await Promise.resolve(); }
function parseLog(text: string | null): string[] { const value: unknown = JSON.parse(text ?? "[]"); if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) throw new Error("Invalid action log."); return value; }

/** Represents a mounted preview controlled only through public fixture capabilities. */
export type MountedStargazingGuidePreview = Readonly<{
  select(guideId: GuideId, label: string): Promise<Readonly<{ handle: RequestHandle; observation: GuidePreviewObservation }>>;
  complete(handle: RequestHandle): Promise<GuidePreviewObservation>;
  reset(): Promise<GuidePreviewObservation>;
  observe(): GuidePreviewObservation;
  dispose(): Promise<void>;
}>;

/** Mounts a candidate and exposes explicit request-completion boundaries. */
export async function mountStargazingGuidePreview(Component: StargazingGuideComponent): Promise<MountedStargazingGuidePreview> {
  const dom = new JSDOM("<!doctype html><div id=app></div>");
  const restoreGlobals = [installGlobal("window", dom.window), installGlobal("document", dom.window), installGlobal("navigator", dom.window.navigator), installGlobal("IS_REACT_ACT_ENVIRONMENT", true)];
  const container = dom.window.document.querySelector("#app");
  if (!container) throw new Error("Missing fixture root.");
  const root = createRoot(container);
  const ref = createRef<StargazingGuideHandle>();
  const source = new ControlledDeferredGuideSource();
  await settle(() => root.render(React.createElement(Component, { source: source.capability(), ref })));
  if (!ref.current) throw new Error("Candidate did not expose the arm-visible handle.");
  const observe = (): GuidePreviewObservation => Object.freeze({
    selectedGuideId: (dom.window.document.querySelector("#selected-guide")?.textContent ?? "none") as GuidePreviewObservation["selectedGuideId"],
    status: (dom.window.document.querySelector("#guide-status")?.textContent ?? "idle") as GuidePreviewObservation["status"],
    content: dom.window.document.querySelector("#guide-content")?.textContent ?? "none",
    actionLog: Object.freeze(parseLog(dom.window.document.querySelector("#action-log")?.textContent ?? null)),
    createdRequestIds: source.createdRequestIds(),
  });
  return Object.freeze({
    async select(guideId, label) { let handle: RequestHandle | undefined; await settle(() => { handle = ref.current?.select(guideId, label); }); if (!handle) throw new Error("Selection did not create a request."); return Object.freeze({ handle, observation: observe() }); },
    async complete(handle) { await settle(() => source.complete(handle)); return observe(); },
    async reset() { await settle(() => ref.current?.reset()); return observe(); },
    observe,
    async dispose() { await settle(() => root.unmount()); for (const restore of restoreGlobals.reverse()) restore(); dom.window.close(); },
  });
}
