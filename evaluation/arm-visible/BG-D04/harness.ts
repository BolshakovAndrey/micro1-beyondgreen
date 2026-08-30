/** Mounts a candidate panel in jsdom and exposes settled arm-visible observations. */
import { JSDOM } from "jsdom";
import React, { act, createRef, type ComponentType, type Ref } from "react";
import { createRoot } from "react-dom/client";

import { bulletinSource, type BulletinAction, type BulletinObservation, type BulletinPanelHandle } from "./contract.ts";

type GlobalKey = "window" | "document" | "navigator" | "IS_REACT_ACT_ENVIRONMENT";
type BulletinPanelComponent = ComponentType<{ ref?: Ref<BulletinPanelHandle> }>;

function installGlobal(key: GlobalKey, value: unknown): () => void {
  const previous = Object.getOwnPropertyDescriptor(globalThis, key);
  Object.defineProperty(globalThis, key, { configurable: true, value });
  return () => {
    if (previous) Object.defineProperty(globalThis, key, previous);
    else delete (globalThis as Record<string, unknown>)[key];
  };
}

async function settle(action: () => void | Promise<void>): Promise<void> {
  await act(async () => {
    await action();
    await Promise.resolve();
  });
  await Promise.resolve();
}

/** Defines the isolated public test harness for one candidate mount. */
export type MountedBulletinPanel = Readonly<{
  dispatch(action: BulletinAction): Promise<BulletinObservation>;
  observe(): BulletinObservation;
  dispose(): Promise<Readonly<Record<"harbor" | "orchard", number>>>;
}>;

/** Creates an isolated DOM mount after clearing only prior fixture test state. */
export async function mountBulletinPanel(Component: BulletinPanelComponent): Promise<MountedBulletinPanel> {
  bulletinSource.resetForFixture();
  const dom = new JSDOM("<!doctype html><div id=app></div>");
  const restoreGlobals = [
    installGlobal("window", dom.window),
    installGlobal("document", dom.window.document),
    installGlobal("navigator", dom.window.navigator),
    installGlobal("IS_REACT_ACT_ENVIRONMENT", true),
  ];
  const container = dom.window.document.querySelector("#app");
  if (!container) throw new Error("Missing fixture root.");
  const root = createRoot(container);
  const ref = createRef<BulletinPanelHandle>();
  await settle(() => root.render(React.createElement(Component, { ref })));
  if (!ref.current) throw new Error("Candidate did not expose the arm-visible handle.");

  const observe = (): BulletinObservation => {
    const selectedChannel = dom.window.document.querySelector("#selected-channel")?.textContent;
    const bulletin = dom.window.document.querySelector("#bulletin")?.textContent;
    if (selectedChannel !== "harbor" && selectedChannel !== "orchard") throw new Error("Invalid selected channel output.");
    if (bulletin === null || bulletin === undefined) throw new Error("Missing bulletin output.");
    return Object.freeze({ selectedChannel, bulletin, subscribers: bulletinSource.counts() });
  };

  return Object.freeze({
    async dispatch(action) {
      await settle(() => ref.current?.dispatch(action));
      return observe();
    },
    observe,
    async dispose() {
      await settle(() => root.unmount());
      const counts = bulletinSource.counts();
      for (const restore of restoreGlobals.reverse()) restore();
      dom.window.close();
      return counts;
    },
  });
}
