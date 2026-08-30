/** Mounts BG-H04 candidates and exposes deterministic lifecycle observations. */
import { JSDOM } from "jsdom";
import { act, createElement, createRef } from "react";
import { createRoot } from "react-dom/client";

import { createLifecycleLedger, type AstronomyDrawerComponent, type AstronomyDrawerHandle, type DrawerAction, type DrawerObservation } from "./contract.ts";

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
function parseLog(text: string | null): readonly string[] {
  const value: unknown = JSON.parse(text ?? "[]");
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) throw new Error("Invalid BG-H04 action log.");
  return Object.freeze(value);
}

/** Represents one mounted parent and its public lifecycle evidence. */
export type MountedAstronomyDrawer = Readonly<{
  dispatch(action: DrawerAction): Promise<DrawerObservation>;
  observe(): DrawerObservation;
  dispose(): Promise<DrawerObservation>;
}>;

/** Mounts a candidate in an isolated jsdom document with a fresh ledger. */
export async function mountAstronomyDrawer(Component: AstronomyDrawerComponent): Promise<MountedAstronomyDrawer> {
  const dom = new JSDOM("<!doctype html><div id=app></div>");
  const restoreGlobals = [
    installGlobal("window", dom.window), installGlobal("document", dom.window.document),
    installGlobal("navigator", dom.window.navigator), installGlobal("IS_REACT_ACT_ENVIRONMENT", true),
  ];
  const container = dom.window.document.querySelector("#app");
  if (!container) throw new Error("Missing BG-H04 fixture root.");
  const root = createRoot(container);
  const ledger = createLifecycleLedger();
  const ref = createRef<AstronomyDrawerHandle>();
  await settle(() => root.render(createElement(Component, { ledger, ref })));
  if (!ref.current) throw new Error("BG-H04 candidate did not expose its public handle.");
  const observe = (): DrawerObservation => {
    const drawer = dom.window.document.querySelector<HTMLElement>("[data-drawer='station-notes']");
    const counts = ledger.snapshot();
    return Object.freeze({
      stationId: "north-pad", sourceNote: dom.window.document.querySelector("#source-note")?.textContent ?? "",
      active: dom.window.document.querySelector("#active")?.textContent === "true",
      drawerPresent: drawer !== null, drawerVisible: drawer !== null && !drawer.hidden,
      generation: drawer ? Number(drawer.dataset.generation) : null,
      draft: drawer?.querySelector("#drawer-draft")?.textContent ?? null,
      ...counts, actionLog: parseLog(dom.window.document.querySelector("#action-log")?.textContent ?? null),
    });
  };
  return Object.freeze({
    async dispatch(action) { await settle(() => ref.current?.dispatch(action)); return observe(); },
    observe,
    async dispose() {
      const beforeUnmount = observe();
      await settle(() => root.unmount());
      const counts = ledger.snapshot();
      const value = Object.freeze({
        ...beforeUnmount, drawerPresent: false, drawerVisible: false,
        generation: null, draft: null, ...counts,
        actionLog: Object.freeze([...beforeUnmount.actionLog, "unmount-parent"]),
      });
      for (const restore of restoreGlobals.reverse()) restore(); dom.window.close(); return value;
    },
  });
}
