#!/usr/bin/env node

import { formatTaskList, resolveTask } from "./tasks/registry.ts";
import { executeTask } from "./tasks/runner.ts";

/** Run the repository task command-line interface. */
export function main(arguments_: readonly string[] = process.argv.slice(2)): number {
  const [name, ...taskArguments] = arguments_;
  if (name === "list") {
    if (taskArguments.length > 0) throw new Error("The list command does not accept arguments.");
    process.stdout.write(`${formatTaskList()}\n`);
    return 0;
  }
  if (!name) throw new Error('Missing task name. Run "npm run task -- list" to see available tasks.');
  return executeTask(resolveTask(name, taskArguments), process.cwd());
}

try {
  process.exitCode = main();
}
catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`TASK_ERROR ${message}\n`);
  process.exitCode = 1;
}
