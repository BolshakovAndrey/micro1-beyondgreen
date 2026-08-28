import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  checkRequiredPaths,
  isIgnored,
  loadConfig,
  scanTree,
  validatePrivatePath,
} from "../scripts/preflight-check.ts";

const REPOSITORY_ROOT = path.resolve(import.meta.dirname, "..");

function temporaryRoot() {
  return mkdtempSync(path.join(tmpdir(), "micro1-preflight-"));
}

function minimalConfig(overrides = {}) {
  return {
    scan_ignored_paths: [ ".private/", "tmp/" ],
    binary_extensions_requiring_human_review: [],
    ...overrides,
  };
}

test("detects macOS/Linux machine-specific user paths", () => {
  const root = temporaryRoot();
  const privatePath = "/" + "Users" + "/example/private/file.ts";
  writeFileSync(path.join(root, "trace.md"), privatePath);

  const findings = scanTree(root, minimalConfig());

  assert.deepEqual(findings.map((item) => item.category), [ "absolute-user-path" ]);
});

test("detects Windows machine-specific user paths with either separator", () => {
  const root = temporaryRoot();
  const separator = String.fromCharCode(92);
  const privatePaths = [
    `C:${separator}Users${separator}example${separator}private.ts`,
    "C:/" + "Users/example/private.ts",
  ];
  writeFileSync(path.join(root, "trace.md"), privatePaths.join("\n"));

  const findings = scanTree(root, minimalConfig());

  assert.equal(findings.filter((item) => item.category === "absolute-user-path").length, 2);
});

test("does not repeat a private content term in findings", () => {
  const root = temporaryRoot();
  const privateTerm = "internal-example-name";
  writeFileSync(path.join(root, "trace.md"), privateTerm);

  const findings = scanTree(root, minimalConfig(), [ { id: 1, folded: privateTerm } ]);
  const serialized = JSON.stringify(findings);

  assert.equal(findings[0].category, "private-denylist-content");
  assert.doesNotMatch(serialized, new RegExp(privateTerm, "i"));
});

test("does not disclose a repository path containing a private term", () => {
  const root = temporaryRoot();
  const privateTerm = "private-project-name";
  writeFileSync(path.join(root, `${privateTerm}.md`), "safe content");

  const findings = scanTree(root, minimalConfig(), [ { id: 1, folded: privateTerm } ]);
  const serialized = JSON.stringify(findings);

  assert.equal(findings[0].category, "private-denylist-path");
  assert.equal(findings[0].path, "<redacted-path>");
  assert.doesNotMatch(serialized, new RegExp(privateTerm, "i"));
});

test("ignores dot-private but not a similarly named tracked directory", () => {
  assert.equal(isIgnored(".private/raw.txt", [ ".private/" ]), true);
  assert.equal(isIgnored("private/raw.txt", [ ".private/" ]), false);
});

test("detects possible secrets without repeating the value", () => {
  const root = temporaryRoot();
  const secretValue = "example-value-123456";
  writeFileSync(path.join(root, "trace.txt"), `api_key=${secretValue}`);

  const findings = scanTree(root, minimalConfig());

  assert.equal(findings[0].category, "possible-secret");
  assert.doesNotMatch(JSON.stringify(findings), new RegExp(secretValue));
});

test("blocks symlinks that resolve outside the repository", () => {
  const root = temporaryRoot();
  const outside = temporaryRoot();
  writeFileSync(path.join(outside, "private.txt"), "not scanned");
  symlinkSync(outside, path.join(root, "external"), "dir");

  const findings = scanTree(root, minimalConfig());

  assert.equal(findings[0].category, "external-symlink");
  assert.equal(findings[0].severity, "error");
});

test("requires the private denylist to resolve outside the repository", () => {
  const root = temporaryRoot();
  const localDenylist = path.join(root, "denylist.txt");
  writeFileSync(localDenylist, "private-term");

  const findings = validatePrivatePath(root, localDenylist);

  assert.equal(findings[0].category, "private-boundary");
  assert.equal(findings[0].path, "<redacted-path>");
});

test("implementation path validation rejects empty files and placeholders", () => {
  const root = temporaryRoot();
  writeFileSync(path.join(root, "empty.md"), "");
  writeFileSync(path.join(root, "placeholder.md"), "Status: REQUIRED\n");

  const findings = checkRequiredPaths(
    root,
    [ "empty.md", "placeholder.md" ],
    "implementation-path",
    { validateContent: true, placeholderTokens: [ "REQUIRED", "TBD", "TODO" ] },
  );

  assert.equal(findings.length, 2);
});

test("repository self-scan has no error findings", () => {
  const config = loadConfig(REPOSITORY_ROOT);
  const findings = scanTree(REPOSITORY_ROOT, config);

  assert.deepEqual(findings.filter((item) => item.severity === "error"), []);
});
