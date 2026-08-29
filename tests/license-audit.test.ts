import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  assessLicense,
  auditInstalledLicenses,
  normalizeLicense,
  renderThirdPartyNotices,
} from "../scripts/license-audit.ts";

function fixture(packages) {
  const root = mkdtempSync(path.join(tmpdir(), "beyondgreen-license-test-"));
  const lockPackages = { "": { name: "fixture", version: "1.0.0" } };
  for (const item of packages) {
    const location = `node_modules/${item.name}`;
    const directory = path.join(root, location);
    mkdirSync(directory, { recursive: true });
    writeFileSync(path.join(directory, "package.json"), JSON.stringify(item));
    lockPackages[location] = { name: item.name, version: item.version, license: item.lockLicense };
  }
  writeFileSync(path.join(root, "package-lock.json"), JSON.stringify({
    name: "fixture",
    version: "1.0.0",
    lockfileVersion: 3,
    packages: lockPackages,
  }));
  return root;
}

test("normalizes common string, object, and array license shapes", () => {
  assert.equal(normalizeLicense("MIT License"), "MIT");
  assert.equal(normalizeLicense({ type: "Apache License 2.0" }), "Apache-2.0");
  assert.equal(normalizeLicense([ { type: "MIT" }, "ISC" ]), "(ISC) OR (MIT)");
  assert.equal(normalizeLicense(undefined), null);
});

test("allows only known permissive SPDX expressions", () => {
  assert.equal(assessLicense("MIT OR Apache-2.0").status, "allowed");
  assert.equal(assessLicense("Apache-2.0 WITH LLVM-exception").status, "allowed");
  assert.equal(assessLicense("MIT-0").status, "allowed");
  assert.equal(assessLicense("BlueOak-1.0.0").status, "allowed");
  assert.equal(assessLicense("GPL-3.0-only").status, "non_allowlisted");
  assert.equal(assessLicense("SEE LICENSE IN LICENSE.txt").status, "unknown");
});

test("renders reproducible SPDX-linked notices without claiming node_modules is shipped", () => {
  const root = fixture([
    { name: "zero-attribution", version: "1.0.0", license: "MIT-0" },
    { name: "blue-oak", version: "2.0.0", license: "BlueOak-1.0.0" },
  ]);
  const report = auditInstalledLicenses(root);
  const first = renderThirdPartyNotices(report);
  const second = renderThirdPartyNotices(report);

  assert.equal(first, second);
  assert.match(first, /https:\/\/spdx\.org\/licenses\/MIT-0\.html/);
  assert.match(first, /https:\/\/spdx\.org\/licenses\/BlueOak-1\.0\.0\.html/);
  assert.match(first, /does not state that `node_modules`/);
});

test("enumerates scoped packages and emits deterministic privacy-safe records", () => {
  const root = fixture([
    { name: "@scope/example", version: "1.2.3", license: { type: "MIT" } },
    { name: "plain", version: "2.0.0", licenses: [ "ISC", "MIT" ] },
  ]);
  const first = auditInstalledLicenses(root);
  const second = auditInstalledLicenses(root);

  assert.equal(first.status, "passed");
  assert.equal(first.counts.installed_packages, 2);
  assert.deepEqual(first.packages.map((item) => item.name), [ "@scope/example", "plain" ]);
  assert.equal(first.inventory_sha256, second.inventory_sha256);
  assert.equal(first.report_payload_sha256, second.report_payload_sha256);
  assert.doesNotMatch(JSON.stringify(first), new RegExp(root.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("fails closed on missing and non-allowlisted licenses", () => {
  const root = fixture([
    { name: "missing", version: "1.0.0" },
    { name: "copyleft", version: "1.0.0", license: "GPL-3.0-only" },
  ]);
  const report = auditInstalledLicenses(root);

  assert.equal(report.status, "failed");
  assert.equal(report.counts.missing, 1);
  assert.equal(report.counts.non_allowlisted, 1);
});

test("fails closed when installed metadata differs from the lockfile", () => {
  const root = fixture([ { name: "example", version: "1.0.0", license: "MIT" } ]);
  const lockPath = path.join(root, "package-lock.json");
  const lock = JSON.parse(readFileSync(lockPath, "utf8"));
  lock.packages["node_modules/example"].version = "2.0.0";
  writeFileSync(lockPath, JSON.stringify(lock));

  const report = auditInstalledLicenses(root);
  assert.equal(report.status, "failed");
  assert.equal(report.findings[0].category, "lock_install_mismatch");
});
