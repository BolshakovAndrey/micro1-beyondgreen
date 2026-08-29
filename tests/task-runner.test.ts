import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  allowedTestRoots,
  assertDiscoveredTestFiles,
  discoverAllTests,
} from "../scripts/tasks/discovery.ts";
import {
  buildTaskRegistry,
  formatTaskList,
  resolveTask,
  taskRegistry,
} from "../scripts/tasks/registry.ts";
import { executeTask } from "../scripts/tasks/runner.ts";
import type { TaskDefinition, TaskProcessExecutor } from "../scripts/tasks/types.ts";

test("list exposes every registered task with a short description", () => {
  const output = formatTaskList();
  for (const task of taskRegistry) {
    assert.match(output, new RegExp(`${task.name.replaceAll(".", "\\.")}\\s+${task.description}`));
  }
});

test("known task resolution preserves its reviewed argument arrays", () => {
  const task = resolveTask("d01:verify", []);
  assert.equal(task.steps.length, 6);
  assert.deepEqual(task.steps[1].arguments, [
    "--test",
    "evaluation/arm-visible/BG-D01/visible.test.ts",
  ]);
  assert.throws(() => resolveTask("d01:verify", ["--unexpected"]), /does not accept arguments/);
});

test("test:all discovery is deterministic, bounded, and excludes verifier-only tests", () => {
  const first = discoverAllTests();
  const second = discoverAllTests();
  assert.deepEqual(first, second);
  assert.deepEqual(first, [...first].sort((left, right) => left === right ? 0 : left < right ? -1 : 1));
  assert.ok(first.includes("evaluation/arm-visible/BG-D01/visible.test.ts"));
  assert.ok(first.includes("evaluation/arm-visible/BG-D01/step-contract.test.ts"));
  assert.ok(first.every((file) => allowedTestRoots.some((root) => file.startsWith(`${root}/`))));
  assert.ok(first.every((file) => !file.startsWith("evaluation/verifier-only/")));
  assert.throws(() => assertDiscoveredTestFiles([]), /returned no test files/);
  assert.throws(
    () => assertDiscoveredTestFiles(["evaluation/verifier-only/BG-D01/self-check.test.ts"]),
    /outside allowed roots/,
  );
});

test("registry aggregation rejects duplicate task names", () => {
  const duplicate: TaskDefinition = {
    name: "duplicate",
    description: "Synthetic duplicate for the registry contract.",
    steps: [],
  };
  assert.throws(() => buildTaskRegistry([[duplicate], [duplicate]]), /Duplicate task name/);
});

test("ordinary registry excludes all historical live run task names", () => {
  const forbiddenNames = [
    "phase0.5:run:model",
    "phase0.5:run:cli-diagnostics",
    "phase0.5:run:doctor",
    "phase0.5:run:network",
    "phase0.5:run:chromium",
  ];
  assert.ok(forbiddenNames.every((name) => !taskRegistry.some((task) => task.name === name)));
  assert.deepEqual(
    taskRegistry.filter((task) => task.name.startsWith("phase0.5:")).map((task) => task.name),
    ["phase0.5:verify"],
  );
});

test("package.json keeps stable scripts without fixture-specific paths or keys", () => {
  const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
    scripts: Record<string, string>;
  };
  assert.equal(packageJson.scripts.test, "node scripts/task.ts test:all");
  assert.deepEqual(Object.keys(packageJson.scripts).sort(), [
    "compile",
    "preflight:control",
    "preflight:implementation",
    "task",
    "test",
  ]);
  assert.doesNotMatch(JSON.stringify(packageJson.scripts), /BG-D01|evaluation\/arm-visible|d01:/i);
});

test("unknown tasks fail closed with a non-zero command exit", () => {
  const result = spawnSync(process.execPath, ["scripts/task.ts", "not-a-task"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /TASK_ERROR Unknown task: not-a-task/);
});

test("task execution never enables shell interpolation or arbitrary task names", () => {
  const calls: Parameters<TaskProcessExecutor>[] = [];
  const executor: TaskProcessExecutor = (...arguments_) => {
    calls.push(arguments_);
    return { status: 0 };
  };
  const task = resolveTask("d01:hash", []);
  assert.equal(executeTask(task, process.cwd(), executor), 0);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][2].shell, false);
  assert.throws(() => resolveTask("d01:hash; arbitrary-command", []), /Unknown task/);
});
