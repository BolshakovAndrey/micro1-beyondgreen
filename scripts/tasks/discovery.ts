import { readdirSync } from "node:fs";
import path from "node:path";

/**
 * Ordinary repository tests may come only from these public, repository-relative
 * roots. The verifier-only tree is deliberately absent because oracle self-checks
 * belong to fixture verification, not the everyday test suite.
 */
export const allowedTestRoots = ["tests", "evaluation/arm-visible"] as const;

function normalize(relativePath: string): string {
  return relativePath.split(path.sep).join("/");
}

function compareText(left: string, right: string): number {
  return left === right ? 0 : left < right ? -1 : 1;
}

function isBoundedTestPath(relativePath: string): boolean {
  return allowedTestRoots.some(
    (root) => relativePath === root || relativePath.startsWith(`${root}/`),
  );
}

/** Validate that discovery returned a non-empty, bounded, deterministic test list. */
export function assertDiscoveredTestFiles(files: readonly string[]): readonly string[] {
  if (files.length === 0) throw new Error("Bounded test discovery returned no test files.");
  for (const file of files) {
    if (!file.endsWith(".test.ts") || !isBoundedTestPath(file)) {
      throw new Error(`Unexpected test path outside allowed roots: ${file}`);
    }
  }
  const sorted = [...files].sort(compareText);
  if (new Set(sorted).size !== sorted.length) throw new Error("Bounded test discovery returned duplicates.");
  return sorted;
}

function walkTests(repositoryRoot: string, relativeDirectory: string, output: string[]): void {
  const absoluteDirectory = path.resolve(repositoryRoot, relativeDirectory);
  const entries = readdirSync(absoluteDirectory, { withFileTypes: true })
    .sort((left, right) => compareText(left.name, right.name));
  for (const entry of entries) {
    const relativePath = normalize(path.join(relativeDirectory, entry.name));
    // Symlinks could escape the approved roots even when their visible path looks safe.
    if (entry.isSymbolicLink()) throw new Error(`Symlink is forbidden during test discovery: ${relativePath}`);
    if (entry.isDirectory()) {
      walkTests(repositoryRoot, relativePath, output);
      continue;
    }
    if (entry.isFile() && relativePath.endsWith(".test.ts")) output.push(relativePath);
  }
}

/** Discover all ordinary tests under the fixed public roots without shell globbing. */
export function discoverAllTests(): readonly string[] {
  const repositoryRoot = process.cwd();
  const files: string[] = [];
  for (const root of allowedTestRoots) walkTests(repositoryRoot, root, files);
  return assertDiscoveredTestFiles(files);
}
