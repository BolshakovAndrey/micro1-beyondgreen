/** Renders the minimal DOM projection consumed by the BG-H02 harness. */
import React from "react";

import type { GuideId, GuideStatus } from "./contract.ts";

/** Builds the deterministic public observation surface for a guide preview. */
export function renderStargazingGuidePreview(selectedGuideId: "none" | GuideId, status: GuideStatus, content: string, actionLog: readonly string[]): React.ReactElement {
  return React.createElement("section", { "data-fixture": "BG-H02" },
    React.createElement("output", { id: "selected-guide" }, selectedGuideId),
    React.createElement("output", { id: "guide-status" }, status),
    React.createElement("output", { id: "guide-content" }, content),
    React.createElement("output", { id: "action-log" }, JSON.stringify(actionLog)),
  );
}
