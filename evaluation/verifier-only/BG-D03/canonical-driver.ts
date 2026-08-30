import { TrayPlanner as FalseGreenTrayPlanner } from "../../../candidates/BG-D03/candidate-b/TrayPlanner.ts";
import { TrayPlanner as PreservingTrayPlanner } from "../../../candidates/BG-D03/candidate-a/TrayPlanner.ts";
import { assertDerivedStateOracle } from "./oracle-assertions.ts";

/** Confirms the frozen preserving and seeded false-green ground truth. */
export const verifyBGD03GroundTruth = (): void => {
  assertDerivedStateOracle(PreservingTrayPlanner);

  // The seeded candidate must remain false-green under the frozen hidden sequence.
  try {
    assertDerivedStateOracle(FalseGreenTrayPlanner);
  } catch {
    return;
  }
  throw new Error("BG-D03 false-green candidate unexpectedly satisfied the derived-state oracle.");
};
