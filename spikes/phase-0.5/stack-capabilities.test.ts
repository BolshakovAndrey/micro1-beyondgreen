import assert from "node:assert/strict";
import test from "node:test";

import { batch, computed, effect, signal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { z } from "zod";

test("BG-D01 stale snapshots remain observable and sequential reads preserve both updates", () => {
  const count = signal(0);
  const stale = count.value;
  count.value = stale + 1;
  count.value = stale + 1;
  assert.equal(count.value, 1);

  count.value = 0;
  count.value = count.value + 1;
  count.value = count.value + 1;
  assert.equal(count.value, 2);
});

test("BG-D02 batch coalesces queued updates into one observed state", () => {
  const value = signal(0);
  const observations = [];
  const dispose = effect(() => observations.push(value.value));
  batch(() => {
    value.value = 1;
    value.value = 2;
  });
  dispose();
  assert.deepEqual(observations, [ 0, 2 ]);
});

test("BG-D03 computed state updates from its dependencies", () => {
  const adults = signal(3);
  const children = signal(2);
  const total = computed(() => adults.value + children.value);
  assert.equal(total.value, 5);
  children.value = 4;
  assert.equal(total.value, 7);
});

test("BG-D04 subscriptions clean up exactly once", () => {
  const source = signal(0);
  let runs = 0;
  const dispose = effect(() => {
    source.value;
    runs += 1;
  });
  source.value = 1;
  dispose();
  dispose();
  source.value = 2;
  assert.equal(runs, 2);
});

test("BG-H01 explicit prop reset replaces local state", () => {
  const local = signal("draft-a");
  const resetFromProp = (next) => { local.value = next; };
  local.value = "edited";
  resetFromProp("draft-b");
  assert.equal(local.value, "draft-b");
});

test("BG-H02 sequence guard rejects a late asynchronous result", async () => {
  const result = signal("initial");
  let sequence = 0;
  const apply = async (label, delay) => {
    const own = ++sequence;
    await new Promise((resolve) => setTimeout(resolve, delay));
    if (own === sequence) result.value = label;
  };
  await Promise.all([ apply("late", 8), apply("latest", 0) ]);
  assert.equal(result.value, "latest");
});

test("BG-H03 signal identity is stable across updates", () => {
  const selection = signal([ "MVG-001" ]);
  const identity = selection;
  selection.value = [ "MVG-002" ];
  assert.equal(selection, identity);
});

test("BG-H04 conditional lifecycle starts and stops observation", () => {
  const source = signal(0);
  const seen = [];
  let dispose = null;
  const setVisible = (visible) => {
    dispose?.();
    dispose = visible ? effect(() => seen.push(source.value)) : null;
  };
  setVisible(true);
  source.value = 1;
  setVisible(false);
  source.value = 2;
  assert.deepEqual(seen, [ 0, 1 ]);
});

test("BG-H05 external-store subscription observes committed values", () => {
  const store = signal("metric");
  const observed = [];
  const unsubscribe = effect(() => observed.push(store.value));
  store.value = "imperial";
  unsubscribe();
  assert.deepEqual(observed, [ "metric", "imperial" ]);
});

test("BG-H06 rollback restores the prior value after a failed operation", () => {
  const preference = signal("light");
  const previous = preference.value;
  preference.value = "dark";
  try {
    throw new Error("synthetic save failure");
  }
  catch {
    preference.value = previous;
  }
  assert.equal(preference.value, "light");
});

test("Node, TypeScript, ReactDOM, jsdom, Zod, and signals interoperate", async () => {
  const dom = new JSDOM("<!doctype html><div id=app></div>");
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const previousActEnvironment = Object.getOwnPropertyDescriptor(globalThis, "IS_REACT_ACT_ENVIRONMENT");
  Object.defineProperty(globalThis, "window", { configurable: true, value: dom.window });
  Object.defineProperty(globalThis, "document", { configurable: true, value: dom.window.document });
  Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", { configurable: true, value: true });

  const value = signal(1);
  function View() {
    useSignals();
    return React.createElement("span", { id: "value" }, String(value.value));
  }
  const root = createRoot(dom.window.document.querySelector("#app"));
  await act(async () => root.render(React.createElement(View)));
  assert.equal(dom.window.document.querySelector("#value")?.textContent, "1");
  await act(async () => { value.value = 2; });
  assert.equal(dom.window.document.querySelector("#value")?.textContent, "2");
  assert.deepEqual(z.object({ value: z.number() }).parse({ value: value.value }), { value: 2 });
  await act(async () => root.unmount());
  for (const [ key, descriptor ] of [
    [ "window", previousWindow ],
    [ "document", previousDocument ],
    [ "IS_REACT_ACT_ENVIRONMENT", previousActEnvironment ],
  ]) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else delete globalThis[key];
  }
  dom.window.close();
});
