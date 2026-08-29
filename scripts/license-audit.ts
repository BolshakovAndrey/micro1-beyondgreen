#!/usr/bin/env node

/** Deterministic repository-local audit of installed npm package licenses. */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const REPORT_SCHEMA = "beyondgreen-license-audit@1.1.0";

export const PERMISSIVE_LICENSE_ALLOWLIST = Object.freeze([
  "0BSD",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "CC0-1.0",
  "ISC",
  "MIT",
  "MIT-0",
  "BlueOak-1.0.0",
  "Python-2.0",
  "Unlicense",
  "X11",
  "Zlib",
]);

const ALLOWED_EXCEPTIONS = new Set([ "LLVM-exception" ]);
const LEGACY_LICENSE_ALIASES = new Map([
  [ "Apache 2.0", "Apache-2.0" ],
  [ "Apache License 2.0", "Apache-2.0" ],
  [ "BSD 2-Clause", "BSD-2-Clause" ],
  [ "BSD 3-Clause", "BSD-3-Clause" ],
  [ "MIT License", "MIT" ],
  [ "Public Domain", "CC0-1.0" ],
]);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function canonicalJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) =>
      `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function licenseValues(value) {
  if (typeof value === "string") {
    return [ value ];
  }
  if (Array.isArray(value)) {
    return value.flatMap(licenseValues);
  }
  if (value && typeof value === "object" && typeof value.type === "string") {
    return [ value.type ];
  }
  return [];
}

export function normalizeLicense(value) {
  const values = licenseValues(value)
    .map((item) => item.trim().replace(/\s+/g, " "))
    .filter(Boolean)
    .map((item) => LEGACY_LICENSE_ALIASES.get(item) ?? item);

  if (values.length === 0) {
    return null;
  }
  const unique = [ ...new Set(values) ].sort();
  return unique.length === 1 ? unique[0] : unique.map((item) => `(${item})`).join(" OR ");
}

export function assessLicense(expression, allowlist = PERMISSIVE_LICENSE_ALLOWLIST) {
  if (!expression) {
    return { status: "missing", identifiers: [] };
  }
  if (/^(SEE LICENSE|UNKNOWN|UNLICENSED)\b/i.test(expression)) {
    return { status: "unknown", identifiers: [] };
  }

  const tokens = expression.match(/\(|\)|\bAND\b|\bOR\b|\bWITH\b|[A-Za-z0-9][A-Za-z0-9.+-]*/g);
  if (!tokens || tokens.join(" ").replace(/\s*([()])\s*/g, "$1") !==
      expression.replace(/\s+/g, " ").replace(/\s*([()])\s*/g, "$1")) {
    return { status: "unknown", identifiers: [] };
  }

  const identifiers = tokens.filter((token) => ![ "(", ")", "AND", "OR", "WITH" ].includes(token));
  if (identifiers.length === 0) {
    return { status: "unknown", identifiers: [] };
  }

  const allowed = new Set(allowlist);
  const disallowed = identifiers.filter((identifier) => {
    const tokenIndex = tokens.findIndex((token, index) => token === identifier && tokens[index - 1] === "WITH");
    const followsWith = tokenIndex >= 0;
    return followsWith ? !ALLOWED_EXCEPTIONS.has(identifier) : !allowed.has(identifier);
  });
  return {
    status: disallowed.length === 0 ? "allowed" : "non_allowlisted",
    identifiers: [ ...new Set(identifiers) ].sort(),
    non_allowlisted_identifiers: [ ...new Set(disallowed) ].sort(),
  };
}

function safePackageLocation(lockKey) {
  const normalized = lockKey.replaceAll("\\", "/");
  if (!normalized.startsWith("node_modules/") || normalized.includes("../") || normalized.endsWith("/node_modules")) {
    return null;
  }
  return normalized;
}

function readJson(jsonPath) {
  return JSON.parse(readFileSync(jsonPath, "utf8"));
}

export function auditInstalledLicenses(root) {
  const lockText = readFileSync(path.join(root, "package-lock.json"), "utf8");
  const lock = JSON.parse(lockText);
  const findings = [];
  const packages = [];

  for (const [ lockKey, locked ] of Object.entries(lock.packages ?? {})) {
    if (lockKey === "") continue;
    const relativeLocation = safePackageLocation(lockKey);
    if (!relativeLocation) {
      findings.push({ category: "unsafe_lockfile_location", package: "<unknown>" });
      continue;
    }

    let installed;
    try {
      installed = readJson(path.join(root, relativeLocation, "package.json"));
    }
    catch (error) {
      findings.push({
        category: "installed_metadata_unreadable",
        package: typeof locked.name === "string" ? locked.name : relativeLocation.split("/node_modules/").at(-1),
        error_code: typeof error?.code === "string" ? error.code : "INVALID_JSON",
      });
      continue;
    }

    const name = installed.name;
    const version = installed.version;
    if (typeof name !== "string" || typeof version !== "string") {
      findings.push({ category: "missing_name_or_version", package: "<unknown>" });
      continue;
    }
    if ((locked.name && locked.name !== name) || locked.version !== version) {
      findings.push({ category: "lock_install_mismatch", package: `${name}@${version}` });
      continue;
    }

    const license = normalizeLicense(installed.license ?? installed.licenses ?? locked.license);
    const assessment = assessLicense(license);
    const record = { name, version, license, status: assessment.status };
    packages.push(record);
    if (assessment.status !== "allowed") {
      findings.push({
        category: `license_${assessment.status}`,
        package: `${name}@${version}`,
        license,
        non_allowlisted_identifiers: assessment.non_allowlisted_identifiers ?? [],
      });
    }
  }

  packages.sort((left, right) => `${left.name}@${left.version}`.localeCompare(`${right.name}@${right.version}`));
  findings.sort((left, right) => `${left.category}:${left.package}`.localeCompare(`${right.category}:${right.package}`));
  const inventoryRows = packages.map(({ name, version, license }) => ({ name, version, license }));
  const inventoryDigest = sha256(inventoryRows.map((item) => canonicalJson(item)).join("\n"));
  const counts = {
    installed_packages: packages.length,
    allowed_packages: packages.filter((item) => item.status === "allowed").length,
    findings: findings.length,
    missing: findings.filter((item) => item.category === "license_missing").length,
    unknown: findings.filter((item) => item.category === "license_unknown").length,
    non_allowlisted: findings.filter((item) => item.category === "license_non_allowlisted").length,
  };

  return {
    schema_version: REPORT_SCHEMA,
    status: findings.length === 0 ? "passed" : "failed",
    policy: {
      rule: "Every SPDX identifier must be in the permissive allowlist; unknown, missing, or non-allowlisted expressions fail.",
      permissive_allowlist: [ ...PERMISSIVE_LICENSE_ALLOWLIST ],
      allowed_exceptions: [ ...ALLOWED_EXCEPTIONS ].sort(),
    },
    source: {
      lockfile: "package-lock.json",
      installed_metadata_root: "node_modules",
      package_lock_sha256: sha256(lockText),
    },
    counts,
    inventory_sha256: inventoryDigest,
    report_payload_sha256: sha256(canonicalJson({ counts, findings, inventory_sha256: inventoryDigest, packages })),
    packages,
    findings,
  };
}

function spdxLinks(expression) {
  const assessment = assessLicense(expression);
  return assessment.identifiers.map((identifier) => ({
    identifier,
    url: ALLOWED_EXCEPTIONS.has(identifier)
      ? `https://spdx.org/licenses/exceptions/${identifier}.html`
      : `https://spdx.org/licenses/${identifier}.html`,
  }));
}

