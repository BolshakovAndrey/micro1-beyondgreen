import { useSignal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";
import React, { useImperativeHandle } from "react";

import {
  CARD_IDS,
  actionLabel,
  adjustSelected,
  everyThirdCardIds,
  initialAllocations,
  type BoardAction,
  type MuseumBoardHandle,
} from "../../../evaluation/arm-visible/BG-D01/contract.ts";
import { renderMuseumBoard } from "../../../evaluation/arm-visible/BG-D01/render.ts";

export const MuseumBoard = React.forwardRef<MuseumBoardHandle>(function MuseumBoard(_, ref) {
  useSignals();
  const allocations = useSignal<readonly number[]>(initialAllocations());
  const selectedIds = useSignal<readonly string[]>([]);
  const step = useSignal(1);
  const actionLog = useSignal<readonly string[]>(["mount"]);

  const dispatch = (action: BoardAction) => {
    const label = actionLabel(action, step.value);
    switch (action.type) {
      case "select-all":
        selectedIds.value = CARD_IDS;
        break;
      case "select-every-third":
        selectedIds.value = everyThirdCardIds();
        break;
      case "set-step":
        step.value = action.value;
        break;
      case "allocate":
        for (let index = 0; index < action.multiplicity; index += 1) {
          allocations.value = adjustSelected(allocations.value, selectedIds.value, step.value);
        }
        break;
      case "remove":
        allocations.value = adjustSelected(allocations.value, selectedIds.value, -step.value);
        break;
      case "reset":
        allocations.value = initialAllocations();
        selectedIds.value = [];
        step.value = 1;
        break;
    }
    actionLog.value = [...actionLog.value, label];
  };

  useImperativeHandle(ref, () => ({ dispatch }));
  return renderMuseumBoard(allocations.value, selectedIds.value, step.value, actionLog.value);
});
