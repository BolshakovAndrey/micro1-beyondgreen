import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { TrayPlanner as PreservingTrayPlanner, TrayPlannerSummary as PreservingSummary } from "../../../candidates/BG-D03/candidate-a/TrayPlanner.ts";
import { TrayPlanner as FalseGreenTrayPlanner } from "../../../candidates/BG-D03/candidate-b/TrayPlanner.ts";
import { assertDerivedStateOracle } from "./oracle-assertions.ts";

test("BG-D03 oracle accepts the preserving candidate", () => {
  const planner = assertDerivedStateOracle(PreservingTrayPlanner);
  // The rendered observer must agree with the independently checked snapshot.
  assert.match(
    renderToStaticMarkup(createElement(PreservingSummary, { planner: planner as PreservingTrayPlanner })),
    /occupied=9;remaining=-1;overCapacity=true/,
  );
});

test("BG-D03 oracle rejects the seeded false-green candidate", () => {
  assert.throws(() => assertDerivedStateOracle(FalseGreenTrayPlanner));
});
