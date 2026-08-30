/** Renders the minimal coherent snapshot projection consumed by the BG-H05 harness. */
import React from "react";

import type { ReadoutId, UnitSnapshot } from "./contract.ts";

/** Builds one deterministic readout DOM projection. */
export function renderUnitReadout(consumerId: ReadoutId, snapshot: UnitSnapshot): React.ReactElement {
  return React.createElement("section", { "data-consumer-id": consumerId },
    React.createElement("output", { className: "unit" }, snapshot.unit),
    React.createElement("output", { className: "revision" }, String(snapshot.revision)),
  );
}
