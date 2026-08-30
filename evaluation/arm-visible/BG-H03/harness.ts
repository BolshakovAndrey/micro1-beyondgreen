/** Mounts BG-H03 candidates and exposes deterministic settled observations. */
import { JSDOM } from "jsdom";
import { createElement, createRef, act } from "react";
import { createRoot } from "react-dom/client";

import type { SelectionAction, SelectionDeskComponent, SelectionDeskHandle, SelectionObservation } from "./contract.ts";

type GlobalKey = "window" | "document" | "navigator" | "IS_REACT_ACT_ENVIRONMENT";

function installGlobal(key: GlobalKey, value: unknown): () => void {
  const previous = Object.getOwnPropertyDescriptor(globalThis, key);
  Object.defineProperty(globalThis, key, { configurable: true, value });
  return () => { if (previous) Object.defineProperty(globalThis, key, previous); else delete (globalThis as Record<string, unknown>)[key]; };
}

async function settle(action: () => void | Promise<void>): Promise<void> {
  await act(async () => { await action(); await Promise.resolve(); });
  await Promise.resolve();
}

/** Represents one mounted candidate with settled action and observation boundaries. */
export type MountedSelectionDesk = Readonly<{
  dispatch(action: SelectionAction): Promise<SelectionObservation>;
  observe(): SelectionObservation;
  dispose(): Promise<void>;
}>;

/** Mounts a candidate in an isolated jsdom document. */
export async function mountSelectionDesk(Component: SelectionDeskComponent): Promise<MountedSelectionDesk> {
  const dom = new JSDOM("<!doctype html><div id=app></div>");
  const restoreGlobals = [
    installGlobal("window", dom.window), installGlobal("document", dom.window.document),
    installGlobal("navigator", dom.window.navigator), installGlobal("IS_REACT_ACT_ENVIRONMENT", true),
  ];
  const container = dom.window.document.querySelector("#app");
  if (!container) throw new Error("Missing BG-H03 fixture root.");
  const root = createRoot(container);
  const ref = createRef<SelectionDeskHandle>();
  await settle(() => root.render(createElement(Component, { ref })));
  if (!ref.current) throw new Error("BG-H03 candidate did not expose its public handle.");
  const observe = () => {
    if (!ref.current) throw new Error("BG-H03 candidate handle became unavailable.");
    return ref.current.observe();
  };
  return Object.freeze({
    async dispatch(action) { await settle(() => ref.current?.dispatch(action)); return observe(); },
    observe,
    async dispose() { await settle(() => root.unmount()); for (const restore of restoreGlobals.reverse()) restore(); dom.window.close(); },
  });
}
