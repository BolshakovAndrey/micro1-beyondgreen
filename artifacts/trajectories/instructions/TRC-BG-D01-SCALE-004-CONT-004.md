# TRC-BG-D01-SCALE-004-CONT-004 — single ordinary-test gate

Continue the owner-approved BeyondGreen SCALE-004 work only inside the current clean
repository root. Read `AGENTS.md`,
`artifacts/trajectories/session-boundaries/SES-20260830-004.yaml`, the original
SCALE-004 instruction, and
`artifacts/trajectories/reviews/BG-D01-SCALE-004-COMPILE-CHECKPOINT_RU.md` in full.

The owner authorizes exactly one command: `npm test`.

Do not edit product, source, test, manifest, projection, dependency, lockfile, or
runtime-policy files before or after the command. Do not run compile, `d01:verify`,
replay, demo, preflight, formatter, dependency installation, or any other product
command. Do not change fixtures, candidates, oracles, visible assertions, evaluation
methodology, targets, denominators, BG-D02, scope A1/A2/S1/S2/S3,
A3/S4/P1/P2/D1, or `SCALE_READY`. Do not use Claude, Chromium, browser state,
connected apps, MCP resources, global memory, sibling repositories, external
workspaces, or another agent/model. Do not commit or push.

Run `npm test` exactly once. On failure, stop immediately without edits, retries, or
`d01:verify`, and create only
`artifacts/trajectories/reviews/BG-D01-SCALE-004-TEST-STOP-CHECKPOINT_RU.md` with the
safe failure class, counts available without raw output, preserved exclusions, and
the exact owner decision needed. On PASS, stop without `d01:verify` and create only
`artifacts/trajectories/reviews/BG-D01-SCALE-004-TEST-CHECKPOINT_RU.md` in complete
natural Russian. Record the single command and result, absence of retries/edits,
remaining D01 verification and trace-review gates, `SCALE_READY=false`, and no
commit/push.

Never disclose or persist machine-specific absolute paths, environment-variable
values, external paths, raw trace payload, secrets, or private denylist terms. JSONL
stdout and stderr are captured by the unchanged approved safe transport.
