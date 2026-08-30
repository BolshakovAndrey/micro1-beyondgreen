/** Renders the minimal deterministic theme-panel projection consumed by the harness. */
import React from "react";

import type { ThemeObservation } from "./contract.ts";

/** Builds the stable DOM projection for one panel observation. */
export function renderThemePanel(observation: ThemeObservation): React.ReactElement {
  return React.createElement("section", { "data-fixture": "BG-H06" },
    React.createElement("output", { id: "displayed-theme" }, observation.displayedTheme),
    React.createElement("output", { id: "committed-theme" }, observation.committedTheme),
    React.createElement("output", { id: "save-status" }, observation.status),
    React.createElement("output", { id: "save-error" }, observation.error ?? "none"),
    React.createElement("output", { id: "pending-count" }, String(observation.pendingCount)),
  );
}
