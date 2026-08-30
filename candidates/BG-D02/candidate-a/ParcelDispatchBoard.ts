/** Preserves the frozen BG-D02 queued-update behavior using signals as the state store. */
import { useSignal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";
import React, { useImperativeHandle } from "react";

import {
  LANE_IDS, actionLabel, adjustSelected, evenLaneIds, initialCounts,
  type DispatchAction, type ParcelDispatchHandle,
} from "../../../evaluation/arm-visible/BG-D02/contract.ts";
import { renderParcelDispatchBoard } from "../../../evaluation/arm-visible/BG-D02/render.ts";

/** Implements the behavior-preserving immutable candidate. */
export const ParcelDispatchBoard = React.forwardRef<ParcelDispatchHandle>(function ParcelDispatchBoard(_, ref) {
  useSignals();
  const pending = useSignal<readonly number[]>(initialCounts());
  const dispatched = useSignal<readonly number[]>(initialCounts());
  const selectedIds = useSignal<readonly string[]>([]);
  const unit = useSignal(1);
  const actionLog = useSignal<readonly string[]>(["mount"]);

  const dispatch = (action: DispatchAction) => {
    const label = actionLabel(action, unit.value);
    switch (action.type) {
      case "select-all": selectedIds.value = LANE_IDS; break;
      case "select-even": selectedIds.value = evenLaneIds(); break;
      case "set-unit": unit.value = action.value; break;
      case "queue":
        // Read the signal anew for each queued entry: every request in the event
        // must accumulate onto the state produced by the prior request.
        for (let index = 0; index < action.entries; index += 1) {
          pending.value = adjustSelected(pending.value, selectedIds.value, unit.value);
        }
        break;
      case "flush": {
        const queued = pending.value;
        const selected = new Set(selectedIds.value);
        dispatched.value = dispatched.value.map((value, index) => selected.has(LANE_IDS[index]!) ? value + queued[index]! : value);
        pending.value = queued.map((value, index) => selected.has(LANE_IDS[index]!) ? 0 : value);
        break;
      }
      case "reset": pending.value = initialCounts(); dispatched.value = initialCounts(); selectedIds.value = []; unit.value = 1; break;
    }
    actionLog.value = [...actionLog.value, label];
  };
  useImperativeHandle(ref, () => ({ dispatch }));
  return renderParcelDispatchBoard(pending.value, dispatched.value, selectedIds.value, unit.value, actionLog.value);
});
