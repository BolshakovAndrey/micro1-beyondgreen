# TRC-BG-PRE-UNBLINDING-VERIFY-001 — Read-only verification instructions

Work only inside the current BeyondGreen clean-room repository root. This is an
independent, automatically captured review of the completed SES-20260830-015
bounded pre-unblinding implementation. Do not modify any repository file.

Read `AGENTS.md` and every mandatory contract named there in full before reviewing:

1. `docs/CHALLENGE.md`
2. `docs/HACKATHON_RULES.md`
3. `docs/CLEAN_ROOM_POLICY.md`
4. `docs/TRACE_POLICY.md`
5. `docs/PREFLIGHT_CHECKLIST.md`
6. `docs/PROJECT_SPEC.md`
7. `docs/EVALUATION.md`
8. `config/topic.yaml`
9. `artifacts/trajectories/session-boundaries/SES-20260830-015.yaml`
10. `artifacts/trajectories/session-boundaries/SES-20260830-016.yaml`

Verify the exact source HEAD
`cb51e7de1e9908088dbef4dbeb29946d1edbc16b`. Separate the thirteen pre-existing
SES-015 changed files from the new SES-016 boundary and this instruction artifact.
Review every SES-015 diff and new file. Confirm that the implementation does not
change candidates, oracle semantics, visible assertions, frozen behavior, scoring,
evaluation methodology, or existing frozen candidate/oracle hashes.

Run only these bounded checks:

1. `git diff --check`, plus an equivalent whitespace check for every untracked file.
2. `npm run task -- checksums:check`; treat the already documented stale projection
   as expected, but report any mismatch outside the twelve known covered SES-015
   paths and the newly authorized unpromoted trace artifacts as a new finding.
3. `npm run compile`.
4. `npm test`.
5. `npm run task -- freeze:self-test`.
6. Each contract-only task with the exact arguments:
   `baseline:verify`, `beyondgreen:verify`, `evaluation:run`, and `replay`, each with
   `--evaluation-version eval-v1.1.0`.
7. `npm run task -- submission:rehearse` once. It may use and delete its temporary
   directory, but it must not create a repository archive or run record.

Do not run either general preflight command: the owner authorized automated scanning
of this capture separately, not a broader repository preflight. Do not use network
access, a live product model, Chromium, browser automation, MCP, Claude, another
agent, external workspace, private state, or global memory. Do not perform an
official/scored run, unblinding, publication, commit, or push. Do not read external
raw traces or print any private environment-variable value or path.

If any command fails unexpectedly, any new scanner-like path finding appears, any
scope is not exact, or any frozen surface changed, stop immediately without repair.

Return a concise but complete English verification report containing:

- exact HEAD and exact reviewed-file classification;
- every command and exit/result summary;
- findings ordered by severity, with `none` stated explicitly if appropriate;
- frozen-surface disposition;
- official/scored/unblinding/live-model disposition;
- checksum mismatch classification;
- limitations and the exact recommendation for owner review.

This captured trace remains unpromoted and pending repository-owner review.
