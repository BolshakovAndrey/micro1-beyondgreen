import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import ts from "typescript";

import { resolveOfficialProductionSlotBinding } from "../../../src/official/execution/production-root.ts";
import { OfficialExecutionSlotSchema, type OfficialExecutionSlot } from "../../../src/official/integration/execution-plan.ts";
import { OFFICIAL_FROZEN_INVENTORY_BINDINGS } from "../../../src/official/inventory/registry.ts";
import { sha256CanonicalJson } from "../../../src/official/process/ipc.ts";
import type { RoleCapabilityPlan } from "../../../src/official/adapters/types.ts";

const repositoryRoot = path.resolve(import.meta.dirname, "../../..");

function repositoryPath(absolutePath: string): string {
  return path.relative(repositoryRoot, absolutePath).split(path.sep).join("/");
}

function resolveLocalModule(importer: string, specifier: string): string | null {
  if (!specifier.startsWith(".")) return null;
  const unresolved = path.resolve(path.dirname(importer), specifier);
  const candidates = path.extname(unresolved)
    ? [unresolved]
    : [`${unresolved}.ts`, `${unresolved}.tsx`, `${unresolved}.mjs`, path.join(unresolved, "index.ts")];
  const resolved = candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
  if (!resolved || !repositoryPath(resolved) || repositoryPath(resolved).startsWith("../")) {
    throw new Error(`Static import cannot be resolved inside the repository: ${specifier}`);
  }
  return resolved;
}

function importCarriesRuntimeValue(node: ts.ImportDeclaration): boolean {
  const clause = node.importClause;
  if (!clause) return true;
  if (clause.isTypeOnly) return false;
  if (clause.name) return true;
  if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) return true;
  return clause.namedBindings === undefined
    || clause.namedBindings.elements.some((element) => !element.isTypeOnly);
}

function staticValueDependencies(absolutePath: string): readonly string[] {
  const source = fs.readFileSync(absolutePath, "utf8");
  const parsed = ts.createSourceFile(absolutePath, source, ts.ScriptTarget.Latest, true);
  const dependencies: string[] = [];
  for (const statement of parsed.statements) {
    if (ts.isImportDeclaration(statement)
      && ts.isStringLiteral(statement.moduleSpecifier)
      && importCarriesRuntimeValue(statement)) {
      const resolved = resolveLocalModule(absolutePath, statement.moduleSpecifier.text);
      if (resolved) dependencies.push(resolved);
    }
    if (ts.isExportDeclaration(statement)
      && !statement.isTypeOnly
      && statement.moduleSpecifier
      && ts.isStringLiteral(statement.moduleSpecifier)) {
      const resolved = resolveLocalModule(absolutePath, statement.moduleSpecifier.text);
      if (resolved) dependencies.push(resolved);
    }
  }
  return dependencies;
}

function valueImportClosure(repositoryRoots: readonly string[]): readonly string[] {
  const pending = repositoryRoots.map((root) => path.resolve(repositoryRoot, root));
  const visited = new Set<string>();
  while (pending.length > 0) {
    const current = pending.pop()!;
    if (visited.has(current)) continue;
    if (!fs.existsSync(current)) throw new Error(`Import-closure root is absent: ${repositoryPath(current)}`);
    visited.add(current);
    pending.push(...staticValueDependencies(current));
  }
  return [...visited].map(repositoryPath).sort();
}

function modulePaths(value: unknown, paths = new Set<string>()): readonly string[] {
  if (value === null || typeof value !== "object") return [...paths];
  if ("modulePath" in value && typeof value.modulePath === "string") paths.add(value.modulePath);
  for (const child of Object.values(value)) modulePaths(child, paths);
  return [...paths];
}

function pathMatches(root: string, value: string): boolean {
  return value === root || value.startsWith(`${root}/`);
}

function assertClosureMatchesCapability(
  label: string,
  capability: RoleCapabilityPlan,
  dynamicModules: readonly string[],
): void {
  const closure = valueImportClosure([capability.entrypoint.modulePath, ...dynamicModules]);
  for (const modulePath of closure) {
    assert.equal(
      capability.denyReadPaths.some((denied) => pathMatches(denied, modulePath)),
      false,
      `${label} eagerly imports denied module ${modulePath}`,
    );
    assert.equal(
      capability.allowReadPaths.some((allowed) => pathMatches(allowed, modulePath)),
      true,
      `${label} eagerly imports module outside its allowlist: ${modulePath}`,
    );
  }
}

function executionSlots(): readonly OfficialExecutionSlot[] {
  let ordinal = 0;
  return OFFICIAL_FROZEN_INVENTORY_BINDINGS.flatMap((fixture) => fixture.candidates.map((candidate) => {
    ordinal += 1;
    return OfficialExecutionSlotSchema.parse({
      ordinal,
      slotId: `${fixture.fixtureId}:${candidate.candidateId}`,
      fixtureId: fixture.fixtureId,
      candidateId: candidate.candidateId,
      candidate: {
        modulePath: candidate.modulePath,
        exportName: candidate.exportName,
        sha256: sha256CanonicalJson(candidate),
      },
      descriptor: fixture.descriptor,
      membership: fixture.membership,
      behaviorClass: fixture.behaviorClass,
      arms: ["status-quo", "beyondgreen"],
      attemptOrdinal: 1,
      candidateExecutionAllowed: false,
      officialOrScoredRun: false,
    });
  }));
}

test("every production role value-import closure stays inside its filesystem capability", () => {
  for (const slot of executionSlots()) {
    const binding = resolveOfficialProductionSlotBinding(slot);
    for (const arm of ["status-quo", "beyondgreen"] as const) {
      assertClosureMatchesCapability(
        `${slot.slotId}:${arm}:arm`,
        binding.arm[arm],
        modulePaths(binding.armPayload(arm)),
      );
    }
    assertClosureMatchesCapability(
      `${slot.slotId}:scenario-provider`,
      binding.scenarioProvider,
      modulePaths(binding.scenarioProviderPayload()),
    );
    assertClosureMatchesCapability(
      `${slot.slotId}:observer`,
      binding.observer,
      modulePaths(binding.observerPayload("status-quo", {} as never)),
    );
    assertClosureMatchesCapability(
      `${slot.slotId}:evaluator`,
      binding.evaluator,
      modulePaths(binding.evaluatorPayload("status-quo")),
    );
  }
});
