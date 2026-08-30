/** Implements one neutral immutable BG-H03 candidate. */
import { useSignal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";
import { forwardRef, useEffect, useImperativeHandle } from "react";

import { createSelectionHandle, selectionActionLabel, type SelectionAction, type SelectionDeskHandle, type SelectionObservation } from "../../../evaluation/arm-visible/BG-H03/contract.ts";
import { renderSelectionDesk } from "../../../evaluation/arm-visible/BG-H03/render.ts";

/** Exposes the synthetic selection desk using signals as its state store. */
export const SeedLibrarySelectionDesk = forwardRef<SelectionDeskHandle>(function SeedLibrarySelectionDesk(_, ref) {
  useSignals();
  const selectedId = useSignal<"herbs" | "flowers" | "grains">("herbs");
  const selectionHandle = useSignal(createSelectionHandle("herbs"));
  const searchNote = useSignal("");
  const previewAttachmentCount = useSignal(0);
  const actionLog = useSignal<readonly string[]>(["mount"]);

  useEffect(() => { previewAttachmentCount.value += 1; }, [selectionHandle.value]);

  const observe = (): SelectionObservation => Object.freeze({
    selectedId: selectedId.value, selectionHandle: selectionHandle.value,
    searchNote: searchNote.value, previewAttachmentCount: previewAttachmentCount.value,
    actionLog: Object.freeze([...actionLog.value]),
  });
  const dispatch = (action: SelectionAction): void => {
    if (action.type === "set-note") searchNote.value = action.value;
    if (action.type === "select" && action.id !== selectedId.value) {
      selectedId.value = action.id;
      selectionHandle.value = createSelectionHandle(action.id);
    }
    if (action.type === "reset") {
      searchNote.value = "";
      if (selectedId.value !== "herbs") {
        selectedId.value = "herbs";
        selectionHandle.value = createSelectionHandle("herbs");
      }
    }
    actionLog.value = [...actionLog.value, selectionActionLabel(action)];
  };
  useImperativeHandle(ref, () => ({ dispatch, observe }));
  return renderSelectionDesk(observe());
});
