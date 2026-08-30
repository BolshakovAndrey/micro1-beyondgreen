/** Owns the frozen shared BG-H02 visible legacy assertions. */
import type { StargazingGuideComponent } from "./contract.ts";
import { mountStargazingGuidePreview } from "./harness.ts";

function equal(left: unknown, right: unknown): boolean { return JSON.stringify(left) === JSON.stringify(right); }
/** Describes one visible assertion run identically against both candidates. */
export type VisibleAssertion = Readonly<{ id: "BG-H02-VIS-001" | "BG-H02-VIS-002" | "BG-H02-VIS-003" | "BG-H02-VIS-004" | "BG-H02-VIS-005"; title: string; run(Component: StargazingGuideComponent): Promise<boolean> }>;
async function withPreview(Component: StargazingGuideComponent, check: (preview: Awaited<ReturnType<typeof mountStargazingGuidePreview>>) => Promise<boolean>): Promise<boolean> { const preview = await mountStargazingGuidePreview(Component); try { return await check(preview); } finally { await preview.dispose(); } }

/** Is the sole executable source of the five visible legacy assertions. */
export const VISIBLE_ASSERTIONS: readonly VisibleAssertion[] = Object.freeze([
  { id: "BG-H02-VIS-001", title: "mount exposes an idle empty preview", run: (Component) => withPreview(Component, async (preview) => { const value = preview.observe(); return value.selectedGuideId === "none" && value.status === "idle" && value.content === "none" && equal(value.actionLog, ["mount"]); }) },
  { id: "BG-H02-VIS-002", title: "one selection creates one loading request", run: (Component) => withPreview(Component, async (preview) => { const { handle, observation } = await preview.select("GUIDE-MOON", "select-moon"); return handle.requestId === "R1" && observation.selectedGuideId === "GUIDE-MOON" && observation.status === "loading" && observation.content === "none" && equal(observation.createdRequestIds, ["R1"]); }) },
  { id: "BG-H02-VIS-003", title: "current request completion publishes matching content", run: (Component) => withPreview(Component, async (preview) => { const { handle } = await preview.select("GUIDE-MOON", "select-moon"); const value = await preview.complete(handle); return value.status === "ready" && value.content === "Moon craters"; }) },
  { id: "BG-H02-VIS-004", title: "sequential selections publish their own results", run: (Component) => withPreview(Component, async (preview) => { const first = await preview.select("GUIDE-MOON", "select-moon"); await preview.complete(first.handle); const second = await preview.select("GUIDE-METEOR", "select-meteor"); const value = await preview.complete(second.handle); return value.selectedGuideId === "GUIDE-METEOR" && value.status === "ready" && value.content === "Meteor paths" && equal(value.createdRequestIds, ["R1", "R2"]); }) },
  { id: "BG-H02-VIS-005", title: "reset after settled work restores initial state", run: (Component) => withPreview(Component, async (preview) => { const request = await preview.select("GUIDE-COMET", "select-comet"); await preview.complete(request.handle); const value = await preview.reset(); return value.selectedGuideId === "none" && value.status === "idle" && value.content === "none" && equal(value.actionLog, ["mount", "select-comet", "reset"]); }) },
]);
