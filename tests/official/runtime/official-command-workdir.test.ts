import assert from "node:assert/strict";
import { realpath, rm } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {
  createOfficialRuntimeWorkingDirectory,
  OFFICIAL_OUTPUT_ROOT,
} from "../../../scripts/d00-official-run.ts";

test("recovery output is create-once RUN-002 and cannot target preserved RUN-001", () => {
  assert.equal(OFFICIAL_OUTPUT_ROOT, "artifacts/evaluation/official/RUN-BG-OFFICIAL-EVAL-V1.1.0-002");
  assert.notEqual(OFFICIAL_OUTPUT_ROOT, "artifacts/evaluation/official/RUN-BG-OFFICIAL-EVAL-V1.1.0-001");
});

test("official command creates its disposable runtime root inside the clean repository", async () => {
  const repositoryRoot = await realpath(process.cwd());
  const workingDirectoryRoot = await createOfficialRuntimeWorkingDirectory(repositoryRoot);
  try {
    const relative = path.relative(repositoryRoot, workingDirectoryRoot);
    assert.equal(path.isAbsolute(relative), false);
    assert.equal(relative.startsWith(`..${path.sep}`), false);
    assert.match(relative, /^\.official-runtime-/u);
  } finally {
    await rm(workingDirectoryRoot, { recursive: true, force: true });
  }
});
