/** Implements one neutral BG-H06 theme-panel candidate. */
import { useSignal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";
import React, { useImperativeHandle, useRef } from "react";

import { initialThemeObservation, type Theme, type ThemePanelHandle } from "../../../evaluation/arm-visible/BG-H06/contract.ts";
import { renderThemePanel } from "../../../evaluation/arm-visible/BG-H06/render.ts";

/** Exposes deterministic optimistic-save behavior through the shared public surface. */
export const ThemePanel = React.forwardRef<ThemePanelHandle>(function ThemePanel(_, ref) {
  useSignals();
  const state = useSignal(initialThemeObservation());
  const pending = useRef<Readonly<{ requested: Theme; committedBefore: Theme }> | null>(null);

  useImperativeHandle(ref, () => ({
    dispatch(action) {
      const current = state.value;
      if (action.type === "choose") {
        if (current.status === "saving" || action.theme === current.committedTheme) return;
        pending.current = Object.freeze({ requested: action.theme, committedBefore: current.committedTheme });
        state.value = Object.freeze({ displayedTheme: action.theme, committedTheme: current.committedTheme, status: "saving", error: null, pendingCount: 1 });
      }
      if (action.type === "resolve" && pending.current) {
        state.value = Object.freeze({ displayedTheme: pending.current.requested, committedTheme: pending.current.requested, status: "idle", error: null, pendingCount: 0 });
        pending.current = null;
      }
      if (action.type === "reject" && pending.current) {
        state.value = Object.freeze({ displayedTheme: pending.current.requested, committedTheme: pending.current.committedBefore, status: "idle", error: "save_failed", pendingCount: 0 });
        pending.current = null;
      }
      if (action.type === "dismiss-error") state.value = Object.freeze({ ...current, error: null });
    },
  }), []);
  return renderThemePanel(state.value);
});
