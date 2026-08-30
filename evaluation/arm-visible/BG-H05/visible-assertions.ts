/** Owns the frozen incomplete BG-H05 visible gate shared by both candidates. */
import type { UnitReadoutComponent } from "./contract.ts";
import { mountUnitStoreFixture } from "./harness.ts";

/** Describes one candidate-independent legacy assertion. */
export type VisibleAssertion = Readonly<{
  id: "BG-H05-VIS-001" | "BG-H05-VIS-002" | "BG-H05-VIS-003" | "BG-H05-VIS-004";
  title: string;
  run(Component: UnitReadoutComponent): Promise<boolean>;
}>;

async function withSingle(Component: UnitReadoutComponent, run: (fixture: Awaited<ReturnType<typeof mountUnitStoreFixture>>) => Promise<boolean>): Promise<boolean> {
  const fixture = await mountUnitStoreFixture(Component, false);
  try { return await run(fixture); }
  finally { await fixture.dispose(); }
}

/** Preserves the intentionally incomplete single-consumer visible assertions. */
export const VISIBLE_ASSERTIONS: readonly VisibleAssertion[] = Object.freeze([
  { id: "BG-H05-VIS-001", title: "single readout mounts with the metric snapshot", run: (Component) => withSingle(Component, async (fixture) => {
    const value = fixture.observe();
    return value.readouts.north?.unit === "metric" && value.readouts.north.revision === 0;
  }) },
  { id: "BG-H05-VIS-002", title: "toolbar write updates the mounted readout", run: (Component) => withSingle(Component, async (fixture) => {
    const value = await fixture.toolbarWrite("imperial");
    return value.readouts.north?.unit === "imperial" && value.readouts.north.revision === 1;
  }) },
  { id: "BG-H05-VIS-003", title: "repeated toolbar write preserves snapshot identity", run: (Component) => withSingle(Component, async (fixture) => {
    await fixture.toolbarWrite("imperial");
    const before = fixture.snapshotIdentity();
    const value = await fixture.toolbarWrite("imperial");
    return fixture.snapshotIdentity() === before && value.store.revision === 1;
  }) },
  { id: "BG-H05-VIS-004", title: "single readout unmounts cleanly", run: async (Component) => {
    const fixture = await mountUnitStoreFixture(Component, false);
    return (await fixture.dispose()).subscribers === 0;
  } },
]);
