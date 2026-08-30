/** One fixed process invocation within a repository task. */
export type TaskStep = Readonly<{
  label: string;
  executable: string;
  arguments: readonly string[];
}>;

/** A discoverable repository task composed only from reviewed process steps. */
export type TaskDefinition = Readonly<{
  name: string;
  description: string;
  steps: readonly TaskStep[];
  acceptedArguments?: readonly string[];
}>;

/** Minimal process result used to keep task execution independently testable. */
export type TaskProcessResult = Readonly<{
  status: number | null;
  error?: Error;
}>;

/** Process boundary injected by tests; production uses Node's synchronous spawn. */
export type TaskProcessExecutor = (
  executable: string,
  arguments_: readonly string[],
  options: Readonly<{cwd: string; stdio: "inherit"; shell: false}>,
) => TaskProcessResult;
