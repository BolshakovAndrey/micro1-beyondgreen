/** Mounts BG-H05 candidates and exposes only settled arm-visible observations. */
import { JSDOM } from "jsdom";
import React, { act, createRef } from "react";
import { createRoot, type Root } from "react-dom/client";

import {
  SharedUnitStore,
  type ReadoutId,
  type UnitPreference,
  type UnitReadoutComponent,
  type UnitReadoutHandle,
  type UnitSnapshot,
  type UnitStoreObservation,
} from "./contract.ts";

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

function readSnapshot(document: Document, id: ReadoutId): UnitSnapshot | undefined {
  const element = document.querySelector<HTMLElement>(`[data-consumer-id="${id}"]`);
  if (!element) return undefined;
  const unit = element.querySelector(".unit")?.textContent;
  const revision = Number(element.querySelector(".revision")?.textContent);
  if ((unit !== "metric" && unit !== "imperial") || !Number.isInteger(revision)) throw new Error("Invalid readout output.");
  return Object.freeze({ unit, revision });
}

/** Represents an isolated fixture mount with independent consumer lifecycle control. */
export type MountedUnitStoreFixture = Readonly<{
  observe(): UnitStoreObservation;
  toolbarWrite(unit: UnitPreference): Promise<UnitStoreObservation>;
  externalWrite(unit: UnitPreference): Promise<UnitStoreObservation>;
  unmountSouth(): Promise<UnitStoreObservation>;
  remountSouth(): Promise<UnitStoreObservation>;
  snapshotIdentity(): UnitSnapshot;
  dispose(): Promise<UnitStoreObservation>;
}>;

/** Mounts one or two independent consumers against a fresh shared store. */
export async function mountUnitStoreFixture(Component: UnitReadoutComponent, pair = true): Promise<MountedUnitStoreFixture> {
  const dom = new JSDOM("<!doctype html><div id=north></div><div id=south></div>");
  const restoreGlobals = [
    installGlobal("window", dom.window), installGlobal("document", dom.window.document),
    installGlobal("navigator", dom.window.navigator), installGlobal("IS_REACT_ACT_ENVIRONMENT", true),
  ];
  const store = new SharedUnitStore();
  const northContainer = dom.window.document.querySelector("#north");
  const southContainer = dom.window.document.querySelector("#south");
  if (!northContainer || !southContainer) throw new Error("Missing fixture roots.");
  const northRoot = createRoot(northContainer);
  let southRoot: Root | null = null;
  let retainedNorth: UnitSnapshot | undefined;
  let retainedSouth: UnitSnapshot | undefined;
  const northRef = createRef<UnitReadoutHandle>();

  const mountSouth = async () => {
    if (southRoot) return;
    southRoot = createRoot(southContainer);
    await settle(() => southRoot?.render(React.createElement(Component, { consumerId: "south", store })));
  };

  await settle(() => northRoot.render(React.createElement(Component, { consumerId: "north", store, ref: northRef })));
  if (!northRef.current) throw new Error("Candidate did not expose the toolbar handle.");
  if (pair) await mountSouth();

  const observe = (): UnitStoreObservation => Object.freeze({
    store: store.getSnapshot(),
    readouts: Object.freeze({ north: readSnapshot(dom.window.document, "north") ?? retainedNorth, south: readSnapshot(dom.window.document, "south") ?? retainedSouth }),
    subscribers: store.subscriberCount(),
    notifications: store.notificationCounts(),
  });

  return Object.freeze({
    observe,
    async toolbarWrite(unit) { await settle(() => northRef.current?.toolbarWrite(unit)); return observe(); },
    async externalWrite(unit) { await settle(() => store.write(unit)); return observe(); },
    async unmountSouth() {
      retainedSouth = readSnapshot(dom.window.document, "south") ?? retainedSouth;
      if (southRoot) await settle(() => southRoot?.unmount());
      southRoot = null;
      return observe();
    },
    async remountSouth() { await mountSouth(); return observe(); },
    snapshotIdentity() { return store.getSnapshot(); },
    async dispose() {
      retainedNorth = readSnapshot(dom.window.document, "north") ?? retainedNorth;
      retainedSouth = readSnapshot(dom.window.document, "south") ?? retainedSouth;
      if (southRoot) await settle(() => southRoot?.unmount());
      southRoot = null;
      await settle(() => northRoot.unmount());
      const final = observe();
      for (const restore of restoreGlobals.reverse()) restore();
      dom.window.close();
      return final;
    },
  });
}
