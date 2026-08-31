import type { OfficialEvaluatorProcessHandler } from "../process/evaluator-entrypoint.ts";
import type { OfficialEvaluatorHandlerOutput, OfficialEvaluatorProcessRequest } from "../process/ipc.ts";

export type InjectedEvaluator = (
  request: OfficialEvaluatorProcessRequest,
) => OfficialEvaluatorHandlerOutput | Promise<OfficialEvaluatorHandlerOutput>;

/** Wrap an injected evaluator without importing any verifier implementation. */
export function createEvaluatorHandler(evaluator: InjectedEvaluator): OfficialEvaluatorProcessHandler {
  let consumed = false;
  return async (request) => {
    if (consumed) throw new Error("Evaluator handler is single-use.");
    consumed = true;
    return evaluator(request);
  };
}
