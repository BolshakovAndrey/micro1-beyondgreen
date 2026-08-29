import { JSDOM } from "jsdom";
import React, { act, createRef } from "react";
import { createRoot } from "react-dom/client";

import type {
  BoardAction,
  BoardObservation,
  MuseumBoardComponent,
  MuseumBoardHandle,
} from "./contract.ts";

type GlobalKey = "window" | "document" | "navigator" | "IS_REACT_ACT_ENVIRONMENT";

function installGlobal(key: GlobalKey, value: unknown) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, key);
  Object.defineProperty(globalThis, key, { configurable: true, value });
  return () => {
    if (previous) Object.defineProperty(globalThis, key, previous);
    else delete (globalThis as Record<string, unknown>)[key];
  };
}

function parseJsonArray(text: string | null): string[] {
  const value: unknown = JSON.parse(text ?? "[]");
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new Error("Invalid observable array.");
  }
  return value;
}

async function settle(action: () => void | Promise<void>) {
  await act(async () => {
    await action();
    await Promise.resolve();
  });
  await Promise.resolve();
}

export type MountedMuseumBoard = Readonly<{
  dispatch(action: BoardAction): Promise<BoardObservation>;
  observe(): BoardObservation;
  dispose(): Promise<void>;
}>;

export async function mountMuseumBoard(Component: MuseumBoardComponent): Promise<MountedMuseumBoard> {
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
  const ref = createRef<MuseumBoardHandle>();
  await settle(() => root.render(React.createElement(Component, { ref })));
  if (!ref.current) throw new Error("Candidate did not expose the arm-visible handle.");

  const observe = (): BoardObservation => {
    const cards = [ ...dom.window.document.querySelectorAll<HTMLElement>("[data-card-id]") ];
    return Object.freeze({
      cardIds: Object.freeze(cards.map((card) => card.dataset.cardId ?? "")),
      allocations: Object.freeze(cards.map((card) => Number(card.querySelector(".allocation")?.textContent))),
      selectedIds: Object.freeze(parseJsonArray(dom.window.document.querySelector("#selection")?.textContent ?? null)),
      step: Number(dom.window.document.querySelector("#bulk-step")?.textContent),
      actionLog: Object.freeze(parseJsonArray(dom.window.document.querySelector("#action-log")?.textContent ?? null)),
    });
  };

  return Object.freeze({
    async dispatch(action) {
      await settle(() => ref.current?.dispatch(action));
      return observe();
    },
    observe,
    async dispose() {
      await settle(() => root.unmount());
      for (const restore of restoreGlobals.reverse()) restore();
      dom.window.close();
    },
  });
}
