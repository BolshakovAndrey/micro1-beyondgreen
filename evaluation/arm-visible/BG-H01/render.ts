/** Renders the minimal DOM projection consumed by the BG-H01 harness. */
import React from "react";

import type { CardTheme } from "./contract.ts";

/** Builds the deterministic public observation surface for a display-card draft. */
export function renderDisplayCardEditor(cardId: string, title: string, theme: CardTheme, dirty: boolean, actionLog: readonly string[]): React.ReactElement {
  return React.createElement("section", { "data-fixture": "BG-H01" },
    React.createElement("output", { id: "card-id" }, cardId),
    React.createElement("output", { id: "draft-title" }, title),
    React.createElement("output", { id: "draft-theme" }, theme),
    React.createElement("output", { id: "dirty" }, String(dirty)),
    React.createElement("output", { id: "action-log" }, JSON.stringify(actionLog)),
  );
}
