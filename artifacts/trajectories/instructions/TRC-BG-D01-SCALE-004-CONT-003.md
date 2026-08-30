# TRC-BG-D01-SCALE-004-CONT-003 — TEST_ONLY_ENGINE verifier binding correction

Continue the owner-approved BeyondGreen SCALE-004 work only inside the current clean
repository root. Read `AGENTS.md`,
`artifacts/trajectories/session-boundaries/SES-20260830-004.yaml`, the original
SCALE-004 instruction, and the complete current
`artifacts/trajectories/reviews/BG-D01-SCALE-004-STOP-CHECKPOINT_RU.md` before acting.

The owner authorizes exactly one source correction:

- modify only `tests/fixtures/test-only-engine.ts`;
- add exactly `packageId`, `packageKind`, `sourcePaths`, and
  `expectedPackageSha256` to `TEST_ONLY_ENGINE.verifierOnly`;
- derive values only from existing repository-local TEST-ONLY descriptor/package
  evidence and keep them consistent with the already-corrected arm-visible binding;
- execute `npm run compile` exactly once after the edit.

Do not modify any other product/source/test file. Do not run compile before the edit
is complete. Do not run `npm test`, `d01:verify`, replay, demo, preflight, formatter,
dependency installation, or any other product command. Do not change dependencies,
`package-lock.json`, runtime policy, fixtures, candidates, oracles, visible
assertions, evaluation methodology, targets, denominators, BG-D02, scope
A1/A2/S1/S2/S3, A3/S4/P1/P2/D1, or `SCALE_READY`. Do not use Claude, Chromium,
browser state, connected apps, MCP resources, global memory, sibling repositories,
external workspaces, or another agent/model. Do not commit or push.

If the single compile fails, stop immediately without any further edit or retry and
append only a concise natural-Russian continuation section to
`artifacts/trajectories/reviews/BG-D01-SCALE-004-STOP-CHECKPOINT_RU.md`. If it passes,
create only the service record
`artifacts/trajectories/reviews/BG-D01-SCALE-004-COMPILE-CHECKPOINT_RU.md` in complete
natural Russian. State the exact edit, single compile result, absence of retries and
tests, remaining SCALE-004 verification gates, unchanged exclusions,
`SCALE_READY=false`, and no commit/push.

Never disclose or persist machine-specific absolute paths, environment-variable
values, external paths, raw trace payload, secrets, or private denylist terms. JSONL
stdout and stderr are captured by the unchanged approved safe transport.
