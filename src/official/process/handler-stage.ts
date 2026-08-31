/** Privacy-safe execution stages that identify a failed role boundary without exposing data. */
export const OFFICIAL_HANDLER_FAILURE_STAGES = [
  "REQUEST_BINDING",
  "LOAD_PROVIDER",
  "LOAD_EVALUATOR",
  "LOAD_CANDIDATE",
  "LOAD_MOUNT",
  "NORMALIZE_SCENARIO",
  "MOUNT",
  "EXECUTE_STEP",
  "DISPOSE",
  "EXECUTE_PROVIDER",
  "EXECUTE_EVALUATOR",
  "OUTPUT_SCHEMA",
] as const;

export type OfficialHandlerFailureStage = typeof OFFICIAL_HANDLER_FAILURE_STAGES[number];

/** Carry only an approved category across the process boundary; never retain the source error. */
export class OfficialHandlerStageError extends Error {
  public readonly stage: OfficialHandlerFailureStage;

  public constructor(stage: OfficialHandlerFailureStage) {
    super("Official role handler failed at a privacy-safe stage.");
    this.name = "OfficialHandlerStageError";
    this.stage = stage;
  }
}

/** Replace any nested exception with a stable, non-disclosing stage category. */
export async function atOfficialHandlerStage<T>(
  stage: OfficialHandlerFailureStage,
  operation: () => T | Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof OfficialHandlerStageError) throw error;
    throw new OfficialHandlerStageError(stage);
  }
}
