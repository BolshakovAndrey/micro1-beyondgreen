/** Renders the minimal value projection for the BG-H03 selection desk. */
import { createElement } from "react";

import type { SelectionObservation } from "./contract.ts";

/** Builds deterministic DOM values without serializing object reference identity. */
export function renderSelectionDesk(observation: SelectionObservation) {
  return createElement("section", { "data-fixture": "BG-H03" },
    createElement("output", { id: "selected-id" }, observation.selectedId),
    createElement("output", { id: "selected-label" }, observation.selectionHandle.label),
    createElement("output", { id: "search-note" }, observation.searchNote),
    createElement("output", { id: "action-log" }, JSON.stringify(observation.actionLog)),
  );
}
