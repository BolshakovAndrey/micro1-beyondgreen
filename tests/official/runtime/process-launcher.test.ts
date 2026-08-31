import assert from "node:assert/strict";
import { access, mkdir, mkdtemp, realpath, rm, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import type { RoleCapabilityPlan } from "../../../src/official/adapters/types.ts";
import {
  createProductionProcessLauncher,
  ProcessIsolationError,
  type IsolationAttestation,
  type IsolationLaunchSpec,
  type OsIsolationBackend,
} from "../../../src/official/runtime/process-launcher.ts";

const TEST_ROOT = path.resolve("tests/official/runtime");

async function withSyntheticRepository(run: (input: Readonly<{
  root: string;
  work: string;
  capability: RoleCapabilityPlan;
}>) => Promise<void>): Promise<void> {
  const root = await mkdtemp(path.join(TEST_ROOT, ".launcher-fixture-"));
  try {
    await mkdir(path.join(root, "allowed"));
    await mkdir(path.join(root, "denied"));
    await mkdir(path.join(root, "work"));
    await writeFile(path.join(root, "allowed", "worker.mjs"), "export const worker = true;\n", "utf8");
    await writeFile(path.join(root, "denied", "oracle.json"), "{}\n", "utf8");
    await run({
      root,
      work: path.join(root, "work"),
      capability: Object.freeze({
        role: "arm",
        fixtureId: "BG-D02",
        candidateId: "synthetic-candidate",
        entrypoint: { modulePath: "allowed/worker.mjs", exportName: "worker", symbolKind: "runtime" },
        allowReadPaths: Object.freeze(["allowed"]),
        denyReadPaths: Object.freeze(["denied"]),
        networkAllowed: false,
      }),
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

function attestation(spec: IsolationLaunchSpec): IsolationAttestation {
  return Object.freeze({
    repositoryRoot: spec.repositoryRoot,
    cwd: spec.cwd,
    filesystemReadAllowlistEnforced: true,
    networkDenied: true,
    isolatedCwdEnforced: true,
    canonicalAllowReadPaths: spec.canonicalAllowReadPaths,
    canonicalDenyReadPaths: spec.canonicalDenyReadPaths,
    attemptOrdinal: 1,
    retryCount: 0,
  });
}

test("launcher resolves canonical capabilities and accepts exact OS isolation attestation", async () => {
  await withSyntheticRepository(async ({ root, work, capability }) => {
    let captured: IsolationLaunchSpec | undefined;
    const backend: OsIsolationBackend = {
      async execute(spec) {
        captured = spec;
        return {
          stdout: '{"synthetic":true}\n',
          exitCode: 0,
          reasoningInvocationCount: 1,
          retryCount: 0,
          attestation: attestation(spec),
        };
      },
    };
    const launcher = createProductionProcessLauncher({ repositoryRoot: root, workingDirectoryRoot: work, backend });
    const result = await launcher({
      role: "arm",
      capability,
      attemptOrdinal: 1,
      request: { arm: "beyondgreen", synthetic: true },
    });
    assert.deepEqual(result, { response: { synthetic: true }, reasoningInvocationCount: 1, retryCount: 0 });
    assert.ok(captured);
    assert.equal(captured.networkAccess, "deny");
    assert.equal(captured.retryLimit, 0);
    assert.notEqual(captured.cwd, await realpath(root));
    assert.deepEqual(captured.canonicalAllowReadPaths, [await realpath(path.join(root, "allowed"))]);
    assert.deepEqual(captured.canonicalDenyReadPaths, [await realpath(path.join(root, "denied"))]);
    await assert.rejects(access(captured.cwd));
  });
});

test("launcher fails closed when network denial or the exact allowlist is not attested", async () => {
  await withSyntheticRepository(async ({ root, work, capability }) => {
    let calls = 0;
    const backend: OsIsolationBackend = {
      async execute(spec) {
        calls += 1;
        return {
          stdout: '{"synthetic":true}\n',
          exitCode: 0,
          reasoningInvocationCount: 1,
          retryCount: 0,
          attestation: {
            ...attestation(spec),
            networkDenied: false as unknown as true,
            canonicalAllowReadPaths: [],
          },
        };
      },
    };
    const launcher = createProductionProcessLauncher({ repositoryRoot: root, workingDirectoryRoot: work, backend });
    await assert.rejects(
      launcher({ role: "arm", capability, attemptOrdinal: 1, request: { arm: "beyondgreen" } }),
      ProcessIsolationError,
    );
    assert.equal(calls, 1);
  });
});

test("launcher rejects allow/deny aliases after physical realpath resolution without launching", async () => {
  await withSyntheticRepository(async ({ root, work, capability }) => {
    await symlink("allowed", path.join(root, "allowed-alias"));
    let calls = 0;
    const backend: OsIsolationBackend = {
      async execute(spec) {
        calls += 1;
        return { stdout: "{}\n", exitCode: 0, reasoningInvocationCount: 0, retryCount: 0, attestation: attestation(spec) };
      },
    };
    const aliased: RoleCapabilityPlan = Object.freeze({
      ...capability,
      allowReadPaths: Object.freeze(["allowed"]),
      denyReadPaths: Object.freeze(["allowed-alias"]),
    });
    const launcher = createProductionProcessLauncher({ repositoryRoot: root, workingDirectoryRoot: work, backend });
    await assert.rejects(
      launcher({ role: "arm", capability: aliased, attemptOrdinal: 1, request: { arm: "status-quo" } }),
      /overlap/u,
    );
    assert.equal(calls, 0);
  });
});
