import assert from "node:assert/strict";
import { mkdtemp, realpath, rm } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {
  buildMacOsSandboxProfile,
  createMacOsSandboxBackend,
  type SandboxCommandRunner,
} from "../../../src/official/runtime/macos-sandbox-backend.ts";
import type { IsolationLaunchSpec } from "../../../src/official/runtime/process-launcher.ts";

const repositoryRoot = process.cwd();
const entrypoint = `${repositoryRoot}/tests/official/runtime/macos-sandbox-backend.test.ts`;
const allowed = `${repositoryRoot}/tests/official/runtime`;
const denied = `${repositoryRoot}/evaluation/verifier-only`;

function spec(): IsolationLaunchSpec {
  return Object.freeze({
    repositoryRoot,
    cwd: repositoryRoot,
    role: "observer",
    entrypoint: Object.freeze({ modulePath: entrypoint, exportName: "synthetic", }),
    canonicalAllowReadPaths: Object.freeze([allowed]),
    canonicalDenyReadPaths: Object.freeze([denied]),
    networkAccess: "deny",
    requestJsonl: "{}\n",
    attemptOrdinal: 1,
    retryLimit: 0,
  });
}

test("macOS profile owns network denial while Node flags own exact filesystem access", async () => {
  const profile = await buildMacOsSandboxProfile({ spec: spec(), nodeExecutable: process.execPath });
  assert.match(profile, /\(allow default\)/u);
  assert.match(profile, /\(deny network\*\)/u);
  assert.equal(profile.includes(allowed), false);
  assert.equal(profile.includes(denied), false);
});

test("backend returns an exact attestation only for a bounded IPC exit", async () => {
  let calls = 0;
  const runner: SandboxCommandRunner = {
    async run({ executable, args, stdin, environment }) {
      calls += 1;
      assert.equal(executable, "/usr/bin/sandbox-exec");
      assert.equal(args[0], "-p");
      assert.ok(args.includes("--permission"));
      assert.ok(args.includes("--allow-fs-read"));
      assert.equal(args.includes(denied), false);
      assert.equal(stdin, "{}\n");
      assert.equal(environment.OFFICIAL_ROLE, "observer");
      return { stdout: "{}\n", exitCode: 0, spawnError: false };
    },
  };
  const output = await createMacOsSandboxBackend({ runner }).execute(spec());
  assert.equal(calls, 1);
  assert.equal(output.attestation.networkDenied, true);
  assert.deepEqual(output.attestation.canonicalAllowReadPaths, [allowed]);
  assert.equal(output.retryCount, 0);
  assert.equal(output.reasoningInvocationCount, 0);
});

test("macOS backend physically denies verifier reads and network", { skip: process.platform !== "darwin" }, async () => {
  const cwd = await mkdtemp(path.join(repositoryRoot, ".official-sandbox-test-"));
  const worker = await realpath(`${repositoryRoot}/tests/official/runtime/fixtures/macos-sandbox-probe.ts`);
  const packageJson = await realpath(`${repositoryRoot}/package.json`);
  const deniedPath = await realpath(`${repositoryRoot}/docs/PROJECT_SPEC.md`);
  try {
    const physicalSpec: IsolationLaunchSpec = Object.freeze({
      ...spec(),
      cwd,
      entrypoint: Object.freeze({ modulePath: worker, exportName: "probe" }),
      canonicalAllowReadPaths: Object.freeze([worker, packageJson].sort()),
      canonicalDenyReadPaths: Object.freeze([deniedPath]),
      requestJsonl: `${JSON.stringify({ deniedPath })}\n`,
    });
    const output = await createMacOsSandboxBackend().execute(physicalSpec);
    assert.equal(output.exitCode, 0);
    assert.deepEqual(JSON.parse(output.stdout), { fileDenied: true, networkDenied: true });
    assert.equal(output.attestation.networkDenied, true);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});
