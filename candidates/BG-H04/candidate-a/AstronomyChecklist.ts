/** Implements one neutral immutable BG-H04 candidate. */
import { useSignal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";
import { createElement, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

import { drawerActionLabel, type AstronomyDrawerHandle, type DrawerAction, type LifecycleLedger } from "../../../evaluation/arm-visible/BG-H04/contract.ts";
import { renderAstronomyParent, renderDrawer } from "../../../evaluation/arm-visible/BG-H04/render.ts";

function Drawer({ sourceNote, ledger, onDraftReady }: Readonly<{ sourceNote: string; ledger: LifecycleLedger; onDraftReady(value: (next: string) => void): void }>) {
  const [draft, setDraft] = useState(sourceNote);
  const [generation, setGeneration] = useState(0);
  useEffect(() => {
    const registration = ledger.mount();
    setGeneration(registration.generation);
    onDraftReady(setDraft);
    return registration.cleanup;
  }, [ledger, onDraftReady]);
  return renderDrawer(generation, draft, false);
}

/** Exposes the synthetic conditional drawer and its parent-controlled visibility. */
export const AstronomyChecklist = forwardRef<AstronomyDrawerHandle, { ledger: LifecycleLedger }>(function AstronomyChecklist({ ledger }, ref) {
  useSignals();
  const sourceNote = useSignal("align");
  const active = useSignal(false);
  const actionLog = useSignal<readonly string[]>(["mount-parent"]);
  const setDraftRef = useRef<((value: string) => void) | null>(null);
  const bindDraft = useCallback((setter: (value: string) => void) => { setDraftRef.current = setter; }, []);
  const dispatch = (action: DrawerAction): void => {
    if (action.type === "activate") active.value = true;
    if (action.type === "deactivate") active.value = false;
    if (action.type === "edit-draft") setDraftRef.current?.(action.value);
    if (action.type === "set-source-note") sourceNote.value = action.value;
    actionLog.value = [...actionLog.value, drawerActionLabel(action)];
  };
  useImperativeHandle(ref, () => ({ dispatch }));
  return renderAstronomyParent(sourceNote.value, active.value, actionLog.value,
    active.value ? createElement(Drawer, { sourceNote: sourceNote.value, ledger, onDraftReady: bindDraft }) : null);
});
