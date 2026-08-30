/** Implements one immutable BG-H01 display-card editor candidate. */
import { useSignal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";
import React, { useImperativeHandle, useLayoutEffect, useRef } from "react";

import { assertCardProps, isDirty, type CardProps, type DisplayCardEditorHandle, type DisplayCardEditorProps } from "../../../evaluation/arm-visible/BG-H01/contract.ts";
import { renderDisplayCardEditor } from "../../../evaluation/arm-visible/BG-H01/render.ts";

/** Exposes the shared display-card contract through signals-backed local state. */
export const DisplayCardEditor = React.forwardRef<DisplayCardEditorHandle, Omit<DisplayCardEditorProps, "ref">>(function DisplayCardEditor(props, ref) {
  useSignals();
  assertCardProps(props);
  const title = useSignal(props.initialTitle);
  const theme = useSignal(props.initialTheme);
  const current = useRef<CardProps>({ cardId: props.cardId, initialTitle: props.initialTitle, initialTheme: props.initialTheme });
  const appliedRevision = useRef(props.revision);
  const actionLog = useSignal<readonly string[]>([props.transitionLabel]);

  useLayoutEffect(() => {
    if (appliedRevision.current === props.revision) return;
    const next = { cardId: props.cardId, initialTitle: props.initialTitle, initialTheme: props.initialTheme };
    if (current.current.cardId === next.cardId && (current.current.initialTitle !== next.initialTitle || current.current.initialTheme !== next.initialTheme)) {
      throw new RangeError("Initial fields must remain stable for a card identity.");
    }
    // Identity inputs advance independently from draft signals, which remain local
    // until the explicit current-card reset action.
    current.current = next;
    appliedRevision.current = props.revision;
    actionLog.value = [...actionLog.value, props.transitionLabel];
  }, [props.cardId, props.initialTheme, props.initialTitle, props.revision, props.transitionLabel, actionLog]);

  useImperativeHandle(ref, () => ({ dispatch(action) {
    switch (action.type) {
      case "edit-title": title.value = action.value; actionLog.value = [...actionLog.value, `edit-title-${current.current.cardId.toLowerCase()}`]; break;
      case "edit-theme": theme.value = action.value; actionLog.value = [...actionLog.value, `edit-theme-${current.current.cardId.toLowerCase()}`]; break;
      case "reset-current": title.value = current.current.initialTitle; theme.value = current.current.initialTheme; actionLog.value = [...actionLog.value, "reset-current"]; break;
    }
  } }));

  return renderDisplayCardEditor(current.current.cardId, title.value, theme.value, isDirty(title.value, theme.value, current.current), actionLog.value);
});
