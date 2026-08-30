import test from "node:test";
import { verifyBGD03GroundTruth } from "../evaluation/verifier-only/BG-D03/canonical-driver.ts";

test("BG-D03 verifier distinguishes the preserving candidate from the seeded false-green candidate", () => {
  verifyBGD03GroundTruth();
});
