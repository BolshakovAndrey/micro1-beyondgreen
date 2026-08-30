/**
 * Uses the TypeScript Compiler API to inventory candidate risks and derive an
 * oracle-free ProbePlan linked only to arm-visible contracts.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

import type { ArmVisibleInvariantContract } from "../../evaluation/arm-visible/BG-D01/contract.ts";
import { canonicalJson, sha256 } from "./canonical-json.ts";
import { D01_FIXTURE } from "./fixture.ts";
import {
  ProbePlanSchema, RiskInventorySchema, type CandidateId, type ImmutableCandidateRef,
  type ProbePlan, type RiskInventory,
} from "./schemas.ts";

const categories = D01_FIXTURE.engine.riskCategories;

function isInsideRoot(root: string, target: string): boolean {
  return target === root || target.startsWith(`${root}${path.sep}`);
}

function containsNode(node: ts.Node, predicate: (child: ts.Node) => boolean): boolean {
  if (predicate(node)) return true;
  let found = false;
  ts.forEachChild(node, (child) => { if (!found && containsNode(child, predicate)) found = true; });
  return found;
}

/** Analyze neutral TypeScript structure without relying on candidate-specific identifier names. */
export function analyzeRiskSource(
  sourceText: string,
  sourcePath: string,
  repositoryRoot: string,
  candidateId: CandidateId,
): RiskInventory {
  const root = path.resolve(repositoryRoot);
  const absoluteSource = path.resolve(root, sourcePath);
  const compilerOptions: ts.CompilerOptions = { noResolve: true, target: ts.ScriptTarget.ESNext };
  const host = ts.createCompilerHost(compilerOptions, true);
  const originalGetSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (fileName, languageVersion, onError, shouldCreateNewSourceFile) => (
    path.resolve(fileName) === absoluteSource
      ? ts.createSourceFile(absoluteSource, sourceText, languageVersion, true, ts.ScriptKind.TS)
      : originalGetSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile)
  );
  const program = ts.createProgram([absoluteSource], compilerOptions, host);
  const source = program.getSourceFile(absoluteSource);
  if (!source) throw new Error("TypeScript could not create the bounded candidate source file.");
  const checker = program.getTypeChecker();
  const signalFactories = new Set<ts.Symbol>();
  const signalBindings = new Set<ts.Symbol>();
  const capturedReads = new Map<ts.Symbol, { property: ts.Symbol; position: number }>();
  let signalReads = 0;
  let signalWrites = 0;
  let loopCount = 0;
  let capturedPreLoopRead = false;
  let latestValueReadInsideLoop = false;
  const parseDiagnostics = (source as ts.SourceFile & { parseDiagnostics?: readonly ts.Diagnostic[] }).parseDiagnostics;
  let unsupportedSyntax = (parseDiagnostics?.length ?? 0) > 0;
  let externalImport = false;

  const collect = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const specifier = node.moduleSpecifier.text;
      const allowedPackages = new Set(["@preact/signals-react", "@preact/signals-react/runtime", "react"]);
      if (path.isAbsolute(specifier) || specifier.startsWith("file:")) externalImport = true;
      else if (specifier.startsWith(".")) {
        const target = path.resolve(path.dirname(absoluteSource), specifier);
        if (!isInsideRoot(root, target)) externalImport = true;
      }
      else if (!allowedPackages.has(specifier)) externalImport = true;
      if (specifier === "@preact/signals-react" && node.importClause?.namedBindings
        && ts.isNamedImports(node.importClause.namedBindings)) {
        for (const element of node.importClause.namedBindings.elements) {
          if ((element.propertyName?.text ?? element.name.text) === "useSignal") {
            const symbol = checker.getSymbolAtLocation(element.name);
            if (symbol) signalFactories.add(symbol);
          }
        }
      }
    }
    if (ts.isWithStatement(node)
      || (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword)) unsupportedSyntax = true;
    ts.forEachChild(node, collect);
  };
  collect(source);

  const collectSignals = (node: ts.Node): void => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer
      && ts.isCallExpression(node.initializer) && ts.isIdentifier(node.initializer.expression)
      && signalFactories.has(checker.getSymbolAtLocation(node.initializer.expression)!)) {
      const symbol = checker.getSymbolAtLocation(node.name);
      if (symbol) signalBindings.add(symbol);
    }
    ts.forEachChild(node, collectSignals);
  };
  collectSignals(source);

  const signalValueAccess = (node: ts.Node): ts.Symbol | null => {
    if (!ts.isPropertyAccessExpression(node) || node.name.text !== "value"
      || !ts.isIdentifier(node.expression)) return null;
    const symbol = checker.getSymbolAtLocation(node.expression);
    return symbol && signalBindings.has(symbol) ? symbol : null;
  };

  const collectSnapshots = (node: ts.Node): void => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      const signal = signalValueAccess(node.initializer);
      const snapshot = checker.getSymbolAtLocation(node.name);
      if (signal && snapshot) capturedReads.set(snapshot, { property: signal, position: node.pos });
    }
    if (signalValueAccess(node)) signalReads += 1;
    ts.forEachChild(node, collectSnapshots);
  };
  collectSnapshots(source);

  const inspect = (node: ts.Node): void => {
    const isLoop = ts.isForStatement(node) || ts.isForOfStatement(node) || ts.isForInStatement(node)
      || ts.isWhileStatement(node) || ts.isDoStatement(node);
    if (isLoop) {
      loopCount += 1;
      const loop = node;
      const inspectAssignment = (child: ts.Node): void => {
        if (ts.isBinaryExpression(child) && child.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
          const writtenProperty = signalValueAccess(child.left);
          if (writtenProperty) {
            signalWrites += 1;
            latestValueReadInsideLoop ||= containsNode(child.right, (item) => (
              item !== child.left && signalValueAccess(item) === writtenProperty
            ));
            capturedPreLoopRead ||= containsNode(child.right, (item) => {
              if (!ts.isIdentifier(item)) return false;
              const symbol = checker.getSymbolAtLocation(item);
              const captured = symbol ? capturedReads.get(symbol) : undefined;
              return captured?.property === writtenProperty && captured.position < loop.pos;
            });
          }
        }
        ts.forEachChild(child, inspectAssignment);
      };
      inspectAssignment(loop);
    }
    else if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
      && signalValueAccess(node.left)) signalWrites += 1;
    ts.forEachChild(node, inspect);
  };
  inspect(source);

  const orderingEvidence = capturedPreLoopRead
    ? "Observed a signal value captured before a repeated write loop and reused by a write inside that loop."
    : latestValueReadInsideLoop
      ? "Observed repeated writes whose right-hand side reads the latest signal value inside the loop."
      : loopCount > 0
        ? "Observed repeated control flow, but no captured-before-loop signal read reused by a loop write."
        : "No repeated-update loop was observed.";
  const observed: Partial<Record<(typeof categories)[number], string>> = {
    state: `Observed ${signalWrites} signal value write(s).`,
    reads_writes: `Structurally resolved ${signalReads} read(s) and ${signalWrites} write(s) through bindings created by the approved signal factory import.`,
    ordering: orderingEvidence,
    identity: "Stable card identity is delegated to the arm-visible CARD_IDS contract.",
  };
  return RiskInventorySchema.parse({
    schemaVersion: D01_FIXTURE.schemas.riskInventory,
    candidateId,
    sourceSha256: sha256(sourceText),
    risks: categories.map((category) => ({
      id: `${D01_FIXTURE.fixtureId}-RISK-${category.toUpperCase()}`,
      category,
      status: observed[category] ? "observed" : "not_observed",
      evidence: observed[category] ?? `No ${category} construct was identified in the bounded D01 source.`,
    })),
    unsupportedSyntax,
    externalImport,
  });
}

