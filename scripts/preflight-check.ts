#!/usr/bin/env node

/** Validate clean-room readiness using only the Node.js standard library. */

import { spawnSync } from "node:child_process";
import {
  lstatSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
} from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const CONFIG_PATH = "config/cleanroom.json";
const REDACTED_PATH = "<redacted-path>";

export type Severity = "error" | "warning";
export type FindingSpan = {
  start: number;
  end: number;
  patternId: string;
};

export type Finding = {
  severity: Severity;
  category: string;
  path: string;
  line: number | null;
  start: number | null;
  end: number | null;
  patternId: string | null;
  spans: FindingSpan[];
  message: string;
};

export type DenylistTerm = {
  id: number;
  folded: string;
};

export function normalizeRelative(value) {
  const normalized = value.replaceAll("\\", "/");
  return normalized.startsWith("./") ? normalized.slice(2) : normalized;
}

export function matchesPrefix(relativePath, prefix) {
  const normalizedPath = normalizeRelative(relativePath);
  const normalizedPrefix = normalizeRelative(prefix).replace(/\/$/, "");
  return (
    normalizedPath === normalizedPrefix ||
    normalizedPath.startsWith(`${normalizedPrefix}/`)
  );
}

export function isIgnored(relativePath, prefixes) {
  return prefixes.some((prefix) => matchesPrefix(relativePath, prefix));
}

export function isWithinRoot(root, target) {
  const relative = path.relative(root, target);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative))
  );
}

export function loadConfig(root) {
  const configPath = path.join(root, CONFIG_PATH);
  try {
    return JSON.parse(readFileSync(configPath, "utf8"));
  }
  catch (error) {
    if (error?.code === "ENOENT") {
      throw new Error(`Missing clean-room configuration: ${CONFIG_PATH}`);
    }
    throw new Error(`Invalid clean-room configuration: ${error.message}`);
  }
}

export function loadPrivateDenylist(denylistPath) {
  if (!denylistPath) {
    return [];
  }

  let text;
  try {
    text = readFileSync(denylistPath, "utf8");
  }
  catch {
    throw new Error("Private denylist path does not exist or is unreadable.");
  }

  const terms = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));

  if (!terms.length) {
    throw new Error("Private denylist contains no usable entries.");
  }

  return terms.map((term, index) => {
    if ([ ...term ].length < 4) {
      throw new Error("Private denylist entries must contain at least 4 characters.");
    }
    return {
      id: index + 1,
      folded: term.normalize("NFKC").toLocaleLowerCase("en-US"),
    };
  });
}

function finding(
  severity: Severity,
  category: string,
  findingPath: string,
  line: number | null,
  message: string,
  spans: FindingSpan[] = [],
): Finding {
  const first = spans[0] ?? null;
  return {
    severity,
    category,
    path: findingPath,
    line,
    start: first?.start ?? null,
    end: first?.end ?? null,
    patternId: first?.patternId ?? null,
    spans,
    message,
  };
}

function redactPath() {
  return REDACTED_PATH;
}

function walkRepository(root, ignoredPrefixes) {
  const entries = [];

  function walk(current) {
    for (const dirent of readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, dirent.name);
      const relative = normalizeRelative(path.relative(root, absolute));

      if (dirent.isSymbolicLink()) {
        let target;
        try {
          target = realpathSync(absolute);
        }
        catch {
          entries.push({ kind: "broken-symlink", absolute, relative });
          continue;
        }
        entries.push({
          kind: isWithinRoot(root, target) ? "internal-symlink" : "external-symlink",
          absolute,
          relative,
          target,
        });
        continue;
      }

      if (isIgnored(relative, ignoredPrefixes)) {
        continue;
      }
      if (dirent.isDirectory()) {
        walk(absolute);
      }
      else if (dirent.isFile()) {
        entries.push({ kind: "file", absolute, relative });
      }
    }
  }

  walk(root);
  return entries;
}

function looksBinary(buffer, extension, configuredBinaryExtensions) {
  if (configuredBinaryExtensions.has(extension.toLowerCase())) {
    return true;
  }
  return buffer.subarray(0, 8192).includes(0);
}

