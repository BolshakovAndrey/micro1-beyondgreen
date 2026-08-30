/** Renders the minimal observable DOM for the BG-H04 conditional drawer. */
import { createElement, type ReactNode } from "react";

/** Builds the stable parent projection around an optional drawer node. */
export function renderAstronomyParent(sourceNote: string, active: boolean, actionLog: readonly string[], drawer: ReactNode) {
  return createElement("section", { "data-fixture": "BG-H04" },
    createElement("output", { id: "station-id" }, "north-pad"),
    createElement("output", { id: "source-note" }, sourceNote),
    createElement("output", { id: "active" }, String(active)),
    createElement("output", { id: "action-log" }, JSON.stringify(actionLog)),
    drawer,
  );
}

/** Builds one drawer generation; hidden remains distinguishable from physical absence. */
export function renderDrawer(generation: number, draft: string, hidden: boolean) {
  return createElement("aside", { "data-drawer": "station-notes", "data-generation": String(generation), hidden },
    createElement("output", { id: "drawer-draft" }, draft),
  );
}
