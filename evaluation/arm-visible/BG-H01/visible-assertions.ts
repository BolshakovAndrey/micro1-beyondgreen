/** Owns the frozen shared BG-H01 visible legacy assertions. */
import { assertCardProps, type DisplayCardEditorComponent } from "./contract.ts";
import { mountDisplayCardEditor } from "./harness.ts";

const CARD_01 = Object.freeze({ cardId: "CARD-01", initialTitle: "Moon map", initialTheme: "blue" as const });
function equal(left: unknown, right: unknown): boolean { return JSON.stringify(left) === JSON.stringify(right); }

/** Describes one visible assertion run identically against both candidates. */
export type VisibleAssertion = Readonly<{
  id: "BG-H01-VIS-001" | "BG-H01-VIS-002" | "BG-H01-VIS-003" | "BG-H01-VIS-004" | "BG-H01-VIS-005";
  title: string;
  run(Component: DisplayCardEditorComponent): Promise<boolean>;
}>;

async function withEditor(Component: DisplayCardEditorComponent, check: (editor: Awaited<ReturnType<typeof mountDisplayCardEditor>>) => Promise<boolean>): Promise<boolean> {
  const editor = await mountDisplayCardEditor(Component, CARD_01);
  try { return await check(editor); } finally { await editor.dispose(); }
}

/** Is the sole executable source of the five visible legacy assertions. */
export const VISIBLE_ASSERTIONS: readonly VisibleAssertion[] = Object.freeze([
  { id: "BG-H01-VIS-001", title: "mount exposes the supplied clean draft", run: (Component) => withEditor(Component, async (editor) => { const value = editor.observe(); return value.cardId === "CARD-01" && value.title === "Moon map" && value.theme === "blue" && !value.dirty && equal(value.actionLog, ["mount-card-01"]); }) },
  { id: "BG-H01-VIS-002", title: "title editing preserves theme and marks dirty", run: (Component) => withEditor(Component, async (editor) => { const value = await editor.dispatch({ type: "edit-title", value: "Lunar map" }); return value.title === "Lunar map" && value.theme === "blue" && value.dirty; }) },
  { id: "BG-H01-VIS-003", title: "theme editing preserves title and marks dirty", run: (Component) => withEditor(Component, async (editor) => { const value = await editor.dispatch({ type: "edit-theme", value: "green" }); return value.title === "Moon map" && value.theme === "green" && value.dirty; }) },
  { id: "BG-H01-VIS-004", title: "same-card rerender preserves the local draft", run: (Component) => withEditor(Component, async (editor) => { await editor.dispatch({ type: "edit-title", value: "Lunar map" }); const value = await editor.rerender(CARD_01, "rerender-card-01"); return value.title === "Lunar map" && value.theme === "blue" && value.dirty && equal(value.actionLog, ["mount-card-01", "edit-title-card-01", "rerender-card-01"]); }) },
  { id: "BG-H01-VIS-005", title: "reset and input validation remain deterministic", run: (Component) => withEditor(Component, async (editor) => { await editor.dispatch({ type: "edit-title", value: "Lunar map" }); const value = await editor.dispatch({ type: "reset-current" }); try { assertCardProps({ ...CARD_01, cardId: "" }); return false; } catch { return value.title === "Moon map" && value.theme === "blue" && !value.dirty; } }) },
]);
