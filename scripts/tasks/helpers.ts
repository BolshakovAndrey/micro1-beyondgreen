import type { TaskStep } from "./types.ts";

/** Create a shell-free Node.js process step from a reviewed argument array. */
export function nodeStep(label: string, ...arguments_: string[]): TaskStep {
  return { label, executable: process.execPath, arguments: arguments_ };
}
