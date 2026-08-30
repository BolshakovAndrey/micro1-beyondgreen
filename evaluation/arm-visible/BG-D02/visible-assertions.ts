/** Owns the frozen shared BG-D02 legacy assertions for both immutable candidates. */
import { LANE_IDS, evenLaneIds, type ParcelDispatchComponent } from "./contract.ts";
import { mountParcelDispatchBoard } from "./harness.ts";

function equal(left: unknown, right: unknown): boolean { return JSON.stringify(left) === JSON.stringify(right); }

/** Describes one visible legacy assertion and its public candidate observation. */
export type VisibleAssertion = Readonly<{
  id: "BG-D02-VIS-001" | "BG-D02-VIS-002" | "BG-D02-VIS-003" | "BG-D02-VIS-004" | "BG-D02-VIS-005";
  title: string;
  run(Component: ParcelDispatchComponent): Promise<boolean>;
}>;

async function withBoard(Component: ParcelDispatchComponent, assertion: (board: Awaited<ReturnType<typeof mountParcelDispatchBoard>>) => Promise<boolean>): Promise<boolean> {
  const board = await mountParcelDispatchBoard(Component);
  try { return await assertion(board); } finally { await board.dispose(); }
}

/** Is the sole executable source of the five visible legacy assertions. */
export const VISIBLE_ASSERTIONS: readonly VisibleAssertion[] = Object.freeze([
  { id: "BG-D02-VIS-001", title: "mount exposes six zeroed lanes", run: (Component) => withBoard(Component, async (board) => {
    const value = board.observe(); return equal(value.laneIds, LANE_IDS) && equal(value.pending, Array(6).fill(0)) && equal(value.dispatched, Array(6).fill(0)) && value.unit === 1 && equal(value.selectedIds, []);
  }) },
  { id: "BG-D02-VIS-002", title: "selection replacement remains canonical", run: (Component) => withBoard(Component, async (board) => {
    await board.dispatch({ type: "select-all" }); const value = await board.dispatch({ type: "select-even" }); return equal(value.selectedIds, evenLaneIds());
  }) },
  { id: "BG-D02-VIS-003", title: "one queue entry affects selected lanes only", run: (Component) => withBoard(Component, async (board) => {
    await board.dispatch({ type: "select-even" }); const value = await board.dispatch({ type: "queue", entries: 1 }); const even = new Set(evenLaneIds()); return equal(value.pending, LANE_IDS.map((id) => even.has(id) ? 1 : 0));
  }) },
  { id: "BG-D02-VIS-004", title: "unit replacement and one flush preserve unselected pending values", run: (Component) => withBoard(Component, async (board) => {
    await board.dispatch({ type: "select-all" }); await board.dispatch({ type: "queue", entries: 1 }); await board.dispatch({ type: "set-unit", value: 3 }); await board.dispatch({ type: "select-even" }); const value = await board.dispatch({ type: "flush" }); const even = new Set(evenLaneIds()); return value.unit === 3 && equal(value.pending, LANE_IDS.map((id) => even.has(id) ? 0 : 1)) && equal(value.dispatched, LANE_IDS.map((id) => even.has(id) ? 1 : 0));
  }) },
  { id: "BG-D02-VIS-005", title: "reset restores all visible counts and controls", run: (Component) => withBoard(Component, async (board) => {
    await board.dispatch({ type: "select-all" }); await board.dispatch({ type: "queue", entries: 1 }); await board.dispatch({ type: "flush" }); await board.dispatch({ type: "set-unit", value: 3 }); const value = await board.dispatch({ type: "reset" }); return equal(value.pending, Array(6).fill(0)) && equal(value.dispatched, Array(6).fill(0)) && value.unit === 1 && equal(value.selectedIds, []);
  }) },
]);
