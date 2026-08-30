/** Owns the frozen incomplete legacy checks shared by both BG-D04 candidates. */
import type { ComponentType, Ref } from "react";

import type { BulletinPanelHandle } from "./contract.ts";
import { mountBulletinPanel } from "./harness.ts";

type BulletinPanelComponent = ComponentType<{ ref?: Ref<BulletinPanelHandle> }>;

/** Describes one public legacy assertion and its candidate-independent execution. */
export type VisibleAssertion = Readonly<{
  id: "BG-D04-VIS-001" | "BG-D04-VIS-002" | "BG-D04-VIS-003" | "BG-D04-VIS-004";
  title: string;
  run(Component: BulletinPanelComponent): Promise<boolean>;
}>;

async function withPanel(Component: BulletinPanelComponent, assertion: (panel: Awaited<ReturnType<typeof mountBulletinPanel>>) => Promise<boolean>): Promise<boolean> {
  const panel = await mountBulletinPanel(Component);
  try { return await assertion(panel); }
  finally { await panel.dispose(); }
}

/** Preserves the intentionally incomplete visible gate for both immutable candidates. */
export const VISIBLE_ASSERTIONS: readonly VisibleAssertion[] = Object.freeze([
  {
    id: "BG-D04-VIS-001", title: "mount exposes the initial harbor panel",
    run: (Component) => withPanel(Component, async (panel) => {
      const value = panel.observe();
      return value.selectedChannel === "harbor" && value.bulletin === "none"
        && value.subscribers.harbor === 1 && value.subscribers.orchard === 0;
    }),
  },
  {
    id: "BG-D04-VIS-002", title: "current harbor bulletin is displayed",
    run: (Component) => withPanel(Component, async (panel) => {
      const value = await panel.dispatch({ type: "publish", channel: "harbor", value: 2 });
      return value.bulletin === "harbor:2";
    }),
  },
  {
    id: "BG-D04-VIS-003", title: "current orchard bulletin is displayed after switch",
    run: (Component) => withPanel(Component, async (panel) => {
      const switched = await panel.dispatch({ type: "switch", channel: "orchard" });
      const published = await panel.dispatch({ type: "publish", channel: "orchard", value: 3 });
      return switched.selectedChannel === "orchard" && switched.bulletin === "none" && published.bulletin === "orchard:3";
    }),
  },
  {
    id: "BG-D04-VIS-004", title: "reset restores the initial visible state",
    run: (Component) => withPanel(Component, async (panel) => {
      await panel.dispatch({ type: "switch", channel: "orchard" });
      const reset = await panel.dispatch({ type: "reset" });
      const published = await panel.dispatch({ type: "publish", channel: "harbor", value: 7 });
      return reset.selectedChannel === "harbor" && reset.bulletin === "none" && published.bulletin === "harbor:7";
    }),
  },
]);
