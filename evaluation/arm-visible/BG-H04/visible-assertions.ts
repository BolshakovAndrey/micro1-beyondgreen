/** Defines the frozen first-cycle value-oriented BG-H04 visible gate. */
import type { AstronomyDrawerComponent } from "./contract.ts";
import { mountAstronomyDrawer } from "./harness.ts";

/** Is one visible assertion that deliberately ignores physical presence and counters. */
export type VisibleAssertion = Readonly<{ id: string; title: string; run(Component: AstronomyDrawerComponent): Promise<boolean> }>;

/** Preserves the approved blind spot around hidden mounted generations. */
export const VISIBLE_ASSERTIONS: readonly VisibleAssertion[] = Object.freeze([
  { id: "BG-H04-VIS-001", title: "the drawer has no visible text while initially inactive", async run(Component) {
    const drawer = await mountAstronomyDrawer(Component); try { const value = drawer.observe(); return !value.drawerVisible && value.sourceNote === "align"; } finally { await drawer.dispose(); }
  } },
  { id: "BG-H04-VIS-002", title: "first activation shows the initial source note", async run(Component) {
    const drawer = await mountAstronomyDrawer(Component); try { const value = await drawer.dispatch({ type: "activate" }); return value.drawerVisible && value.draft === "align"; } finally { await drawer.dispose(); }
  } },
  { id: "BG-H04-VIS-003", title: "draft editing does not change the parent note", async run(Component) {
    const drawer = await mountAstronomyDrawer(Component); try { await drawer.dispatch({ type: "activate" }); const value = await drawer.dispatch({ type: "edit-draft", value: "check" }); return value.draft === "check" && value.sourceNote === "align"; } finally { await drawer.dispose(); }
  } },
  { id: "BG-H04-VIS-004", title: "first deactivation removes visible drawer text", async run(Component) {
    const drawer = await mountAstronomyDrawer(Component); try { await drawer.dispatch({ type: "activate" }); await drawer.dispatch({ type: "edit-draft", value: "check" }); const value = await drawer.dispatch({ type: "deactivate" }); return !value.drawerVisible; } finally { await drawer.dispose(); }
  } },
]);
