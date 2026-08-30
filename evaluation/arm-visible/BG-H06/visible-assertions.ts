/** Owns the frozen incomplete BG-H06 success-only visible gate. */
import type { ThemePanelComponent } from "./contract.ts";
import { mountThemePanel } from "./harness.ts";

/** Describes one candidate-independent visible assertion. */
export type VisibleAssertion = Readonly<{
  id: "BG-H06-VIS-001" | "BG-H06-VIS-002" | "BG-H06-VIS-003" | "BG-H06-VIS-004";
  title: string;
  run(Component: ThemePanelComponent): Promise<boolean>;
}>;

async function withPanel(Component: ThemePanelComponent, run: (panel: Awaited<ReturnType<typeof mountThemePanel>>) => Promise<boolean>): Promise<boolean> {
  const panel = await mountThemePanel(Component);
  try { return await run(panel); }
  finally { await panel.dispose(); }
}

/** Preserves the intentionally incomplete successful-save legacy assertions. */
export const VISIBLE_ASSERTIONS: readonly VisibleAssertion[] = Object.freeze([
  { id: "BG-H06-VIS-001", title: "mount exposes committed light theme", run: (Component) => withPanel(Component, async (panel) => {
    return JSON.stringify(panel.observe()) === JSON.stringify({ displayedTheme: "light", committedTheme: "light", status: "idle", error: null, pendingCount: 0 });
  }) },
  { id: "BG-H06-VIS-002", title: "dark choice is displayed optimistically", run: (Component) => withPanel(Component, async (panel) => {
    const value = await panel.dispatch({ type: "choose", theme: "dark" });
    return value.displayedTheme === "dark" && value.committedTheme === "light" && value.status === "saving" && value.pendingCount === 1;
  }) },
  { id: "BG-H06-VIS-003", title: "successful dark save commits and settles", run: (Component) => withPanel(Component, async (panel) => {
    await panel.dispatch({ type: "choose", theme: "dark" });
    const value = await panel.dispatch({ type: "resolve" });
    return value.displayedTheme === "dark" && value.committedTheme === "dark" && value.status === "idle" && value.error === null && value.pendingCount === 0;
  }) },
  { id: "BG-H06-VIS-004", title: "dismissing absent error is stable and unmount is clean", run: (Component) => withPanel(Component, async (panel) => {
    const before = panel.observe();
    const after = await panel.dispatch({ type: "dismiss-error" });
    return JSON.stringify(after) === JSON.stringify(before);
  }) },
]);