function absolutePathPatterns() {
  const slash = "/";
  const pathTail = `[^\\s\`"'()<>\\[\\]{}]+`;
  return [
    { id: "absolute-user-path-macos-users-v1", regex: new RegExp(`${slash}${"Users"}${slash}${pathTail}`) },
    { id: "absolute-user-path-linux-home-v1", regex: new RegExp(`${slash}${"home"}${slash}${pathTail}`) },
    { id: "absolute-user-path-windows-users-v1", regex: new RegExp(`[A-Za-z]:[\\\\/]${"Users"}[\\\\/]${pathTail}`, "i") },
    { id: "absolute-user-path-wsl-users-v1", regex: new RegExp(`${slash}mnt${slash}[a-z]${slash}${"Users"}${slash}${pathTail}`, "i") },
    { id: "absolute-user-path-macos-volumes-v1", regex: new RegExp(`${slash}${"Volumes"}${slash}${pathTail}`) },
    { id: "absolute-user-path-userprofile-v1", regex: new RegExp(`%${"USERPROFILE"}%[\\\\/]?${pathTail}`, "i") },
    { id: "absolute-user-path-tilde-v1", regex: new RegExp(`(?:^|(?<=\\s))~[\\\\/]${pathTail}`) },
    { id: "absolute-user-path-macos-private-var-v1", regex: new RegExp(`${slash}${"private"}${slash}${"var"}${slash}${"folders"}${slash}${pathTail}`) },
  ];
}

function absolutePathMatches(line, patterns): FindingSpan[] {
  const candidates = patterns.flatMap(({ id, regex }, patternOrder) => {
    const globalRegex = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : `${regex.flags}g`);
    return [ ...line.matchAll(globalRegex) ].map((match) => ({
      start: match.index,
      end: match.index + match[0].length,
      patternId: id,
      patternOrder,
    }));
  });
  candidates.sort((left, right) =>
    left.start - right.start ||
    left.end - right.end ||
    left.patternOrder - right.patternOrder ||
    left.patternId.localeCompare(right.patternId)
  );

  const spans: FindingSpan[] = [];
  const seen = new Set<string>();
  for (const candidate of candidates) {
    const key = `${candidate.start}:${candidate.end}:${candidate.patternId}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    if (spans.some((span) => candidate.start < span.end && span.start < candidate.end)) {
      continue;
    }
    spans.push({
      start: candidate.start,
      end: candidate.end,
      patternId: candidate.patternId,
    });
  }
  return spans;
}

function secretPatterns() {
  return [
    /\b(api[_-]?key|access[_-]?token|password|passwd|client[_-]?secret)\b\s*[:=]\s*["']?[A-Za-z0-9_./+=-]{12,}/i,
    new RegExp(`${"Authorization"}\\s*:\\s*${"Bearer"}\\s+[A-Za-z0-9._~+/-]{12,}`, "i"),
    /\b(gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9_-]{20,})\b/,
  ];
}

function privateKeyMarker() {
  return "PRIVATE" + " KEY-----";
}

export function scanTree(root, config, denylistTerms = [], scopedEntries = null) {
  const findings = [];
  const binaryExtensions = new Set(config.binary_extensions_requiring_human_review ?? []);
  const pathPatterns = absolutePathPatterns();
  const credentials = secretPatterns();

  for (const entry of scopedEntries ?? walkRepository(root, config.scan_ignored_paths ?? [])) {
    if (entry.kind === "external-symlink" || entry.kind === "broken-symlink") {
      findings.push(
        finding(
          "error",
          entry.kind,
          entry.relative,
          null,
          "Symlink is broken or resolves outside the clean repository root.",
        ),
      );
      continue;
    }
    if (entry.kind === "internal-symlink") {
      findings.push(
        finding(
          "warning",
          "internal-symlink",
          entry.relative,
          null,
          "Internal symlink requires packaging review and is not followed by the scanner.",
        ),
      );
      continue;
    }

    const foldedPath = entry.relative.normalize("NFKC").toLocaleLowerCase("en-US");
    const pathTerm = denylistTerms.find((term) => foldedPath.includes(term.folded));
    const reportPath = pathTerm ? redactPath(entry.relative) : entry.relative;
    if (pathTerm) {
      findings.push(
        finding(
          "error",
          "private-denylist-path",
          reportPath,
          null,
          `A private denylist term #${pathTerm.id} appears in a repository path; location suppressed.`,
        ),
      );
    }

    const buffer = readFileSync(entry.absolute);
    const extension = path.extname(entry.relative);
    if (looksBinary(buffer, extension, binaryExtensions)) {
      findings.push(
        finding(
          "warning",
          "binary-human-review",
          reportPath,
          null,
          "Binary artifact is not content-scanned and requires explicit human review before submission.",
        ),
      );
      continue;
    }

    let text;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    }
    catch {
      findings.push(
        finding("error", "encoding", reportPath, null, "Non-binary text is not valid UTF-8."),
      );
      continue;
    }

    for (const [ index, line ] of text.split(/\r?\n/).entries()) {
      const lineNumber = index + 1;
      const pathMatches = absolutePathMatches(line, pathPatterns);
      if (pathMatches.length > 0) {
        findings.push(
          finding(
            "error",
            "absolute-user-path",
            reportPath,
            lineNumber,
            "Machine-specific user path detected; content suppressed.",
            pathMatches,
          ),
        );
      }
      if (credentials.some((pattern) => pattern.test(line)) || line.includes(privateKeyMarker())) {
        findings.push(
          finding(
            "error",
            "possible-secret",
            reportPath,
            lineNumber,
            "Possible credential material detected; content suppressed.",
          ),
        );
      }

      const foldedLine = line.normalize("NFKC").toLocaleLowerCase("en-US");
      for (const term of denylistTerms) {
        if (foldedLine.includes(term.folded)) {
          findings.push(
            finding(
              "error",
              "private-denylist-content",
              reportPath,
              lineNumber,
              `A private denylist term #${term.id} appears in file content; term suppressed.`,
            ),
          );
        }
      }
    }
  }

  return findings;
}

