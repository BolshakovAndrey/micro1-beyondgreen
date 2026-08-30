# TRC-BG-PRE-UNBLINDING-VERIFY-001-CONT-001 — Corrected read-only verification

Continue the SES-20260830-016 independent verification in the current isolated
BeyondGreen worktree. This is one owner-authorized corrected transport retry. Do not
modify any repository file.

Use the explicit reviewer model recorded by the launcher. Read `AGENTS.md` and all
mandatory contracts named there in full, followed by
`artifacts/trajectories/session-boundaries/SES-20260830-015.yaml`,
`artifacts/trajectories/session-boundaries/SES-20260830-016.yaml`, and the failed
initial trace review artifacts. Preserve the initial failed capture as an honest
retry record; do not edit it.

Verify the exact source HEAD
`cb51e7de1e9908088dbef4dbeb29946d1edbc16b`. The review subject is exactly the
original thirteen SES-015 changed files. Separately classify all SES-016 boundary,
instruction, and unpromoted review artifacts that exist before or for this capture.

Review the complete original thirteen-file implementation. Confirm that it changes
no candidate, oracle semantics, arm-visible assertion, frozen behavior, scoring,
evaluation methodology, or existing frozen candidate/oracle hash.

Run the complete authorized sequence from the beginning:

1. Run `git diff --check` for tracked changes. For every untracked file, run an
   equivalent `git diff --no-index --check -- /dev/null "$file"`. Use a local shell
   variable named `check_rc`; never assign to zsh's reserved `status` variable.
   Treat exit 1 from `git diff --no-index` as the expected "files differ" result and
   exit greater than 1 or any whitespace diagnostic as failure.
2. Run `npm run task -- checksums:check`. The known stale control-plane projection is
   expected. Report and stop on a mismatch outside the twelve known covered SES-015
   paths plus the unpromoted SES-016 trace artifacts.
3. Run `npm run compile`.
4. Run `npm test`.
5. Run `npm run task -- freeze:self-test`.
6. Run `baseline:verify`, `beyondgreen:verify`, `evaluation:run`, and `replay`, each
   only through `npm run task -- <name> --evaluation-version eval-v1.1.0`.
7. Run `npm run task -- submission:rehearse` exactly once. It may create and delete
   only its temporary rehearsal directory. It must not create a repository archive
   or run record.

Do not run `micro1-safe-preflight` or either repository preflight command in this
attempt. The owner deferred contamination/privacy verification to a separate handoff
in the main checkout. Do not inspect or access that checkout. Do not use network
access other than the already-authorized Codex reviewer transport, a live product
model, Chromium, browser automation, MCP, Claude, another agent, external workspace,
private state, global memory, or external raw traces. Do not perform official/scored
execution, arm execution, unblinding, final packaging, publication, commit, or push.

If any command fails unexpectedly, any new scanner-like path finding appears, any
scope is not exact, or any frozen surface changed, stop immediately without repair
or retry.

Return a complete English verification report with exact scope classification,
commands and results, findings by severity, frozen-surface disposition, checksum
classification, execution-boundary disposition, limitations, and the exact owner
recommendation. State explicitly that this continuation remains unpromoted and that
privacy/contamination acceptance is deferred to the separately gated
`micro1-safe-preflight` handoff.
