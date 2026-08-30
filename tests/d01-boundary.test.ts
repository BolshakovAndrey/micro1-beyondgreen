/** Exercises physical oracle isolation, immutable decisions, and fail-closed D01 boundaries. */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:net";
import test from "node:test";
import path from "node:path";
import { D01_FIXTURE } from "../src/d01/fixture.ts";

const root = process.cwd();
const armRoot = path.join(root, "evaluation", "arm-visible", "BG-D01");
const probePath = path.join(armRoot, "denied-probe.mjs");
const dependencyRoot = path.join(root, "node_modules");
const packagePath = path.join(root, "package.json");

function collectRelativeModuleGraph(entrypoint: string): readonly string[] {
  const pending = [path.resolve(root, entrypoint)];
  const visited = new Set<string>();
  const importPattern = /(?:from\s+|import\s*\()\s*["']([^"']+)["']/gu;
  while (pending.length > 0) {
    const current = pending.pop()!;
    if (visited.has(current)) continue;
    visited.add(current);
    const source = readFileSync(current, "utf8");
    for (const match of source.matchAll(importPattern)) {
      const specifier = match[1]!;
      if (!specifier.startsWith(".")) continue;
      const resolved = path.resolve(path.dirname(current), specifier);
      if (existsSync(resolved)) pending.push(resolved);
    }
  }
  return [...visited].map((filePath) => path.relative(root, filePath).replaceAll(path.sep, "/"));
}

test("arm and observer transitive module graphs exclude verifier-only imports", () => {
  for (const entrypoint of ["scripts/d01-arm-worker.ts", "scripts/d01-candidate-observer-worker.ts"]) {
    const graph = collectRelativeModuleGraph(entrypoint);
    assert.equal(graph.some((filePath) => filePath.startsWith("evaluation/verifier-only/")), false,
      `${entrypoint} must remain verifier-free transitively`);
  }
  const evaluatorGraph = collectRelativeModuleGraph("scripts/d01-evaluator-worker.ts");
  assert.ok(evaluatorGraph.includes("evaluation/verifier-only/BG-D01/canonical-driver.ts"),
    "only the evaluator entrypoint may compose the canonical verifier");
});

function runProbe(arm: "status-quo" | "beyondgreen", candidateId: "candidate-a" | "candidate-b") {
  const candidateRoot = path.join(root, "candidates", "BG-D01", candidateId);
  const result = spawnSync(
    "/usr/bin/sandbox-exec",
    [
      "-p",
      "(version 1) (allow default) (deny network*)",
      process.execPath,
      "--permission",
      `--allow-fs-read=${armRoot}`,
      `--allow-fs-read=${candidateRoot}`,
      `--allow-fs-read=${dependencyRoot}`,
      `--allow-fs-read=${packagePath}`,
      probePath,
    ],
    {
      cwd: armRoot,
      encoding: "utf8",
      env: { BG_ARM: arm, BG_CANDIDATE: candidateId },
    },
  );
  assert.equal(result.status, 0, `${arm} probe failed without exposing verifier diagnostics`);
  assert.equal(result.stderr, "");
  return JSON.parse(result.stdout) as {
    allDenied: boolean;
    candidateExecutable: boolean;
    candidateReadable: boolean;
    errorProbeIndistinguishable: boolean;
    operationCount: number;
  };
}

test("status-quo process cannot enumerate, read, hash, or error-probe verifier-only", () => {
  for (const candidateId of ["candidate-a", "candidate-b"] as const) {
    assert.deepEqual(runProbe("status-quo", candidateId), {
      allDenied: true,
      candidateExecutable: true,
      candidateReadable: true,
      errorProbeIndistinguishable: true,
      operationCount: 8,
    });
  }
});

test("candidate subprocess sandbox denies loopback and inherits no host PATH", async () => {
  const server = createServer();
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  try {
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Expected a TCP test address.");
    const port = address.port;
    const probe = spawnSync("/usr/bin/sandbox-exec", [
      "-p",
      "(version 1) (allow default) (deny network*)",
      process.execPath,
      "-e",
      `if (process.env.PATH) process.exit(4); const net = require("node:net"); const socket = net.connect(${port}, "127.0.0.1"); socket.once("connect", () => process.exit(2)); socket.once("error", () => process.exit(0)); setTimeout(() => process.exit(3), 1000);`,
    ], { env: {}, encoding: "utf8", timeout: 2_000 });
    assert.equal(probe.status, 0, `network sandbox probe failed: ${probe.stderr}`);
  }
  finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test("BeyondGreen process has the same physical verifier denial", () => {
  for (const candidateId of ["candidate-a", "candidate-b"] as const) {
    assert.deepEqual(runProbe("beyondgreen", candidateId), {
      allDenied: true,
      candidateExecutable: true,
      candidateReadable: true,
      errorProbeIndistinguishable: true,
      operationCount: 8,
    });
  }
});

function runEvaluatorDeniedCandidateProbe(candidateId: "candidate-a" | "candidate-b") {
  const verifierRoot = path.join(root, D01_FIXTURE.verifierOnly.rootPath);
  const probePath = path.join(verifierRoot, "evaluator-denied-probe.mjs");
  const result = spawnSync("/usr/bin/sandbox-exec", [
    "-p",
    "(version 1) (allow default) (deny network*)",
    process.execPath,
    "--permission",
    `--allow-fs-read=${verifierRoot}`,
    probePath,
  ], {
    cwd: verifierRoot,
    encoding: "utf8",
    env: { BG_CANDIDATE: candidateId },
  });
  assert.equal(result.status, 0, "evaluator denial probe failed without exposing candidate diagnostics");
  assert.equal(result.stderr, "");
  return JSON.parse(result.stdout);
}

test("verifier-owned evaluator can read its oracle but cannot inspect either candidate", () => {
  for (const candidateId of D01_FIXTURE.candidateIds) {
    assert.deepEqual(runEvaluatorDeniedCandidateProbe(candidateId), {
      allCandidateAccessDenied: true,
      errorProbeIndistinguishable: true,
      operationCount: 3,
      verifierReadable: true,
    });
  }
});
