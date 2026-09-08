/** Resolves the one authoritative submission-exclusion contract. */

import { readFileSync } from "node:fs";
import path from "node:path";

type CleanRoomConfig = Readonly<{submission_excluded_paths?: readonly unknown[]}>;

function validateRule(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError("Every submission exclusion must be a non-empty string.");
  }
  const normalized = value.replaceAll("\\", "/");
  if (path.posix.isAbsolute(normalized) || normalized.split("/").includes("..")) {
    throw new TypeError(`Unsafe submission exclusion: ${value}`);
  }
  return normalized;
}

/** Load the complete, deduplicated exclusion contract from cleanroom.json. */
export function loadSubmissionExclusions(repositoryRoot: string): readonly string[] {
  const config = JSON.parse(
    readFileSync(path.join(repositoryRoot, "config/cleanroom.json"), "utf8"),
  ) as CleanRoomConfig;
  const exclusions = (config.submission_excluded_paths ?? []).map(validateRule);
  if (exclusions.length === 0 || new Set(exclusions).size !== exclusions.length) {
    throw new Error("Submission exclusions are empty or duplicated.");
  }
  return Object.freeze([...exclusions].sort());
}

/** Match exact files and every descendant of a configured directory rule. */
export function isSubmissionExcluded(
  relativePath: string,
  exclusions: readonly string[],
): boolean {
  const normalized = relativePath.replaceAll("\\", "/");
  return exclusions.some((rule) => rule.endsWith("/")
    ? normalized.startsWith(rule)
    : normalized === rule);
}

/** Partition repository paths using the same contract consumed by all packagers. */
export function partitionSubmissionPaths(
  paths: readonly string[],
  exclusions: readonly string[],
): Readonly<{included: readonly string[]; excluded: readonly string[]}> {
  const sorted = [...paths].sort();
  return Object.freeze({
    included: Object.freeze(sorted.filter((file) => !isSubmissionExcluded(file, exclusions))),
    excluded: Object.freeze(sorted.filter((file) => isSubmissionExcluded(file, exclusions))),
  });
}
