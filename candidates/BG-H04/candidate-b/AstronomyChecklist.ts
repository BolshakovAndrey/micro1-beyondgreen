/** Implements the second neutral immutable BG-H04 candidate. */
import { useSignal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

import { drawerActionLabel, type AstronomyDrawerHandle, type DrawerAction, type LifecycleLedger } from "../../../evaluation/arm-visible/BG-H04/contract.ts";
import { renderAstronomyParent, renderDrawer } from "../../../evaluation/arm-visible/BG-H04/render.ts";

/** Exposes the synthetic drawer through a persistent value projection. */
export const AstronomyChecklist = forwardRef<AstronomyDrawerHandle, { ledger: LifecycleLedger }>(function AstronomyChecklist({ ledger }, ref) {
  useSignals();
  const sourceNote = useSignal("align");
  const active = useSignal(false);
  const actionLog = useSignal<readonly string[]>(["mount-parent"]);
  const [draft, setDraft] = useState(sourceNote.value);
  const [generation, setGeneration] = useState(0);
  useEffect(() => {
    // Register once with the persistent projection so its local state and lifecycle
    // share the same component lifetime.
    const registration = ledger.mount();
    setGeneration(registration.generation);
    return registration.cleanup;
  }, [ledger]);
  const dispatch = (action: DrawerAction): void => {
    if (action.type === "activate") active.value = true;
    if (action.type === "deactivate") active.value = false;
    if (action.type === "edit-draft") setDraft(action.value);
    if (action.type === "set-source-note") sourceNote.value = action.value;
    actionLog.value = [...actionLog.value, drawerActionLabel(action)];
  };
  useImperativeHandle(ref, () => ({ dispatch }));
  return renderAstronomyParent(sourceNote.value, active.value, actionLog.value, renderDrawer(generation, draft, !active.value));
});
