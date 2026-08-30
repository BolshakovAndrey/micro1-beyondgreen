# TRC-BG-D02-D04-INTEGRATION-001-CONT-002 — physical-boundary continuation

You are the single Codex CLI continuation process explicitly authorized under
`SES-20260830-009`. Work only inside the current isolated worktree. Although the
outer CLI sandbox is `danger-full-access` solely so the unchanged D01 tests can bind
loopback and launch their own `/usr/bin/sandbox-exec`, do not read or modify the
primary checkout, Git worktrees other than the current one, sibling repositories,
home-directory state, external workspaces, browser state, connected apps, private
MCP state, global memory, or any other external path. Do not launch another Codex
CLI, subagent, Claude, live product model, Chromium, or browser process. Do not
commit or push.

Before acting, read `AGENTS.md` and every mandatory contract named there in full.
Then read only the repository-local SES-009 integration instruction, both existing
stop cards, the CONT-001 instruction, and the directly relevant current integration
files. Preserve the original trace and CONT-001 as immutable failed parts.

The owner approved this continuation after a bounded read-only diagnosis established:

- `tests/d01-boundary.test.ts` itself was not changed by the integration;
- `workspace-write` denied the parent test's exact
  `server.listen(0, "127.0.0.1")` operation with `EPERM`;
- the same outer sandbox prevented three families of nested
  `/usr/bin/sandbox-exec` probes from running, returning exit 71 before their Node
  JSON output;
- the repository task runner merely inherits the outer environment;
- the unchanged D01 boundary tests provide their own inner `sandbox-exec` network
  denial and Node `--permission` filesystem allowlists.

Do not alter `tests/d01-boundary.test.ts`, its probes, any other existing test to
accommodate the environment, or any frozen behavior/oracle/candidate/visible
assertion/evaluation/runtime contract.

Resume exactly with:

```text
npm run task -- d01:verify
```

If and only if the unchanged D01 verification passes, finish the already authorized
D01-D04 integration and complete the full verification required by
`SES-20260830-009`:

- retain the TypeScript BG-D02 `ParcelDispatchBoard` family and keep the MJS
  `QueueBatchCounter` prototype discarded;
- complete the typed common fixture/descriptor/task-registry connection for D02-D04
  to the existing D01 architecture;
- keep only the already authorized cross-fixture D01-D04 integration tests;
- verify D02, D03, D04, and the exact four-fixture development task;
- verify compile, every visible gate, every evaluator self-check, reciprocal physical
  oracle/candidate capability denial, immutable candidates and hashes, all manifests,
  descriptor/fixture/task/role/profile/proof/runner/slot bijections, deterministic
  replay/regression, exact development fixture count, EN/RU documentation parity,
  checksums, and both safe preflights;
- update only the already authorized shared task runner, README reproduction,
  current EN/RU projections, Improvement Changelog, provenance/trajectory indexes,
  manifests/checksums, and owner-facing integration evidence.

Only deterministic expected manifest/checksum reconciliation caused by the three
authorized fixture commits and bounded integration may be handled and rerun. At the
first other unexpected failure, stop immediately, write a complete natural-Russian
stop card, and do not retry, diagnose, or widen scope.

Do not perform held-out work, unblinding, repair, official/scored execution,
publication, packaging, trace promotion, commit, or push. Owner-facing materials
must be complete natural Russian; code, JSDoc, and comments must be English. On full
success, create a complete natural-Russian owner checkpoint card with exact commands,
results, reconciliation, unchanged surfaces, risks, trace-review status, remaining
gates, and a narrow exact approval phrase for later trace review/promotion only.
