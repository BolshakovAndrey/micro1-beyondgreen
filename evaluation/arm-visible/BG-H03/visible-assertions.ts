/** Defines the frozen value-oriented visible gate for both BG-H03 candidates. */
import type { SelectionDeskComponent } from "./contract.ts";
import { mountSelectionDesk } from "./harness.ts";

/** Is one deterministic visible assertion that intentionally ignores references. */
export type VisibleAssertion = Readonly<{ id: string; title: string; run(Component: SelectionDeskComponent): Promise<boolean> }>;

/** Preserves the approved blind spot: no reference or attachment-count comparison. */
export const VISIBLE_ASSERTIONS: readonly VisibleAssertion[] = Object.freeze([
  { id: "BG-H03-VIS-001", title: "mount exposes the initial collection values", async run(Component) {
    const desk = await mountSelectionDesk(Component); try { const value = desk.observe(); return value.selectedId === "herbs" && value.selectionHandle.label === "Herb collection" && value.searchNote === ""; } finally { await desk.dispose(); }
  } },
  { id: "BG-H03-VIS-002", title: "search note edits preserve serialized selection values", async run(Component) {
    const desk = await mountSelectionDesk(Component); try { const value = await desk.dispatch({ type: "set-note", value: "spring" }); return value.selectedId === "herbs" && value.selectionHandle.id === "herbs" && value.searchNote === "spring"; } finally { await desk.dispose(); }
  } },
  { id: "BG-H03-VIS-003", title: "selection changes expose the expected label", async run(Component) {
    const desk = await mountSelectionDesk(Component); try { const value = await desk.dispatch({ type: "select", id: "flowers" }); return value.selectedId === "flowers" && value.selectionHandle.label === "Flower collection"; } finally { await desk.dispose(); }
  } },
  { id: "BG-H03-VIS-004", title: "reset restores public values and ordered labels", async run(Component) {
    const desk = await mountSelectionDesk(Component); try { await desk.dispatch({ type: "set-note", value: "summer" }); await desk.dispatch({ type: "select", id: "flowers" }); const value = await desk.dispatch({ type: "reset" }); return value.selectedId === "herbs" && value.searchNote === "" && JSON.stringify(value.actionLog) === JSON.stringify(["mount", "note-summer", "select-flowers", "reset"]); } finally { await desk.dispose(); }
  } },
]);
