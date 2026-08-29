import { spawnSync } from "node:child_process";

import type { TaskDefinition, TaskProcessExecutor } from "./types.ts";

const defaultExecutor: TaskProcessExecutor = (executable, arguments_, options) =>
  spawnSync(executable, [...arguments_], options);

/** Execute reviewed steps sequentially and stop at the first non-zero result. */
export function executeTask(
  task: TaskDefinition,
  cwd: string,
  executor: TaskProcessExecutor = defaultExecutor,
): number {
  for (const step of task.steps) {
    process.stdout.write(`TASK_STEP ${task.name} ${step.label}\n`);
    // shell:false is the security boundary: arguments remain data, never shell source.
    const result = executor(step.executable, step.arguments, { cwd, stdio: "inherit", shell: false });
    if (result.error) {
      process.stderr.write(`TASK_FAILED ${task.name} ${step.label}: ${result.error.message}\n`);
      return 1;
    }
    if (result.status !== 0) {
      process.stderr.write(`TASK_FAILED ${task.name} ${step.label} exit=${result.status ?? "null"}\n`);
      return result.status ?? 1;
    }
  }
  process.stdout.write(`TASK_PASSED ${task.name}\n`);
  return 0;
}
