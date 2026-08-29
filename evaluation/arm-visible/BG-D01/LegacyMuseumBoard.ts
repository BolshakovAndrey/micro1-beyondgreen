import React, { useImperativeHandle, useState } from "react";

import {
  CARD_IDS,
  actionLabel,
  adjustSelected,
  everyThirdCardIds,
  initialAllocations,
  type BoardAction,
  type MuseumBoardHandle,
} from "./contract.ts";
import { renderMuseumBoard } from "./render.ts";

/** Arm-visible React reference from which both signals migrations are derived. */
export const LegacyMuseumBoard = React.forwardRef<MuseumBoardHandle>(function LegacyMuseumBoard(_, ref) {
  const [allocations, setAllocations] = useState(initialAllocations);
  const [selectedIds, setSelectedIds] = useState<readonly string[]>([]);
  const [step, setStep] = useState(1);
  const [actionLog, setActionLog] = useState<readonly string[]>(["mount"]);

  const dispatch = (action: BoardAction) => {
    const label = actionLabel(action, step);
    switch (action.type) {
      case "select-all":
        setSelectedIds(CARD_IDS);
        break;
      case "select-every-third":
        setSelectedIds(everyThirdCardIds());
        break;
      case "set-step":
        setStep(action.value);
        break;
      case "allocate":
        for (let index = 0; index < action.multiplicity; index += 1) {
          setAllocations((latest) => adjustSelected(latest, selectedIds, step));
        }
        break;
      case "remove":
        setAllocations((latest) => adjustSelected(latest, selectedIds, -step));
        break;
      case "reset":
        setAllocations(initialAllocations());
        setSelectedIds([]);
        setStep(1);
        break;
    }
    setActionLog((latest) => [...latest, label]);
  };

  useImperativeHandle(ref, () => ({ dispatch }));
  return renderMuseumBoard(allocations, selectedIds, step, actionLog);
});
