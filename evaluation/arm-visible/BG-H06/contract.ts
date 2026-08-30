/** Defines the complete arm-visible optimistic theme-save contract for BG-H06. */
import type { ComponentType, Ref } from "react";

/** Enumerates the synthetic theme preferences. */
export type Theme = "light" | "dark";

/** Enumerates public harness actions without exposing a canonical sequence. */
export type ThemeAction =
  | { type: "choose"; theme: Theme }
  | { type: "resolve" }
  | { type: "reject" }
  | { type: "dismiss-error" };

/** Captures every arm-visible panel field after settlement. */
export type ThemeObservation = Readonly<{
  displayedTheme: Theme;
  committedTheme: Theme;
  status: "idle" | "saving";
  error: "save_failed" | null;
  pendingCount: 0 | 1;
}>;

/** Defines the imperative surface exposed by both candidates. */
export type ThemePanelHandle = Readonly<{ dispatch(action: ThemeAction): void }>;

/** Describes a candidate component mountable by the shared harness. */
export type ThemePanelComponent = ComponentType<{ ref?: Ref<ThemePanelHandle> }>;

/** Returns the immutable initial observation used by every isolated mount. */
export function initialThemeObservation(): ThemeObservation {
  return Object.freeze({ displayedTheme: "light", committedTheme: "light", status: "idle", error: null, pendingCount: 0 });
}