export function renderThirdPartyNotices(report) {
  const lines = [
    "# Third-Party Notices",
    "",
    "This reproducible inventory is generated from the dependency lockfile and installed",
    "package metadata by `npm run audit:licenses`. It does not state that `node_modules`",
    "is shipped. Before packaging, regenerate this file and retain the entries for every",
    "dependency actually bundled or otherwise distributed with BeyondGreen.",
    "",
    `Audited lockfile SHA-256: \`${report.source.package_lock_sha256}\``,
    `Installed inventory SHA-256: \`${report.inventory_sha256}\``,
    "",
    "Each SPDX link supplies the applicable license text. Package authors retain all",
    "copyright and license rights stated by those licenses.",
    "",
    "## Installed dependency inventory",
    "",
  ];

  for (const item of report.packages) {
    const links = spdxLinks(item.license)
      .map(({ identifier, url }) => `[${identifier}](${url})`)
      .join(", ");
    lines.push(`- \`${item.name}@${item.version}\` — \`${item.license}\` — ${links}`);
  }
  return `${lines.join("\n")}\n`;
}

function main() {
  const root = process.cwd();
  const outputIndex = process.argv.indexOf("--output");
  const output = outputIndex >= 0 ? process.argv[outputIndex + 1] : null;
  const noticesIndex = process.argv.indexOf("--notices");
  const notices = noticesIndex >= 0 ? process.argv[noticesIndex + 1] : null;
  try {
    const report = auditInstalledLicenses(root);
    const noticesText = renderThirdPartyNotices(report);
    const finalReport = {
      ...report,
      packaging_notice: {
        path: notices ?? "THIRD_PARTY_NOTICES.md",
        sha256: sha256(noticesText),
        rule: "Regenerate before packaging and preserve license text or SPDX links for every dependency actually distributed; node_modules need not be shipped.",
      },
    };
    finalReport.report_payload_sha256 = sha256(canonicalJson({
      counts: finalReport.counts,
      findings: finalReport.findings,
      inventory_sha256: finalReport.inventory_sha256,
      packages: finalReport.packages,
      packaging_notice: finalReport.packaging_notice,
      policy: finalReport.policy,
    }));
    const serialized = `${JSON.stringify(finalReport, null, 2)}\n`;
    if (output) {
      const absoluteOutput = path.resolve(root, output);
      const relative = path.relative(root, absoluteOutput);
      if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
        throw Object.assign(new Error("unsafe output"), { code: "UNSAFE_OUTPUT" });
      }
      writeFileSync(absoluteOutput, serialized);
    }
    if (notices) {
      const absoluteNotices = path.resolve(root, notices);
      const relativeNotices = path.relative(root, absoluteNotices);
      if (!relativeNotices || relativeNotices.startsWith("..") || path.isAbsolute(relativeNotices)) {
        throw Object.assign(new Error("unsafe notices output"), { code: "UNSAFE_NOTICES_OUTPUT" });
      }
      writeFileSync(absoluteNotices, noticesText);
    }
    process.stdout.write(JSON.stringify({
      schema_version: finalReport.schema_version,
      status: finalReport.status,
      counts: finalReport.counts,
      inventory_sha256: finalReport.inventory_sha256,
      report_payload_sha256: finalReport.report_payload_sha256,
      packaging_notice_sha256: finalReport.packaging_notice.sha256,
      output: output ?? "stdout",
      notices: notices ?? "stdout",
    }) + "\n");
    process.exitCode = report.status === "passed" ? 0 : 1;
  }
  catch (error) {
    process.stdout.write(JSON.stringify({
      schema_version: REPORT_SCHEMA,
      status: "failed",
      category: "scanner_error",
      error_code: typeof error?.code === "string" ? error.code : "INVALID_INPUT",
    }) + "\n");
    process.exitCode = 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}
