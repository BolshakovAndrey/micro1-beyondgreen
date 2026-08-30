/**
 * Owns the five frozen legacy assertions used identically by both D01 candidates
 * and both comparison arms, preserving a single auditable visible-test contract.
 */
import { canonicalJson } from "../../../src/d01/canonical-json.ts";
import { CARD_IDS, everyThirdCardIds, type MuseumBoardComponent } from "./contract.ts";
import { mountMuseumBoard } from "./harness.ts";

function equal(left: unknown, right: unknown): boolean {
  return canonicalJson(left) === canonicalJson(right);
}

/** Describes one frozen legacy assertion and the candidate observation it validates. */
export type VisibleAssertion = Readonly<{
  id: "BG-D01-VIS-001" | "BG-D01-VIS-002" | "BG-D01-VIS-003" | "BG-D01-VIS-004" | "BG-D01-VIS-005";
  title: string;
  run(Component: MuseumBoardComponent): Promise<boolean>;
}>;

async function withBoard(
  Component: MuseumBoardComponent,
  assertion: (board: Awaited<ReturnType<typeof mountMuseumBoard>>) => Promise<boolean>,
): Promise<boolean> {
  const board = await mountMuseumBoard(Component);
  try { return await assertion(board); }
  finally { await board.dispose(); }
}

/** The sole executable source of the five frozen visible assertions. */
export const VISIBLE_ASSERTIONS: readonly VisibleAssertion[] = Object.freeze([
  {
    id: "BG-D01-VIS-001", title: "mount exposes the frozen initial board",
    run: (Component) => withBoard(Component, async (board) => {
      const value = board.observe();
      return equal(value.cardIds, CARD_IDS) && equal(value.allocations, Array(300).fill(0))
        && value.step === 1 && equal(value.selectedIds, []);
    }),
  },
  {
    id: "BG-D01-VIS-002", title: "select-all replaces selection in ascending order",
    run: (Component) => withBoard(Component, async (board) => {
      const value = await board.dispatch({ type: "select-all" });
      return equal(value.selectedIds, CARD_IDS) && new Set(value.selectedIds).size === 300;
    }),
  },
  {
    id: "BG-D01-VIS-003", title: "allocate once changes selected cards only",
    run: (Component) => withBoard(Component, async (board) => {
      await board.dispatch({ type: "select-every-third" });
      const value = await board.dispatch({ type: "allocate", multiplicity: 1 });
      const selected = new Set(everyThirdCardIds());
      return equal(value.allocations, CARD_IDS.map((id) => selected.has(id) ? 1 : 0));
    }),
  },
  {
    id: "BG-D01-VIS-004", title: "step change is inert and remove once clamps selected cards",
    run: (Component) => withBoard(Component, async (board) => {
      await board.dispatch({ type: "select-all" });
      const before = await board.dispatch({ type: "allocate", multiplicity: 1 });
      const afterStep = await board.dispatch({ type: "set-step", value: 3 });
      const afterRemove = await board.dispatch({ type: "remove", multiplicity: 1 });
      return equal(before.allocations, afterStep.allocations)
        && equal(afterRemove.allocations, Array(300).fill(0))
        && afterRemove.allocations.every((value) => value >= 0);
    }),
  },
  {
    id: "BG-D01-VIS-005", title: "reset restores visible state",
    run: (Component) => withBoard(Component, async (board) => {
      await board.dispatch({ type: "select-all" });
      await board.dispatch({ type: "allocate", multiplicity: 1 });
      await board.dispatch({ type: "set-step", value: 3 });
      const value = await board.dispatch({ type: "reset" });
      return equal(value.allocations, Array(300).fill(0)) && value.step === 1 && equal(value.selectedIds, []);
    }),
  },
]);