/** Scan exactly one repository-local file without exposing matched content. */
export function scanFile(root, relativePath, config, denylistTerms = []) {
  const normalized = normalizeRelative(relativePath);
  if (!normalized || path.isAbsolute(normalized) || normalized.split("/").includes("..")) {
    throw new Error("Scan target must be a repository-relative file path.");
  }
  const target = path.resolve(root, normalized);
  if (!isWithinRoot(root, target) || !lstatSync(target).isFile()) {
    throw new Error("Scan target must resolve to a repository-local file.");
  }
  return scanTree(root, config, denylistTerms, [
    { kind: "file", absolute: target, relative: normalized },
  ]);
}

export function checkRequiredPaths(root, paths, category, options = {}) {
  const findings = [];
  const placeholders = options.placeholderTokens ?? [];

  for (const relative of paths) {
    const absolute = path.join(root, relative);
    let stats;
    try {
      stats = statSync(absolute);
    }
    catch {
      findings.push(finding("error", category, relative, null, "Required path is missing."));
      continue;
    }

    if (!options.validateContent || !stats.isFile()) {
      continue;
    }
    if (stats.size === 0) {
      findings.push(finding("error", category, relative, null, "Required file is empty."));
      continue;
    }

    const text = readFileSync(absolute, "utf8");
    const token = placeholders.find((placeholder) =>
      new RegExp(`\\b${placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(text)
    );
    if (token) {
      findings.push(
        finding(
          "error",
          category,
          relative,
          null,
          "Required file contains an unresolved placeholder token.",
        ),
      );
    }
  }

  return findings;
}

export function gitOutput(root, args) {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  if (result.error?.code === "ENOENT") {
    return { status: 127, stdout: "" };
  }
  return {
    status: result.status ?? 1,
    stdout: (result.stdout ?? "").trim(),
  };
}

export function checkImplementationGit(root, config) {
  const findings = [];
  const inside = gitOutput(root, [ "rev-parse", "--is-inside-work-tree" ]);
  if (inside.status !== 0 || inside.stdout !== "true") {
    return [
      finding(
        "error",
        "git-boundary",
        ".",
        null,
        "Implementation requires an initialized Git repository.",
      ),
    ];
  }

  const branch = gitOutput(root, [ "symbolic-ref", "--short", "HEAD" ]);
  if (branch.status !== 0 || !branch.stdout) {
    findings.push(finding("error", "git-branch", ".", null, "No named branch exists."));
  }
  else if ((config.forbidden_implementation_branches ?? []).includes(branch.stdout)) {
    findings.push(
      finding(
        "error",
        "git-branch",
        ".",
        null,
        "Implementation must run on a dedicated non-default branch.",
      ),
    );
  }

  const worktree = gitOutput(root, [ "status", "--porcelain" ]);
  if (worktree.stdout) {
    findings.push(
      finding(
        "warning",
        "dirty-worktree",
        ".",
        null,
        "Working tree is not clean; record a checkpoint before implementation.",
      ),
    );
  }
  return findings;
}

export function validateConfigContract(config) {
  const findings = [];
  if (config.current_thread?.submission_eligible !== false) {
    findings.push(
      finding(
        "error",
        "thread-boundary",
        CONFIG_PATH,
        null,
        "Current private control-plane thread must remain submission-ineligible.",
      ),
    );
  }

  const excluded = new Set(config.submission_excluded_paths ?? []);
  for (const required of [ ".private/", "raw-traces/", "tmp/", ".git/" ]) {
    if (!excluded.has(required)) {
      findings.push(
        finding(
          "error",
          "submission-exclusion",
          CONFIG_PATH,
          null,
          `Required exclusion is missing: ${required}`,
        ),
      );
    }
  }
  return findings;
}

export function validatePrivatePath(root, denylistPath) {
  if (!denylistPath) {
    return [];
  }
  const resolved = path.resolve(denylistPath);
  if (isWithinRoot(root, resolved)) {
    return [
      finding(
        "error",
        "private-boundary",
        REDACTED_PATH,
        null,
        "Private denylist must resolve outside the clean repository root.",
      ),
    ];
  }
  return [];
}

export function runChecks(root, phase, denylistPath) {
  const config = loadConfig(root);
  const findings = [ ...validateConfigContract(config) ];
  const warnings = [];

  findings.push(
    ...checkRequiredPaths(
      root,
      config.required_control_plane_paths ?? [],
      "control-plane-path",
    ),
  );

  const denylistRequired =
    phase === "implementation"
      ? config.require_private_denylist_for_implementation
      : config.require_private_denylist_for_control_plane;
  if (denylistRequired && !denylistPath) {
    findings.push(
      finding(
        "error",
        "private-denylist",
        ".",
        null,
        "This phase requires a private external denylist.",
      ),
    );
  }

  findings.push(...validatePrivatePath(root, denylistPath));
  const terms = denylistPath ? loadPrivateDenylist(denylistPath) : [];
  findings.push(...scanTree(root, config, terms));

  if (phase === "control-plane") {
    const inside = gitOutput(root, [ "rev-parse", "--is-inside-work-tree" ]);
    if (inside.status !== 0 || inside.stdout !== "true") {
      warnings.push("Git repository is not initialized; branch transition still requires approval.");
    }
  }
  else {
    findings.push(
      ...checkRequiredPaths(
        root,
        config.required_implementation_paths ?? [],
        "implementation-path",
        {
          validateContent: true,
          placeholderTokens: config.implementation_placeholder_tokens ?? [],
        },
      ),
    );
    findings.push(...checkImplementationGit(root, config));
  }

  return { findings, warnings };
}

export function parseArgs(argv) {
  const args = { root: ".", phase: null, denylist: null };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if ([ "--root", "--phase", "--denylist" ].includes(value)) {
      const next = argv[index + 1];
      if (!next) {
        throw new Error(`Missing value for ${value}.`);
      }
      args[value.slice(2)] = next;
      index += 1;
    }
    else {
      throw new Error(`Unknown argument: ${value}`);
    }
  }
  if (![ "control-plane", "implementation" ].includes(args.phase)) {
    throw new Error("--phase must be control-plane or implementation.");
  }
  return args;
}

export function formatFinding(item) {
  const location = item.line === null ? item.path : `${item.path}:${item.line}`;
  return `${item.severity.toUpperCase()} ${item.category} ${location}: ${item.message}`;
}

export function main(argv = process.argv.slice(2)) {
  let args;
  try {
    args = parseArgs(argv);
    const root = path.resolve(args.root);
    const denylistPath = args.denylist ? path.resolve(args.denylist) : null;
    const { findings, warnings } = runChecks(root, args.phase, denylistPath);

    for (const warning of warnings) {
      console.log(`WARNING: ${warning}`);
    }
    for (const item of findings) {
      console.log(formatFinding(item));
    }

    const errors = findings.filter((item) => item.severity === "error");
    const binaryWarnings = findings.filter((item) => item.category === "binary-human-review");
    if (binaryWarnings.length) {
      console.log(`NOTICE: ${binaryWarnings.length} binary artifact(s) require human review.`);
    }
    if (errors.length) {
      console.log(`BLOCKED: ${errors.length} error(s) must be resolved.`);
      return 1;
    }

    console.log(args.phase === "control-plane" ? "READY_FOR_CLEAN_BRANCH" : "READY_FOR_IMPLEMENTATION");
    return 0;
  }
  catch (error) {
    console.log(`ERROR configuration: ${error.message}`);
    return 2;
  }
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  process.exitCode = main();
}
