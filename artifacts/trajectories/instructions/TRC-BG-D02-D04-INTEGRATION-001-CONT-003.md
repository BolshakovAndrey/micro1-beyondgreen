# TRC-BG-D02-D04-INTEGRATION-001-CONT-003 — BG-D04 freeze-metadata correction

You are the single Codex CLI continuation process explicitly authorized under
`SES-20260830-009`. Work only inside the current isolated worktree. The outer CLI
sandbox is `danger-full-access` solely so unchanged physical-boundary tests can bind
loopback and launch their own `/usr/bin/sandbox-exec`. Do not read or modify the
primary checkout, another Git worktree, sibling repository, home-directory state,
external workspace, browser state, connected app, private MCP state, global memory,
or any other external path. Do not launch another Codex CLI, subagent, Claude, live
product model, Chromium, or browser process. Do not commit or push.

Before acting, read `AGENTS.md` and every mandatory contract named there in full.
Then read the repository-local SES-009 boundary and owner card, the original
integration instruction, CONT-001/CONT-002 instructions, and all three stop cards.
Preserve the original trace and CONT-001/CONT-002 as immutable prior parts.

The owner has explicitly confirmed that the exact bytes of
`evaluation/behavior-specs/BG-D04_BEHAVIOR.md` from fixture commit
`140041f82971f73eca17e2735050ecb0ec8de77d` are the approved frozen content. The
current file is byte-identical to that commit and has SHA-256:

```text
ce2238eebe6dffc2afd25035a778e537c6981ba2b781f4547449a73a4ccad08d
```

The owner authorizes exactly these three direct metadata changes and no other
behavior/freeze semantic edit:

1. Set `english_behavior_sha256` in
   `evaluation/behavior-specs/BG-D04_FREEZE.yaml` to the approved digest.
2. Set `freeze_digest` in the same file to the approved digest.
3. Set `behavior_sha256` in
   `evaluation/manifests/BG-D04/arm-visible.manifest.json` to the approved digest.

Do not edit `BG-D04_BEHAVIOR.md`. Before any test, verify that only those three
direct fields changed and that the behavior file remains byte-identical to the
fixture commit. Reconcile only deterministic derivative manifest/checksum fields
whose inputs changed because of those three metadata corrections or the previously
authorized D01-D04 integration. Do not change candidates, verifier-only oracles,
visible assertions, behavior prose, evaluation methodology, targets, denominators,
dependencies, lockfile, runtime policy, or K=0.

Then run the unchanged command:

```text
npm run task -- d04:verify
```

If and only if it passes, finish all remaining verification required by the prior
SES-009 scope. Do not needlessly repeat already passing D01, D02, or D03 isolated
tasks, but the final integrated verification must establish the complete D01-D04
state through the exact four-fixture development task and ordinary regression suite.
Required remaining evidence includes:

- `development:verify` and its exact D01-D04 registry/descriptor/task bijection;
- complete repository compile and ordinary `npm test`;
- every D01-D04 visible gate and evaluator self-check;
- reciprocal physical oracle/candidate capability denial for both arms and all
  candidates;
- immutable candidate bytes/hashes and all fixture/package/vertical manifests;
- exact development fixture count four and cross-fixture regression;
- deterministic D01 replay and any implemented fixture replay checks without live
  model or official/scored execution;
- README reproduction, current EN/RU projections, Improvement Changelog, provenance
  and trajectory indexes, owner-facing integration evidence, checksum coverage and
  values, and both safe preflights.

Retain the TypeScript BG-D02 `ParcelDispatchBoard` family and keep the MJS
`QueueBatchCounter` prototype documented as discarded. Only deterministic expected
manifest/checksum reconciliation is repeatable inside this continuation. At the
first other unexpected failure, stop immediately, create a complete natural-Russian
stop card, and do not retry, diagnose, or widen scope.

Do not perform held-out work, unblinding, repair, official/scored execution,
publication, packaging, trace promotion, commit, or push. Owner-facing materials
must be complete natural Russian; code, JSDoc, and comments must be English. On full
success, create a complete natural-Russian owner checkpoint card recording exact
commands/results, metadata correction, derivative reconciliation, unchanged frozen
surfaces, risks, trace-review status, remaining gates, and the narrow exact approval
needed for later trace review/promotion only.
