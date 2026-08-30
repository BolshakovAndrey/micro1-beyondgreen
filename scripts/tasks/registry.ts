import { commonTasks } from "./common.ts";
import { d01Tasks } from "./d01.ts";
import { developmentTasks } from "./development.ts";
import { heldOutTasks } from "./held-out.ts";
import { officialTasks } from "./official.ts";
import { phase05Tasks } from "./phase0.5.ts";
import { preUnblindingTasks } from "./pre-unblinding.ts";
import type { TaskDefinition } from "./types.ts";

/** Aggregate task groups, reject duplicate names, and return a stable sorted registry. */
export function buildTaskRegistry(
  groups: readonly (readonly TaskDefinition[])[],
): readonly TaskDefinition[] {
  const tasks = groups.flat();
  const names = new Set<string>();
  for (const task of tasks) {
    if (names.has(task.name)) throw new Error(`Duplicate task name: ${task.name}`);
    names.add(task.name);
  }
  return tasks.toSorted((left, right) => left.name === right.name ? 0 : left.name < right.name ? -1 : 1);
}

/** The ordinary registry contains only safe tests, audits, and bounded verification. */
export const taskRegistry = buildTaskRegistry([
  commonTasks,
  d01Tasks,
  developmentTasks,
  heldOutTasks,
  officialTasks,
  phase05Tasks,
  preUnblindingTasks,
]);

const tasksByName = new Map(taskRegistry.map((task) => [task.name, task]));

/** Resolve exactly one reviewed task name and reject all forwarded arguments. */
export function resolveTask(name: string, arguments_: readonly string[]): TaskDefinition {
  const task = tasksByName.get(name);
  if (!task) throw new Error(`Unknown task: ${name}. Run \"npm run task -- list\" to see available tasks.`);
  const expectedArguments = task.acceptedArguments ?? [];
  if (arguments_.length !== expectedArguments.length ||
      arguments_.some((argument, index) => argument !== expectedArguments[index])) {
    if (expectedArguments.length > 0) {
      throw new Error(
        `Task ${name} accepts only: ${expectedArguments.join(" ")}. Received: ${arguments_.join(" ") || "none"}`,
      );
    }
    throw new Error(`Task ${name} does not accept arguments: ${arguments_.join(" ")}`);
  }
  return task;
}

/** Render the stable, human-readable task catalog. */
export function formatTaskList(): string {
  const lines = taskRegistry.map((task) => `  ${task.name.padEnd(34)} ${task.description}`);
  return ["Available tasks:", ...lines].join("\n");
}
