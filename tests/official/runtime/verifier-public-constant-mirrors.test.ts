import assert from "node:assert/strict";
import test from "node:test";

import {
  CARD_IDS,
  everyThirdCardIds,
} from "../../../evaluation/arm-visible/BG-D01/contract.ts";
import {
  LANE_IDS,
  evenLaneIds,
} from "../../../evaluation/arm-visible/BG-D02/contract.ts";
import {
  D01_CARD_IDS,
  d01EveryThirdCardIds,
} from "../../../evaluation/verifier-only/BG-D01/public-contract-mirror.ts";
import {
  D02_LANE_IDS,
  d02EvenLaneIds,
} from "../../../evaluation/verifier-only/BG-D02/public-contract-mirror.ts";

test("verifier-only public identifier mirrors equal the frozen arm-visible contracts", () => {
  // This test intentionally runs outside role isolation so equality is proved
  // without granting the production evaluator access to arm-visible modules.
  assert.deepEqual(D01_CARD_IDS, CARD_IDS);
  assert.deepEqual(d01EveryThirdCardIds(), everyThirdCardIds());
  assert.deepEqual(D02_LANE_IDS, LANE_IDS);
  assert.deepEqual(d02EvenLaneIds(), evenLaneIds());
});
