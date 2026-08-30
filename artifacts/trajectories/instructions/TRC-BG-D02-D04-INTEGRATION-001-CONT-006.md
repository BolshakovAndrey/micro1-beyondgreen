# TRC-BG-D02-D04-INTEGRATION-001-CONT-006 — corrected stdin transport

You are the single Codex CLI continuation process explicitly authorized under
`SES-20260830-009`. Work only inside the current isolated worktree. The outer CLI
sandbox is `danger-full-access` only for unchanged physical-boundary tests. Do not
read or modify the primary checkout, another Git worktree, sibling repository,
home-directory state, external workspace, browser state, connected app, private MCP
state, global memory, or any other external path. Do not launch another Codex CLI,
subagent, Claude, live product model, Chromium, or browser process. Do not commit or
push.

Before acting, read `AGENTS.md` and every mandatory contract named there in full.
Then read the repository-local SES-009 boundary and owner card, the original
integration instruction, CONT-001 through CONT-005 instructions, and all six prior
stop cards. Preserve every prior trace and stop record unchanged.

Repeat exactly the CONT-005 marker-based normalization protocol for exactly three
`absolute-user-path` findings and only in:

```text
evaluation/manifests/BG-D02/SUBAGENT_REPORT_RU.md
```

The only authorized correction from CONT-005 is the transport of the bounded Node.js
program. Pass its source through a quoted literal heredoc such as:

```text
node --input-type=module <<'NODE'
...
NODE
```

or an equivalent literal stdin mechanism in which zsh performs no interpolation of
the program. Do not place the program in a shell argument. Do not create a temporary
script, raw file, copy, backup, or sidecar containing either the program or target
contents. Never print, log, patch-render, store elsewhere, or include in JSONL any
source absolute value, common machine prefix, or complete affected line.

The unchanged fail-closed protocol is mandatory:

1. Invoke or import the existing repository-local scanner without rendering finding
   contents. Require exactly three `absolute-user-path` findings for the target file
   and no other target-file error category; otherwise stop before editing.
2. Read only the target file in memory. Require all three values to share one
   byte-identical absolute machine prefix and contain exactly one unambiguous marker
   `/micro1.hackerearth/` separating the prefix from a suffix. Never output values or
   the prefix.
3. Reject an empty suffix, NUL, an absolute suffix, or any `..` path segment.
4. Resolve every suffix against the current `process.cwd()` root without reading any
   path outside it. Require the lexical result to remain within root and the
   repo-local target path to exist.
5. Replace only the common prefix through the marker, inclusive, with `./`, preserving
   the suffix and every other byte. Require exactly three replacements.
6. Postvalidate in memory and with the repository scanner: old prefix count zero,
   exactly three normalized repo-relative references at the original findings, all
   resolve within root to existing paths, and zero target-file
   `absolute-user-path` findings. Output only safe counts, line numbers, categories,
   and SHA-256 digests. If preconditions fail, make no change. If postvalidation
   fails, restore exact original in-memory bytes without outputting them and stop.

After successful normalization, reconcile only directly derivative manifests,
provenance/trajectory indexes, and checksum records whose inputs changed because of
this normalization, the owner-approved BG-D04 freeze-metadata correction, or the
already authorized D01-D04 integration. Do not change behavior prose, candidates,
verifier-only oracles, visible assertions, evaluation methodology, targets,
denominators, dependencies, lockfile, runtime policy, or K=0.

Run unchanged `npm test`. If and only if it passes, finish the remaining prior
SES-009 checks without official/scored execution: deterministic replay,
cross-fixture regression, descriptor/fixture/task/role/profile/proof/runner/slot
bijections, exact four-fixture development count, README reproduction, complete
EN/RU documentation parity, Improvement Changelog, provenance and trajectory
indexes, checksum coverage and values, `git diff --check`, and both safe
control/implementation preflights. Use existing typed tasks and repository
conventions; do not needlessly repeat already passing verification.

Only deterministic expected derivative manifest/checksum reconciliation may be
handled and rerun. At the first other unexpected failure, stop immediately, create a
complete natural-Russian stop card, and do not retry, diagnose, or widen scope.

Retain the TypeScript BG-D02 `ParcelDispatchBoard` family; keep the MJS
`QueueBatchCounter` prototype documented as discarded. Do not perform held-out work,
unblinding, repair, official/scored execution, publication, packaging, trace
promotion, commit, or push. Owner-facing materials must be complete natural Russian;
code, JSDoc, and comments must be English. On full success, create a complete
natural-Russian owner checkpoint card with safe normalization counts, exact commands
and results, derivative reconciliation, unchanged surfaces, risks, trace-review
status, remaining gates, and one narrow exact approval phrase for later trace
review/promotion only.
