# TRC-BG-D01-SCALE-004-CONT-006 — evaluator composition parameter type

Continue the owner-approved BeyondGreen SCALE-004 work only inside the current clean
repository root. Read `AGENTS.md`, the approved `SES-20260830-004` boundary, the
original SCALE-004 instruction, and
`artifacts/trajectories/reviews/BG-D01-SCALE-004-ROLE-SEPARATION-STOP_RU.md` in full.

The owner authorizes exactly one code correction:

- modify only `scripts/d01-evaluator-worker.ts`;
- add the explicit correct TypeScript type to the single local evaluator-composition
  function parameter reported as implicit `any`;
- make no other code or test change.

Do not change allowlists, runtime policy, oracle isolation, fixtures, candidates,
oracles, visible assertions, evaluation methodology, targets, denominators,
dependencies, `package-lock.json`, BG-D02, A1/A2/S1/S2/S3, A3/S4/P1/P2/D1, or
`SCALE_READY`. Do not use Claude, Chromium, browser state, connected apps, MCP,
global memory, sibling repositories, external workspaces, or another agent/model.
Do not commit or push.

After the single edit, execute strictly in order and at most once each:

1. `npm run compile`.
2. Only if compile passes, run exactly the previously defined targeted role-boundary
   test command covering the affected `tests/d01-boundary.test.ts` checks.
3. Only if targeted boundary tests pass, run `npm test` exactly once.

At the first nonzero result, stop immediately without edits, diagnosis commands,
retries, or later commands. Never run `d01:verify`, replay, demo, preflight,
formatter, dependency installation, or official/scored evaluation.

On failure, create only
`artifacts/trajectories/reviews/BG-D01-SCALE-004-ROLE-SEPARATION-CONT-STOP_RU.md`.
On complete PASS, create only
`artifacts/trajectories/reviews/BG-D01-SCALE-004-ROLE-SEPARATION-CHECKPOINT_RU.md`.
The natural-Russian checkpoint must record the exact code correction, commands and
counts, absence of retries, preserved security boundaries, remaining `d01:verify`
and trace-review gates, `SCALE_READY=false`, and no commit/push.

Never disclose or persist machine-specific absolute paths, environment-variable
values, external paths, raw trace payload, secrets, private denylist terms, or hidden
oracle contents. Capture JSONL stdout and stderr through the unchanged approved safe
transport; never use Copy as Markdown or manual export.
