/** Renders the minimal observable DOM contract consumed by the fixture harness. */
import React from "react";

import { LANE_IDS } from "./contract.ts";

/** Builds the deterministic DOM projection for a parcel dispatch board state. */
export function renderParcelDispatchBoard(
  pending: readonly number[],
  dispatched: readonly number[],
  selectedIds: readonly string[],
  unit: number,
  actionLog: readonly string[],
): React.ReactElement {
  return React.createElement("section", { "data-fixture": "BG-D02" },
    React.createElement("output", { id: "selection" }, JSON.stringify(selectedIds)),
    React.createElement("output", { id: "dispatch-unit" }, String(unit)),
    React.createElement("output", { id: "action-log" }, JSON.stringify(actionLog)),
    React.createElement("div", { id: "lanes" }, LANE_IDS.map((laneId, index) => React.createElement(
      "article",
      { key: laneId, "data-lane-id": laneId },
      React.createElement("span", { className: "pending" }, String(pending[index]!)),
      React.createElement("span", { className: "dispatched" }, String(dispatched[index]!)),
    ))),
  );
}
