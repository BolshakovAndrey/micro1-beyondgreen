/** Mounts a BG-H06 candidate and exposes settled arm-visible observations. */
import { JSDOM } from "jsdom";
import React, { act, createRef } from "react";
import { createRoot } from "react-dom/client";

import type { ThemeAction, ThemeObservation, ThemePanelComponent, ThemePanelHandle } from "./contract.ts";

type GlobalKey = "window" | "document" | "navigator" | "IS_REACT_ACT_ENVIRONMENT";

function installGlobal(key: GlobalKey, value: unknown): () => void {
  const previous = Object.getOwnPropertyDescriptor(globalThis, key);
  Object.defineProperty(globalThis, key, { configurable: true, value });
  return () => previous
    ? Object.defineProperty(globalThis, key, previous)
    : delete (globalThis as Record<string, unknown>)[key];
}

async function settle(action: () => void | Promise<void>): Promise<void> {
  await act(async () => { await action(); await Promise.resolve(); });
  await Promise.resolve();
}

/** Represents one isolated theme panel mounted in jsdom. */
export type MountedThemePanel = Readonly<{
  dispatch(action: ThemeAction): Promise<ThemeObservation>;
  observe(): ThemeObservation;
  dispose(): Promise<void>;
}>;

/** Mounts a candidate and returns only its public deterministic surface. */
export async function mountThemePanel(Component: ThemePanelComponent): Promise<MountedThemePanel> {
  const dom = new JSDOM("<!doctype html><div id=app></div>");
  const restoreGlobals = [
    installGlobal("window", dom.window), installGlobal("document", dom.window.document),
    installGlobal("navigator", dom.window.navigator), installGlobal("IS_REACT_ACT_ENVIRONMENT", true),
  ];
  const container = dom.window.document.querySelector("#app");
  if (!container) throw new Error("Missing fixture root.");
  const root = createRoot(container);
  const ref = createRef<ThemePanelHandle>();
  await settle(() => root.render(React.createElement(Component, { ref })));
  if (!ref.current) throw new Error("Candidate did not expose the theme-panel handle.");

  const observe = (): ThemeObservation => {
    const displayedTheme = dom.window.document.querySelector("#displayed-theme")?.textContent;
    const committedTheme = dom.window.document.querySelector("#committed-theme")?.textContent;
    const status = dom.window.document.querySelector("#save-status")?.textContent;
    const errorText = dom.window.document.querySelector("#save-error")?.textContent;
    const pendingCount = Number(dom.window.document.querySelector("#pending-count")?.textContent);
    if ((displayedTheme !== "light" && displayedTheme !== "dark") || (committedTheme !== "light" && committedTheme !== "dark")) throw new Error("Invalid theme output.");
    if (status !== "idle" && status !== "saving") throw new Error("Invalid status output.");
    if (errorText !== "none" && errorText !== "save_failed") throw new Error("Invalid error output.");
    if (pendingCount !== 0 && pendingCount !== 1) throw new Error("Invalid pending count.");
    return Object.freeze({ displayedTheme, committedTheme, status, error: errorText === "none" ? null : errorText, pendingCount });
  };

  return Object.freeze({
    async dispatch(action) { await settle(() => ref.current?.dispatch(action)); return observe(); },
    observe,
    async dispose() { await settle(() => root.unmount()); for (const restore of restoreGlobals.reverse()) restore(); dom.window.close(); },
  });
}
