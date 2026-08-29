import React from "react";

import { CARD_IDS } from "./contract.ts";

export function renderMuseumBoard(
  allocations: readonly number[],
  selectedIds: readonly string[],
  step: number,
  actionLog: readonly string[],
) {
  const selected = new Set(selectedIds);
  return React.createElement(
    "main",
    { "data-fixture": "BG-D01" },
    React.createElement("output", { id: "bulk-step" }, String(step)),
    React.createElement("output", { id: "selection" }, JSON.stringify(selectedIds)),
    React.createElement("output", { id: "action-log" }, JSON.stringify(actionLog)),
    React.createElement(
      "section",
      { id: "museum-board" },
      CARD_IDS.map((id, index) => React.createElement(
        "article",
        {
          key: id,
          "data-card-id": id,
          "data-selected": selected.has(id) ? "true" : "false",
        },
        React.createElement("span", { className: "allocation" }, String(allocations[index])),
      )),
    ),
  );
}
