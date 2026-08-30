/**
 * Ingests only descriptor-allowlisted candidates and packages, verifies every frozen
 * digest, and detects candidate mutation across the verification workflow.
 */
import { lstatSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import path from "node:path";

import { sha256 } from "./canonical-json.ts";
import { candidateDescriptor, D01_FIXTURE, type PackageBinding } from "./fixture.ts";
import {
  CandidateIdSchema,
  ImmutableCandidateRefSchema,
  type CandidateId,
  type ImmutableCandidateRef,
} from "./schemas.ts";

function resolveRepositoryFile(repositoryRoot: string, relativePath: string): string {
  if (path.isAbsolute(relativePath) || relativePath.includes("\0")) {
    throw new Error("Candidate path must be a repository-relative path.");
  }
  const root = realpathSync(repositoryRoot);
  const resolved = path.resolve(root, relativePath);
  if (!resolved.startsWith(`${root}${path.sep}`)) throw new Error("Candidate path escapes repository root.");
  if (lstatSync(resolved).isSymbolicLink() || realpathSync(resolved) !== resolved) {
    throw new Error("Candidate path must not traverse symbolic links.");
  }
  return resolved;
}

function enumeratePackageFiles(repositoryRoot: string, binding: PackageBinding): readonly string[] {
  const root = resolveRepositoryFile(repositoryRoot, binding.rootPath);
  if (!lstatSync(root).isDirectory()) throw new Error("Bound package root must be a directory.");
  const files: string[] = [];
  const visit = (directory: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((left, right) => (
      left.name.localeCompare(right.name, "en")
    ))) {
      const absolute = path.join(directory, entry.name);
      const stat = lstatSync(absolute);
      if (stat.isSymbolicLink()) throw new Error("Bound package must not contain symbolic links.");
      if (stat.isDirectory()) {
        visit(absolute);
        continue;
      }
      if (!stat.isFile() || realpathSync(absolute) !== absolute) {
        throw new Error("Bound package contains an unsupported filesystem entry.");
      }
      files.push(path.relative(realpathSync(repositoryRoot), absolute).split(path.sep).join("/"));
    }
  };
  visit(root);
  return Object.freeze(files.sort((left, right) => left.localeCompare(right, "en")));
}

/** Validate a complete package against code-owned manifest and package digests. */
export function validateBoundPackage(repositoryRoot: string, binding: PackageBinding): string {
  const declaredPaths = binding.sourcePaths.map((sourcePath) => sourcePath.split(path.sep).join("/"));
  const normalizedRootPath = binding.rootPath.split(path.sep).join("/");
  if (new Set(declaredPaths).size !== declaredPaths.length
    || declaredPaths.some((sourcePath) => (
      path.isAbsolute(sourcePath)
      || path.posix.relative(normalizedRootPath, sourcePath).startsWith("..")
      || path.posix.relative(normalizedRootPath, sourcePath) === ""
    ))) {
    throw new Error("Code-owned package source list is duplicated or escapes its authorized root.");
  }
  const enumeratedPaths = enumeratePackageFiles(repositoryRoot, binding);
  const sortedDeclared = [...declaredPaths].sort((left, right) => left.localeCompare(right, "en"));
  if (enumeratedPaths.length !== sortedDeclared.length
    || enumeratedPaths.some((sourcePath, index) => sourcePath !== sortedDeclared[index])) {
    throw new Error("Code-owned package directory is not completely represented by its source list.");
  }
  const manifestBytes = readFileSync(resolveRepositoryFile(repositoryRoot, binding.manifestPath));
  if (sha256(manifestBytes) !== binding.expectedManifestSha256) {
    throw new Error("Code-owned package manifest digest mismatch.");
  }
  const manifest = JSON.parse(manifestBytes.toString("utf8")) as {
    schema_version?: string; fixture_id?: string; package_id?: string; package_kind?: string;
    immutable?: boolean; hash_algorithm?: string;
    source_files?: Array<{ path?: string; sha256?: string }>;
    package_sha256?: string;
  };
  if (manifest.schema_version !== "1.0" || manifest.fixture_id !== D01_FIXTURE.fixtureId
    || manifest.package_id !== binding.packageId || manifest.package_kind !== binding.packageKind
    || manifest.immutable !== true || manifest.hash_algorithm !== "SHA-256"
    || manifest.source_files?.length !== binding.sourcePaths.length) {
    throw new Error("Code-owned package manifest metadata mismatch.");
  }
  const packageInput = declaredPaths.map((expectedPath, index) => {
    const entry = manifest.source_files?.[index];
    if (entry?.path !== expectedPath || !entry.sha256
      || sha256(readFileSync(resolveRepositoryFile(repositoryRoot, expectedPath))) !== entry.sha256) {
      throw new Error("Code-owned package source digest mismatch.");
    }
    return `${expectedPath}\0${entry.sha256}\n`;
  }).join("");
  if (sha256(packageInput) !== binding.expectedPackageSha256
    || manifest.package_sha256 !== binding.expectedPackageSha256) {
    throw new Error("Code-owned package digest mismatch.");
  }
  return binding.expectedManifestSha256;
}