/** Build a typed, oracle-free migration-risk inventory with the TypeScript Compiler API. */
export function inventoryRisk(repositoryRoot: string, candidate: ImmutableCandidateRef): RiskInventory {
  const sourceText = readFileSync(path.resolve(repositoryRoot, candidate.relativePath), "utf8");
  return analyzeRiskSource(sourceText, candidate.relativePath, repositoryRoot, candidate.candidateId);
}

/** Derive required checks solely from typed risks and the arm-visible behavior contract. */
export function deriveProbePlan(
  inventory: RiskInventory,
  invariantContracts: readonly ArmVisibleInvariantContract[],
): ProbePlan {
  if (inventory.unsupportedSyntax || inventory.externalImport || invariantContracts.length === 0) {
    throw new Error("Risk inventory cannot support a complete oracle-free ProbePlan.");
  }
  const probes = invariantContracts.map((contract) => {
    const linkedRisks = inventory.risks.filter((risk) => contract.riskCategories.includes(
      risk.category as "ordering",
    ));
    if (linkedRisks.length === 0) throw new Error("Arm-visible invariant has no risk-inventory coverage.");
    return {
      id: contract.probeId,
      riskIds: linkedRisks.map((risk) => risk.id),
      armVisibleContractId: contract.id,
      armVisibleContract: contract.description,
      required: true,
    };
  });
  return ProbePlanSchema.parse({
    schemaVersion: D01_FIXTURE.schemas.probePlan,
    oracleFree: true,
    derivation: {
      riskInventorySha256: riskInventorySha256(inventory),
      invariantContractIds: invariantContracts.map((contract) => contract.id),
      seededDefectKnowledgeUsed: false,
    },
    probes,
  });
}

/** Hashes a validated risk inventory for immutable ProbePlan derivation evidence. */
export function riskInventorySha256(inventory: RiskInventory): string {
  return sha256(canonicalJson(RiskInventorySchema.parse(inventory)));
}
