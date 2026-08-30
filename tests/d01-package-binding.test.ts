/** Verifies recursive package binding and rejection of path or registered-byte drift. */
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { validateBoundPackage } from "../src/d01/candidate.ts";
import { sha256 } from "../src/d01/canonical-json.ts";
import { D01_FIXTURE, type PackageBinding } from "../src/d01/fixture.ts";

const repositoryRoot = process.cwd();

function createPackage(): Readonly<{
  temporaryRoot: string; binding: PackageBinding; sourcePath: string; nestedSourcePath: string; manifestPath: string;
}> {
  const temporaryRoot = mkdtempSync(path.join(repositoryRoot, ".d01-package-test-"));
  const relativeTemporaryRoot = path.relative(repositoryRoot, temporaryRoot).split(path.sep).join("/");
  const packageRoot = `${relativeTemporaryRoot}/package`;
  const sourcePath = `${packageRoot}/source.ts`;
  const nestedSourcePath = `${packageRoot}/nested/contracts/source.ts`;
  const manifestPath = `${relativeTemporaryRoot}/manifest.json`;
  mkdirSync(path.join(temporaryRoot, "package"));
  mkdirSync(path.join(temporaryRoot, "package", "nested", "contracts"), { recursive: true });
  writeFileSync(path.join(repositoryRoot, sourcePath), "export const synthetic = true;\n");
  writeFileSync(path.join(repositoryRoot, nestedSourcePath), "export const nested = true;\n");
  const sourceSha256 = sha256("export const synthetic = true;\n");
  const nestedSourceSha256 = sha256("export const nested = true;\n");
  const sourceFiles = [sourcePath, nestedSourcePath].sort((left, right) => left.localeCompare(right, "en"));
  const sourceDigests = new Map([[sourcePath, sourceSha256], [nestedSourcePath, nestedSourceSha256]]);
  const packageSha256 = sha256(sourceFiles.map((entryPath) => (
    `${entryPath}\0${sourceDigests.get(entryPath)}\n`
  )).join(""));
  const manifest = `${JSON.stringify({
    schema_version: "1.0",
    fixture_id: D01_FIXTURE.fixtureId,
    package_id: "TEST-arm-visible",
    package_kind: "arm_visible",
    immutable: true,
    hash_algorithm: "SHA-256",
    source_files: sourceFiles.map((entryPath) => ({ path: entryPath, sha256: sourceDigests.get(entryPath) })),
    package_sha256: packageSha256,
  }, null, 2)}\n`;
  writeFileSync(path.join(repositoryRoot, manifestPath), manifest);
  return {
    temporaryRoot,
    sourcePath,
    nestedSourcePath,
    manifestPath,
    binding: {
      rootPath: packageRoot,
      manifestPath,
      packageId: "TEST-arm-visible",
      packageKind: "arm_visible",
      sourcePaths: sourceFiles,
      expectedManifestSha256: sha256(manifest),
      expectedPackageSha256: packageSha256,
    },
  };
}

test("bound package validation is directory-complete and fails closed on tamper", (context) => {
  const fixture = createPackage();
  context.after(() => rmSync(fixture.temporaryRoot, { recursive: true, force: true }));
  assert.equal(validateBoundPackage(repositoryRoot, fixture.binding), fixture.binding.expectedManifestSha256);

  writeFileSync(path.join(repositoryRoot, fixture.nestedSourcePath), "export const nested = false;\n");
  assert.throws(() => validateBoundPackage(repositoryRoot, fixture.binding), /source digest mismatch/u);
  writeFileSync(path.join(repositoryRoot, fixture.nestedSourcePath), "export const nested = true;\n");

  writeFileSync(path.join(fixture.temporaryRoot, "package", "unlisted.ts"), "export {};\n");
  assert.throws(() => validateBoundPackage(repositoryRoot, fixture.binding), /directory is not completely represented/u);
  rmSync(path.join(fixture.temporaryRoot, "package", "unlisted.ts"));

  assert.throws(() => validateBoundPackage(repositoryRoot, {
    ...fixture.binding,
    sourcePaths: [fixture.sourcePath, fixture.sourcePath],
  }), /duplicated or escapes/u);
  assert.throws(() => validateBoundPackage(repositoryRoot, {
    ...fixture.binding,
    sourcePaths: [`${fixture.binding.rootPath}/../manifest.json`],
  }), /duplicated or escapes/u);

  const linkPath = path.join(fixture.temporaryRoot, "package", "linked.ts");
  symlinkSync(path.join(repositoryRoot, fixture.sourcePath), linkPath);
  assert.throws(() => validateBoundPackage(repositoryRoot, fixture.binding), /symbolic links/u);
  rmSync(linkPath);

  writeFileSync(path.join(repositoryRoot, fixture.manifestPath), "{}\n");
  assert.throws(() => validateBoundPackage(repositoryRoot, fixture.binding), /manifest digest mismatch/u);
});
