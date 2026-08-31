import { createHash } from "node:crypto";
import path from "node:path";

const SHA256_PATTERN = /^[a-f0-9]{64}$/u;

export type FrozenManifestFile = Readonly<{path: string; sha256: string}>;

export type AdaptedFrozenManifest = Readonly<{
  fixtureId: string;
  format: "source_files_json" | "files_json" | "candidate_map_json" | "aggregate_json" | "package_index_json" | "d03_package_yaml";
  files: readonly FrozenManifestFile[];
}>;

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object.`);
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) throw new Error(`${label} must be a non-empty string.`);
  return value;
}

function canonicalPath(value: unknown, label: string): string {
  const candidate = requiredString(value, label);
  const segments = candidate.split("/");
  if (path.posix.isAbsolute(candidate) || /^[A-Za-z]:[\\/]/u.test(candidate)
    || candidate.includes("\\") || candidate.includes("\0")
    || segments.some((segment) => segment === "" || segment === "." || segment === "..")) {
    throw new Error(`${label} must be a canonical repository-relative path.`);
  }
  return candidate;
}

function digest(value: unknown, label: string): string {
  const candidate = requiredString(value, label);
  if (!SHA256_PATTERN.test(candidate)) throw new Error(`${label} must be a lowercase SHA-256 digest.`);
  return candidate;
}

function mapEntries(value: unknown, label: string): FrozenManifestFile[] {
  return Object.entries(record(value, label)).map(([filePath, sha256]) => Object.freeze({
    path: canonicalPath(filePath, `${label} path`),
    sha256: digest(sha256, `${label}.${filePath}`),
  }));
}

function candidateEntries(value: unknown, label: string): FrozenManifestFile[] {
  return Object.entries(record(value, label)).map(([candidateId, candidate]) => {
    const candidateRecord = record(candidate, `${label}.${candidateId}`);
    return Object.freeze({
      path: canonicalPath(candidateRecord.path, `${label}.${candidateId}.path`),
      sha256: digest(candidateRecord.sha256, `${label}.${candidateId}.sha256`),
    });
  });
}

function optionalPathDigest(recordValue: Record<string, unknown>, pathKey: string, digestKey: string, label: string): FrozenManifestFile[] {
  if (recordValue[pathKey] === undefined && recordValue[digestKey] === undefined) return [];
  return [Object.freeze({
    path: canonicalPath(recordValue[pathKey], `${label}.${pathKey}`),
    sha256: digest(recordValue[digestKey], `${label}.${digestKey}`),
  })];
}

function assertBaseJsonManifest(value: Record<string, unknown>, expectedFixtureId: string): void {
  if (value.schema_version !== "1.0") throw new Error("Frozen manifest schema_version must be 1.0.");
  if (value.fixture_id !== expectedFixtureId) throw new Error(`Manifest fixture_id does not match ${expectedFixtureId}.`);
}

function freezeAdapted(fixtureId: string, format: AdaptedFrozenManifest["format"], files: FrozenManifestFile[]): AdaptedFrozenManifest {
  if (files.length === 0) throw new Error(`Frozen ${fixtureId} manifest has no file bindings.`);
  const seen = new Map<string, string>();
  for (const file of files) {
    const previous = seen.get(file.path);
    if (previous !== undefined && previous !== file.sha256) throw new Error(`Conflicting frozen digests for ${file.path}.`);
    seen.set(file.path, file.sha256);
  }
  return Object.freeze({ fixtureId, format, files: Object.freeze([...files]) });
}

/** Adapt one existing JSON manifest shape without opening any referenced source. */
export function adaptFrozenJsonManifest(text: string, expectedFixtureId: string, manifestPath: string): AdaptedFrozenManifest {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  }
  catch (error) {
    throw new Error(`Invalid frozen JSON manifest ${manifestPath}.`, { cause: error });
  }
  const value = record(parsed, manifestPath);
  assertBaseJsonManifest(value, expectedFixtureId);

  if (Array.isArray(value.source_files)) {
    if (value.immutable !== true || value.hash_algorithm !== "SHA-256") {
      throw new Error(`${manifestPath} source_files manifest must be immutable SHA-256.`);
    }
    const files = value.source_files.map((entry, index) => {
      const source = record(entry, `${manifestPath}.source_files[${index}]`);
      return Object.freeze({
        path: canonicalPath(source.path, `${manifestPath}.source_files[${index}].path`),
        sha256: digest(source.sha256, `${manifestPath}.source_files[${index}].sha256`),
      });
    });
    if (value.package_sha256 !== undefined) {
      const expected = digest(value.package_sha256, `${manifestPath}.package_sha256`);
      const actual = createHash("sha256").update(files.map((file) => `${file.path}\0${file.sha256}\n`).join("")).digest("hex");
      if (actual !== expected) throw new Error(`${manifestPath} package_sha256 mismatch.`);
    }
    return freezeAdapted(expectedFixtureId, "source_files_json", files);
  }

  if (value.arm_visible !== undefined && value.verifier_only !== undefined && value.candidates !== undefined) {
    const provenance = value.provenance_binding === undefined ? [] : (() => {
      const binding = record(value.provenance_binding, `${manifestPath}.provenance_binding`);
      return [
        ...optionalPathDigest(binding, "behavior_path", "behavior_sha256", `${manifestPath}.provenance_binding`),
        ...optionalPathDigest(binding, "freeze_path", "freeze_sha256", `${manifestPath}.provenance_binding`),
        ...optionalPathDigest(binding, "provenance_path", "provenance_sha256", `${manifestPath}.provenance_binding`),
      ];
    })();
    return freezeAdapted(expectedFixtureId, "aggregate_json", [
      ...provenance,
      ...mapEntries(value.arm_visible, `${manifestPath}.arm_visible`),
      ...candidateEntries(value.candidates, `${manifestPath}.candidates`),
      ...mapEntries(value.verifier_only, `${manifestPath}.verifier_only`),
    ]);
  }

  if (value.packages !== undefined) {
    if (value.immutable !== true || value.hash_algorithm !== "SHA-256") {
      throw new Error(`${manifestPath} package index must be immutable SHA-256.`);
    }
    const directory = path.posix.dirname(manifestPath);
    const files = Object.entries(record(value.packages, `${manifestPath}.packages`)).map(([name, sha256]) => Object.freeze({
      path: canonicalPath(path.posix.join(directory, canonicalPath(name, `${manifestPath}.packages key`)), `${manifestPath}.packages path`),
      sha256: digest(sha256, `${manifestPath}.packages.${name}`),
    }));
    return freezeAdapted(expectedFixtureId, "package_index_json", files);
  }

  if (value.files !== undefined) {
    if (value.hash_algorithm !== undefined && value.hash_algorithm !== "SHA-256") {
      throw new Error(`${manifestPath} files manifest must use SHA-256.`);
    }
    if (value.immutable !== undefined && value.immutable !== true) throw new Error(`${manifestPath} must be immutable.`);
    return freezeAdapted(expectedFixtureId, "files_json", mapEntries(value.files, `${manifestPath}.files`));
  }

  if (value.candidates !== undefined) {
    return freezeAdapted(expectedFixtureId, "candidate_map_json", candidateEntries(value.candidates, `${manifestPath}.candidates`));
  }

  throw new Error(`Unsupported frozen manifest format: ${manifestPath}.`);
}

/** Adapt the frozen D03 package YAML with a deliberately narrow, fail-closed grammar. */
export function adaptD03PackageManifest(text: string, expectedFixtureId: string, manifestPath: string): AdaptedFrozenManifest {
  if (!/^schema_version: "1\.0"$/mu.test(text) || !new RegExp(`^fixture_id: "${expectedFixtureId}"$`, "mu").test(text)
    || !/^\s*algorithm: "sha256"$/mu.test(text)) {
    throw new Error(`${manifestPath} is not the frozen D03 package-manifest format.`);
  }
  const matches = [...text.matchAll(/^\s+-?\s*path: "([^"]+)"\n\s*sha256: "([a-f0-9]{64})"$/gmu)];
  if (matches.length !== 11) throw new Error(`${manifestPath} must bind exactly eleven frozen files.`);
  const files = matches.map((match, index) => Object.freeze({
    path: canonicalPath(match[1], `${manifestPath}.path[${index}]`),
    sha256: digest(match[2], `${manifestPath}.sha256[${index}]`),
  }));
  return freezeAdapted(expectedFixtureId, "d03_package_yaml", files);
}

/** Dispatch one frozen manifest through its explicit repository-local format adapter. */
export function adaptFrozenManifestText(text: string, expectedFixtureId: string, manifestPath: string): AdaptedFrozenManifest {
  if (manifestPath.endsWith(".json")) return adaptFrozenJsonManifest(text, expectedFixtureId, manifestPath);
  if (manifestPath === "evaluation/manifests/BG-D03/package-manifest.yaml") {
    return adaptD03PackageManifest(text, expectedFixtureId, manifestPath);
  }
  throw new Error(`No frozen manifest adapter is registered for ${manifestPath}.`);
}
