import assert from "node:assert/strict";
import test from "node:test";

import {
  ACTION_LOG,
  CARD_COUNT,
  MEASURED_SAMPLES_PER_ARM,
  WARMUPS_PER_ARM,
  expectedSnapshots,
  measuredOrder,
  summarize,
} from "./chromium-runner.ts";
import { readFileSync } from "node:fs";

test("protocol remains frozen at 300 cards, 5 warmups, and 30 samples per arm", () => {
  assert.equal(CARD_COUNT, 300);
  assert.equal(WARMUPS_PER_ARM, 5);
  assert.equal(MEASURED_SAMPLES_PER_ARM, 30);
  assert.deepEqual(ACTION_LOG, [ "mount", "select-all", "allocate-1x2", "step-3", "allocate-3x2", "select-every-third", "remove-3x1", "reset" ]);
  const order = measuredOrder();
  assert.equal(order.length, 60);
  assert.deepEqual(order.slice(0, 4), [ "baseline", "advanced", "baseline", "advanced" ]);
  assert.deepEqual(order.slice(30, 34), [ "advanced", "baseline", "advanced", "baseline" ]);
});

test("expected oracle covers all 300 ordered values and stale-snapshot actions", () => {
  const snapshots = expectedSnapshots();
  assert.equal(snapshots.length, ACTION_LOG.length);
  assert.equal(snapshots.every((snapshot) => snapshot.ordered_ids.length === 300 && snapshot.values.length === 300), true);
  assert.equal(snapshots[2].values.every((value) => value === 2), true);
  assert.equal(snapshots[4].values.every((value) => value === 8), true);
  assert.equal(snapshots[6].values.filter((value) => value === 5).length, 100);
  assert.equal(snapshots[6].values.filter((value) => value === 8).length, 200);
  assert.equal(snapshots.at(-1).values.every((value) => value === 0), true);
});

test("variance summary is deterministic", () => {
  assert.deepEqual(summarize([ 1, 2, 3, 4 ]), {
    count: 4,
    min: 1,
    max: 4,
    mean: 2.5,
    median: 3,
    p95: 4,
    standard_deviation: Math.sqrt(1.25),
    coefficient_of_variation: Math.sqrt(1.25) / 2.5,
  });
});

test("runner persists every measured sample in privacy-safe form", () => {
  const source = readFileSync(new URL("./chromium-runner.ts", import.meta.url), "utf8");
  assert.match(source, /measured_samples: measurements\.map/);
  assert.match(source, /sequence: index \+ 1/);
  assert.match(source, /cdp_task_duration_delta_ms: sample\.task_duration_delta_ms/);
  assert.match(source, /browser\.child\.once\("exit"/);
  assert.match(source, /rmSync\(browser\.profile/);
});
