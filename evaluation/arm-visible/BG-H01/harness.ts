/** Mounts BG-H01 candidates in jsdom and exposes deterministic parent transitions. */
import { JSDOM } from "jsdom";
import React, { act, createRef } from "react";
import { createRoot } from "react-dom/client";

import { assertCardProps, type CardProps, type CardTheme, type DisplayCardEditorComponent, type DisplayCardEditorHandle, type DisplayCardObservation, type EditorAction } from "./contract.ts";

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

function parseLog(text: string | null): string[] {
  const value: unknown = JSON.parse(text ?? "[]");
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) throw new Error("Invalid action log.");
  return value;
}

/** Represents one mounted editor controlled only through arm-visible capabilities. */
export type MountedDisplayCardEditor = Readonly<{
  dispatch(action: EditorAction): Promise<DisplayCardObservation>;
  rerender(props: CardProps, transitionLabel: string): Promise<DisplayCardObservation>;
  observe(): DisplayCardObservation;
  dispose(): Promise<void>;
}>;

/** Mounts a candidate with validated props and deterministic settled observations. */
export async function mountDisplayCardEditor(Component: DisplayCardEditorComponent, initial: CardProps): Promise<MountedDisplayCardEditor> {
  assertCardProps(initial);
  const dom = new JSDOM("<!doctype html><div id=app></div>");
  const restoreGlobals = [
    installGlobal("window", dom.window), installGlobal("document", dom.window),
    installGlobal("navigator", dom.window.navigator), installGlobal("IS_REACT_ACT_ENVIRONMENT", true),
  ];
  const container = dom.window.document.querySelector("#app");
  if (!container) throw new Error("Missing fixture root.");
  const root = createRoot(container);
  const ref = createRef<DisplayCardEditorHandle>();
  let revision = 0;
  await settle(() => root.render(React.createElement(Component, { ...initial, revision, transitionLabel: "mount-card-01", ref })));
  if (!ref.current) throw new Error("Candidate did not expose the arm-visible handle.");

  const observe = (): DisplayCardObservation => Object.freeze({
    cardId: dom.window.document.querySelector("#card-id")?.textContent ?? "",
    title: dom.window.document.querySelector("#draft-title")?.textContent ?? "",
    theme: (dom.window.document.querySelector("#draft-theme")?.textContent ?? "") as CardTheme,
    dirty: dom.window.document.querySelector("#dirty")?.textContent === "true",
    actionLog: Object.freeze(parseLog(dom.window.document.querySelector("#action-log")?.textContent ?? null)),
  });

  return Object.freeze({
    async dispatch(action) { await settle(() => ref.current?.dispatch(action)); return observe(); },
    async rerender(props, transitionLabel) {
      // Validation precedes revision advancement so rejected input cannot partially
      // mutate either the candidate or the harness transition sequence.
      assertCardProps(props);
      revision += 1;
      await settle(() => root.render(React.createElement(Component, { ...props, revision, transitionLabel, ref })));
      return observe();
    },
    observe,
    async dispose() { await settle(() => root.unmount()); for (const restore of restoreGlobals.reverse()) restore(); dom.window.close(); },
  });
}
