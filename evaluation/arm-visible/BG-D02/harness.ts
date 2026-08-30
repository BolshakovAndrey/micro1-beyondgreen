/** Mounts BG-D02 candidates in an isolated jsdom environment and reads public observables. */
import { JSDOM } from "jsdom";
import React, { act, createRef } from "react";
import { createRoot } from "react-dom/client";

import type { DispatchAction, DispatchObservation, ParcelDispatchComponent, ParcelDispatchHandle } from "./contract.ts";

type GlobalKey = "window" | "document" | "navigator" | "IS_REACT_ACT_ENVIRONMENT";

function installGlobal(key: GlobalKey, value: unknown): () => void {
  const previous = Object.getOwnPropertyDescriptor(globalThis, key);
  Object.defineProperty(globalThis, key, { configurable: true, value });
  return () => { if (previous) Object.defineProperty(globalThis, key, previous); else delete (globalThis as Record<string, unknown>)[key]; };
}

function parseJsonArray(text: string | null): string[] {
  const value: unknown = JSON.parse(text ?? "[]");
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) throw new Error("Invalid observable array.");
  return value;
}

async function settle(action: () => void | Promise<void>): Promise<void> {
  await act(async () => { await action(); await Promise.resolve(); });
  await Promise.resolve();
}

/** Represents a mounted candidate whose state is available only through public fixture observables. */
export type MountedParcelDispatchBoard = Readonly<{
  dispatch(action: DispatchAction): Promise<DispatchObservation>;
  observe(): DispatchObservation;
  dispose(): Promise<void>;
}>;

/** Mounts a candidate and provides deterministic action and observation boundaries. */
export async function mountParcelDispatchBoard(Component: ParcelDispatchComponent): Promise<MountedParcelDispatchBoard> {
  const dom = new JSDOM("<!doctype html><div id=app></div>");
  const restoreGlobals = [
    installGlobal("window", dom.window), installGlobal("document", dom.window),
    installGlobal("navigator", dom.window.navigator), installGlobal("IS_REACT_ACT_ENVIRONMENT", true),
  ];
  const container = dom.window.document.querySelector("#app");
  if (!container) throw new Error("Missing fixture root.");
  const root = createRoot(container);
  const ref = createRef<ParcelDispatchHandle>();
  await settle(() => root.render(React.createElement(Component, { ref })));
  if (!ref.current) throw new Error("Candidate did not expose the arm-visible handle.");

  const observe = (): DispatchObservation => {
    const lanes = [...dom.window.document.querySelectorAll<HTMLElement>("[data-lane-id]")];
    return Object.freeze({
      laneIds: Object.freeze(lanes.map((lane) => lane.dataset.laneId ?? "")),
      pending: Object.freeze(lanes.map((lane) => Number(lane.querySelector(".pending")?.textContent))),
      dispatched: Object.freeze(lanes.map((lane) => Number(lane.querySelector(".dispatched")?.textContent))),
      selectedIds: Object.freeze(parseJsonArray(dom.window.document.querySelector("#selection")?.textContent ?? null)),
      unit: Number(dom.window.document.querySelector("#dispatch-unit")?.textContent),
      actionLog: Object.freeze(parseJsonArray(dom.window.document.querySelector("#action-log")?.textContent ?? null)),
    });
  };
  return Object.freeze({
    async dispatch(action) { await settle(() => ref.current?.dispatch(action)); return observe(); },
    observe,
    async dispose() { await settle(() => root.unmount()); for (const restore of restoreGlobals.reverse()) restore(); dom.window.close(); },
  });
}
