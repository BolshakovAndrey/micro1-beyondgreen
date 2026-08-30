import { createHash } from "node:crypto";
import { lstatSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";

import ts from "typescript";

import { adaptFrozenManifestText, type FrozenManifestFile } from "./manifest-adapters.ts";
import { OFFICIAL_FROZEN_INVENTORY_BINDINGS } from "./registry.ts";

export const OFFICIAL_INVENTORY_SCHEMA_VERSION = "beyondgreen-official-static-inventory@1.0.0" as const;

export type OfficialInventoryFixtureResult = Readonly<{
  fixtureId: string;
  membership: "development" | "held_out";
  behaviorClass: string;
  candidateCount: 2;
  manifestCount: number;
  verifiedFrozenFileCount: number;
}>;

/** One immutable candidate slot derived only from verified static bindings and bytes. */
export type OfficialFrozenInventorySlot = Readonly<{
  fixtureId: string;
  candidateId: string;
  modulePath: string;
  exportName: string;
  candidateSha256: string;
  descriptor: Readonly<{modulePath: string; exportName: string}>;
  membership: "development" | "held_out";
  behaviorClass: string;
}>;

export type OfficialFrozenInventoryResult = Readonly<{
  schemaVersion: typeof OFFICIAL_INVENTORY_SCHEMA_VERSION;
  fixtureCount: 10;
  candidateCount: 20;
  developmentFixtureCount: 4;
  heldOutFixtureCount: 6;
  executionSlotCount: 20;
  verifiedManifestCount: number;
  verifiedFrozenFileCount: number;
  inventorySha256: string;
  fixtures: readonly OfficialInventoryFixtureResult[];
  slots: readonly OfficialFrozenInventorySlot[];
  candidateImportsPerformed: false;
  candidateExecutionPerformed: false;
  verifierContentParsed: false;
  officialOrScoredRun: false;
  unblindingPerformed: false;
}>;

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    const serialized = JSON.stringify(value);
    if (serialized === undefined) throw new Error("Official inventory canonical JSON does not permit undefined.");
    return serialized;
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, child]) => `${JSON.stringify(key)}:${canonicalJson(child)}`).join(",")}}`;
}

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function resolveFrozenFile(repositoryRoot: string, relativePath: string): string {
  if (!path.isAbsolute(repositoryRoot)) throw new Error("Official inventory repositoryRoot must be absolute.");
  const segments = relativePath.split("/");
  if (path.posix.isAbsolute(relativePath) || /^[A-Za-z]:[\\/]/u.test(relativePath)
    || relativePath.includes("\\") || relativePath.includes("\0")
    || segments.some((segment) => segment === "" || segment === "." || segment === "..")) {
    throw new Error(`Non-canonical repository path: ${relativePath}.`);
  }
  const root = realpathSync(repositoryRoot);
  const resolved = path.resolve(root, relativePath);
  const stat = lstatSync(resolved);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`Frozen path must be a regular non-symlink file: ${relativePath}.`);
  const real = realpathSync(resolved);
  if (real !== root && !real.startsWith(`${root}${path.sep}`)) throw new Error(`Frozen path escapes repository root: ${relativePath}.`);
  return real;
}

function exportModifier(node: ts.Node): boolean {
  return ts.canHaveModifiers(node) && (ts.getModifiers(node)?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false);
}

function collectBindingNames(name: ts.BindingName, names: Set<string>): void {
  if (ts.isIdentifier(name)) {
    names.add(name.text);
    return;
  }
  for (const element of name.elements) if (!ts.isOmittedExpression(element)) collectBindingNames(element.name, names);
}

/** Assert a named export from source text without importing or executing the module. */
export function assertStaticExportDeclaration(sourceText: string, exportName: string, fileName = "module.ts"): true {
  const source = ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS);
  const parseDiagnostics = (source as ts.SourceFile & {parseDiagnostics?: readonly ts.Diagnostic[]}).parseDiagnostics ?? [];
  if (parseDiagnostics.length > 0) throw new Error(`Cannot statically parse export declarations in ${fileName}.`);
  const exports = new Set<string>();
  for (const statement of source.statements) {
    if (ts.isVariableStatement(statement) && exportModifier(statement)) {
      for (const declaration of statement.declarationList.declarations) collectBindingNames(declaration.name, exports);
    }
    else if ((ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement) || ts.isInterfaceDeclaration(statement)
      || ts.isTypeAliasDeclaration(statement) || ts.isEnumDeclaration(statement)) && exportModifier(statement) && statement.name) {
      exports.add(statement.name.text);
    }
    else if (ts.isExportDeclaration(statement) && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      for (const element of statement.exportClause.elements) exports.add(element.name.text);
    }
  }
  if (!exports.has(exportName)) throw new Error(`Missing explicit export ${exportName} in ${fileName}.`);
  return true;
}

function mergeManifestFile(seen: Map<string, string>, file: FrozenManifestFile): void {
  const previous = seen.get(file.path);
  if (previous !== undefined && previous !== file.sha256) throw new Error(`Frozen manifests disagree on ${file.path}.`);
  seen.set(file.path, file.sha256);
}

function validateCardinality(): void {
  const fixtureIds = OFFICIAL_FROZEN_INVENTORY_BINDINGS.map(({ fixtureId }) => fixtureId);
  if (fixtureIds.length !== 10 || new Set(fixtureIds).size !== 10) throw new Error("Official inventory must contain exactly ten unique fixtures.");
  const development = OFFICIAL_FROZEN_INVENTORY_BINDINGS.filter(({ membership }) => membership === "development");
  const heldOut = OFFICIAL_FROZEN_INVENTORY_BINDINGS.filter(({ membership }) => membership === "held_out");
  if (development.length !== 4 || heldOut.length !== 6) throw new Error("Official inventory membership must be exactly 4 development / 6 held-out.");
  if (new Set(OFFICIAL_FROZEN_INVENTORY_BINDINGS.map(({ behaviorClass }) => behaviorClass)).size !== 10) {
    throw new Error("Official inventory behavior classes must form a ten-class bijection.");
  }
  for (const fixture of OFFICIAL_FROZEN_INVENTORY_BINDINGS) {
    if (fixture.candidates.length !== 2 || new Set(fixture.candidates.map(({ candidateId }) => candidateId)).size !== 2) {
      throw new Error(`${fixture.fixtureId} must bind exactly two unique candidates.`);
    }
  }
}

function validateSlots(slots: readonly OfficialFrozenInventorySlot[]): void {
  if (slots.length !== 20) throw new Error("Official inventory must produce exactly 20 candidate slots.");
  const slotIds = slots.map(({ fixtureId, candidateId }) => `${fixtureId}:${candidateId}`);
  if (new Set(slotIds).size !== 20) throw new Error("Official inventory slot identities must be unique.");
  if (new Set(slots.map(({ modulePath }) => modulePath)).size !== 20) {
    throw new Error("Official inventory candidate module paths must be unique.");
  }
  for (const slot of slots) {
    if (!/^[a-f0-9]{64}$/u.test(slot.candidateSha256)) {
      throw new Error(`Official inventory slot has an invalid candidate SHA-256: ${slot.fixtureId}:${slot.candidateId}.`);
    }
  }
}

/**
 * Validate manifests, repo-local hashes, explicit descriptor exports, and 20 static
 * candidate exports. Candidate modules are parsed as text only and never imported.
 * Verifier-owned files are consumed only as opaque bytes by SHA-256.
 */
export function validateOfficialFrozenInventory(repositoryRoot: string): OfficialFrozenInventoryResult {
  validateCardinality();
  const fixtureResults: OfficialInventoryFixtureResult[] = [];
  const slots: OfficialFrozenInventorySlot[] = [];
  const digestFixtures: Array<Record<string, unknown>> = [];
  let manifestCount = 0;
  let frozenFileCount = 0;

  for (const fixture of OFFICIAL_FROZEN_INVENTORY_BINDINGS) {
    const files = new Map<string, string>();
    const manifests: Array<Readonly<{path: string; sha256: string}>> = [];
    for (const manifestPath of fixture.manifestPaths) {
      const absoluteManifest = resolveFrozenFile(repositoryRoot, manifestPath);
      const manifestBytes = readFileSync(absoluteManifest);
      manifests.push(Object.freeze({ path: manifestPath, sha256: sha256(manifestBytes) }));
      const adapted = adaptFrozenManifestText(manifestBytes.toString("utf8"), fixture.fixtureId, manifestPath);
      for (const file of adapted.files) mergeManifestFile(files, file);
      manifestCount += 1;
    }

    for (const [relativePath, expectedSha256] of files) {
      const bytes = readFileSync(resolveFrozenFile(repositoryRoot, relativePath));
      if (sha256(bytes) !== expectedSha256) throw new Error(`Immutable frozen-byte mismatch: ${relativePath}.`);
    }

    const descriptorSource = readFileSync(resolveFrozenFile(repositoryRoot, fixture.descriptor.modulePath), "utf8");
    assertStaticExportDeclaration(descriptorSource, fixture.descriptor.exportName, fixture.descriptor.modulePath);

    for (const candidate of fixture.candidates) {
      const manifestDigest = files.get(candidate.modulePath);
      if (!manifestDigest) throw new Error(`${fixture.fixtureId} candidate ${candidate.candidateId} is absent from its frozen manifests.`);
      const candidatePath = resolveFrozenFile(repositoryRoot, candidate.modulePath);
      const candidateBytes = readFileSync(candidatePath);
      if (sha256(candidateBytes) !== manifestDigest) throw new Error(`Frozen candidate digest mismatch: ${candidate.modulePath}.`);
      assertStaticExportDeclaration(candidateBytes.toString("utf8"), candidate.exportName, candidate.modulePath);
      slots.push(Object.freeze({
        fixtureId: fixture.fixtureId,
        candidateId: candidate.candidateId,
        modulePath: candidate.modulePath,
        exportName: candidate.exportName,
        candidateSha256: manifestDigest,
        descriptor: Object.freeze({ ...fixture.descriptor }),
        membership: fixture.membership,
        behaviorClass: fixture.behaviorClass,
      }));
    }

    frozenFileCount += files.size;
    fixtureResults.push(Object.freeze({
      fixtureId: fixture.fixtureId,
      membership: fixture.membership,
      behaviorClass: fixture.behaviorClass,
      candidateCount: 2,
      manifestCount: fixture.manifestPaths.length,
      verifiedFrozenFileCount: files.size,
    }));
    digestFixtures.push({
      fixtureId: fixture.fixtureId,
      membership: fixture.membership,
      behaviorClass: fixture.behaviorClass,
      descriptor: fixture.descriptor,
      manifests,
      frozenFiles: [...files].sort(([left], [right]) => left.localeCompare(right)).map(([filePath, fileSha256]) => ({
        path: filePath,
        sha256: fileSha256,
      })),
      candidates: fixture.candidates,
    });
  }

  validateSlots(slots);

  return Object.freeze({
    schemaVersion: OFFICIAL_INVENTORY_SCHEMA_VERSION,
    fixtureCount: 10,
    candidateCount: 20,
    developmentFixtureCount: 4,
    heldOutFixtureCount: 6,
    executionSlotCount: 20,
    verifiedManifestCount: manifestCount,
    verifiedFrozenFileCount: frozenFileCount,
    inventorySha256: sha256(canonicalJson(digestFixtures)),
    fixtures: Object.freeze(fixtureResults),
    slots: Object.freeze(slots),
    candidateImportsPerformed: false,
    candidateExecutionPerformed: false,
    verifierContentParsed: false,
    officialOrScoredRun: false,
    unblindingPerformed: false,
  });
}