/** Ingest one allowlisted D01 candidate and verify it against its frozen manifest. */
export function ingestCandidate(
  repositoryRoot: string,
  candidateIdInput: string,
  requestedPath?: string,
): ImmutableCandidateRef {
  const candidateId = CandidateIdSchema.parse(candidateIdInput);
  const descriptor = candidateDescriptor(candidateId);
  const relativePath = requestedPath ?? descriptor.sourcePath;
  if (relativePath !== descriptor.sourcePath) throw new Error("Candidate path does not match the frozen candidate ID.");
  const absolutePath = resolveRepositoryFile(repositoryRoot, relativePath);
  const manifestPath = descriptor.manifestPath;
  const manifest = JSON.parse(readFileSync(resolveRepositoryFile(repositoryRoot, manifestPath), "utf8")) as {
    fixture_id?: string; package_id?: string; package_kind?: string; immutable?: boolean;
    hash_algorithm?: string; source_files?: Array<{path?: string; sha256?: string}>; package_sha256?: string;
  };
  if (manifest.fixture_id !== D01_FIXTURE.fixtureId || manifest.package_id !== descriptor.packageId
    || manifest.package_kind !== "candidate" || manifest.immutable !== true
    || manifest.hash_algorithm !== "SHA-256" || manifest.source_files?.length !== 1) {
    throw new Error("Frozen candidate manifest metadata is invalid.");
  }
  const entry = manifest.source_files?.find((file) => file.path === relativePath);
  if (!entry?.sha256) throw new Error("Frozen candidate manifest is missing the requested source entry.");
  const expectedPackageSha256 = sha256(`${relativePath}\0${entry.sha256}\n`);
  if (entry.sha256 !== descriptor.expectedSourceSha256 || manifest.package_sha256 !== expectedPackageSha256) {
    throw new Error("Frozen candidate manifest digest is invalid.");
  }
  const actual = sha256(readFileSync(absolutePath));
  if (actual !== entry.sha256) throw new Error("Candidate hash does not match its frozen manifest.");
  return ImmutableCandidateRefSchema.parse({
    fixtureId: D01_FIXTURE.fixtureId,
    candidateId,
    relativePath,
    manifestPath,
    expectedSha256: entry.sha256,
    sha256Before: actual,
  });
}

/** Re-hash a candidate after execution and fail if any byte changed. */
export function assertCandidateUnchanged(repositoryRoot: string, candidate: ImmutableCandidateRef): string {
  const actual = sha256(readFileSync(resolveRepositoryFile(repositoryRoot, candidate.relativePath)));
  if (actual !== candidate.sha256Before || actual !== candidate.expectedSha256) {
    throw new Error("Immutable candidate changed during verification.");
  }
  return actual;
}
