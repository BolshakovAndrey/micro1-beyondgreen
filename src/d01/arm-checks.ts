/**
 * Runs compilation, frozen visible assertions, oracle-free internal probes, and the
 * physical denied-access check available inside an arm worker.
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

import { ARM_VISIBLE_INVARIANTS, CARD_IDS, type MuseumBoardComponent } from "../../evaluation/arm-visible/BG-D01/contract.ts";
import { mountMuseumBoard } from "../../evaluation/arm-visible/BG-D01/harness.ts";
import { VISIBLE_ASSERTIONS } from "../../evaluation/arm-visible/BG-D01/visible-assertions.ts";
import { canonicalJson, sha256 } from "./canonical-json.ts";
import { D01_FIXTURE } from "./fixture.ts";
import {
  InternalCheckResultSchema,
  LegacyGateResultSchema,
  type InternalCheckResult,
  type LegacyGateResult,
  type ProbePlan,
} from "./schemas.ts";

/** Exposes the descriptor-owned frozen visible assertion identifiers used by every arm. */
export const VISIBLE_TEST_IDS = D01_FIXTURE.armVisible.visibleAssertionIds;

function equal(left: unknown, right: unknown): boolean {
  return canonicalJson(left) === canonicalJson(right);
}

/** Compile the immutable candidate before attempting to execute its module. */
export function compileCandidate(candidatePath: string): string[] {
  const program = ts.createProgram([candidatePath], {
    allowImportingTsExtensions: true,
    esModuleInterop: true,
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    noEmit: true,
    skipLibCheck: true,
    strict: true,
    target: ts.ScriptTarget.ES2024,
    types: ["node"],
  });
  return ts.getPreEmitDiagnostics(program).map((diagnostic) => (
    ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")
  ));
}

/** Keep compilation, deterministic assertions, and operational uncertainty disjoint. */
export function classifyLegacyGate(input: Readonly<{
  compileDiagnostics: readonly string[];
  deterministicAssertionFailures: readonly string[];
  operationalFailures: readonly string[];
}>): LegacyGateResult {
  const compileDiagnostics = [...input.compileDiagnostics];
  const deterministicAssertionFailures = [...input.deterministicAssertionFailures];
  const operationalFailures = [...input.operationalFailures];
  return LegacyGateResultSchema.parse({
    compileStatus: compileDiagnostics.length === 0 ? "passed" : "failed",
    compilePassed: compileDiagnostics.length === 0,
    compileDiagnostics,
    visibleTestIds: VISIBLE_TEST_IDS,
    visibleStatus: deterministicAssertionFailures.length > 0
      ? "failed"
      : operationalFailures.length > 0 ? "not_run" : "passed",
    visiblePassed: deterministicAssertionFailures.length === 0 && operationalFailures.length === 0,
    deterministicAssertionFailures,
    operationalFailures,
    deterministic: operationalFailures.length === 0,
    operationalFailure: operationalFailures.length > 0,
  });
}

/** Execute the exact five frozen visible assertions for one immutable candidate. */
export async function runVisibleLegacyGate(
  Component: MuseumBoardComponent,
  candidatePath: string,
  knownCompileDiagnostics?: readonly string[],
): Promise<LegacyGateResult> {
  const compileDiagnostics = knownCompileDiagnostics
    ? [...knownCompileDiagnostics]
    : compileCandidate(candidatePath);
  const deterministicAssertionFailures: string[] = [];
  const operationalFailures: string[] = [];
  for (const assertion of VISIBLE_ASSERTIONS) {
    try {
      if (!await assertion.run(Component)) {
        deterministicAssertionFailures.push(`${assertion.id}: deterministic assertion failed.`);
      }
    }
    catch {
      operationalFailures.push(`${assertion.id}: execution failed operationally.`);
    }
  }

  return classifyLegacyGate({ compileDiagnostics, deterministicAssertionFailures, operationalFailures });
}

/** Run the arm-owned checks declared by an oracle-free ProbePlan. */
export async function runInternalChecks(
  Component: MuseumBoardComponent,
  plan: ProbePlan,
): Promise<InternalCheckResult> {
  const results = [];
  const errors: string[] = [];
  let counterexample: {
    probeId: string;
    summary: string;
    differingItems: Array<{ id: string; expected: number; actual: number }>;
    omittedDifferingItemCount: number;
    boundedTo: 5;
  } | null = null;
  for (const probe of plan.probes) {
    const contract = ARM_VISIBLE_INVARIANTS.find((invariant) => invariant.probeId === probe.id);
    if (!contract || probe.armVisibleContractId !== contract.id) {
      errors.push("Unsupported required probe.");
      continue;
    }
    const board = await mountMuseumBoard(Component);
    try {
      await board.dispatch({ type: "select-all" });
      const observation = await board.dispatch({ type: "allocate", multiplicity: 2 });
      const passed = equal(observation.allocations, Array(300).fill(2))
        && equal(observation.selectedIds, CARD_IDS)
        && observation.step === 1
        && equal(observation.actionLog, ["mount", "select-all", "allocate-1x2"]);
      results.push({ probeId: probe.id, passed, observationSha256: sha256(canonicalJson(observation)) });
      if (!passed) {
        const differences = CARD_IDS.flatMap((id, index) => (
          observation.allocations[index] === 2
            ? []
            : [{ id, expected: 2, actual: observation.allocations[index] ?? -1 }]
        ));
        counterexample = {
          probeId: probe.id,
          summary: "The arm-visible multiplicity-two contract diverged from the observed allocation state.",
          differingItems: differences.slice(0, 5),
          omittedDifferingItemCount: Math.max(0, differences.length - 5),
          boundedTo: 5,
        };
      }
    }
    catch {
      errors.push("Required arm-owned probe failed operationally.");
    }
    finally {
      await board.dispose();
    }
  }
  return InternalCheckResultSchema.parse({
    oracleFree: true,
    deterministic: errors.length === 0,
    oracleAccessAttempted: false,
    checks: results,
    counterexample,
    errors,
  });
}

/** Prove this permission-restricted arm process cannot read or enumerate the oracle tree. */
export function assertVerifierAccessDenied(repositoryRoot: string): true {
  const verifierRoot = path.resolve(repositoryRoot, D01_FIXTURE.verifierOnly.rootPath);
  for (const operation of [
    () => readdirSync(verifierRoot),
    () => readFileSync(path.resolve(repositoryRoot, D01_FIXTURE.verifierOnly.groundTruthPath)),
  ]) {
    try {
      operation();
      throw new Error("Verifier-only capability unexpectedly available to arm process.");
    }
    catch (error) {
      if (error instanceof Error && error.message.includes("unexpectedly available")) throw error;
      if ((error as NodeJS.ErrnoException).code !== "ERR_ACCESS_DENIED") {
        throw new Error("Verifier-only denial did not use the required capability error.");
      }
    }
  }
  return true;
}
