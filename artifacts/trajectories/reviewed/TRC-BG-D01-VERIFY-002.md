# TRC-BG-D01-VERIFY-002 — Bounded Independent D01 Verification

Status: pending repository-owner approval; not yet indexed in `actual_traces`.

## Capture classification

- Source kind: Codex Desktop native user-visible `Copy as Markdown` export.
- Immutable source size: 24,318 bytes.
- Immutable source SHA-256:
  `6cb44af2ae43b03035fa41044dc2f2bdf9ee54d009ccc699205c2da420e32305`.
- Exact byte identity and strict UTF-8 round-trip were independently confirmed.
- The export preserves the visible chronological conversation and visible tool
  cards. Hidden reasoning, complete command stdout, and internal application events
  are not claimed as captured.

Capture receipts, retries, and review actions happened after the source task and are
recorded only in the separate post-capture provenance record.

## Purpose and constraints

The repository owner requested a bounded, independent verification of the existing
unscored BG-D01 implementation, reproduction path, evidence integrity, and oracle
isolation.

The source task prohibited:

- official or scored runs;
- external repositories or workspaces;
- browser, connected-app, MCP, or private-state access;
- shared memory and external paths;
- Claude, Codex CLI, live-model, Chromium, and network diagnostics;
- commit and push;
- product or evaluation changes without separate owner authorization; and
- trace capture from inside the source task.

The agent was required to stop at every deterministic failure rather than repair it
without authorization.

## 1. Session-boundary checkpoint

The agent read the required repository-local contracts and product projections,
inspected the permitted repository state, and created:

`artifacts/trajectories/session-boundaries/SES-20260829-008.yaml`

The boundary recorded a dirty working tree, no commit or push authorization, the
bounded verification command set, no external access authorization, and the blocked
predecessor trace as neither a source nor evidence. The repository owner remained
responsible for later external capture.

No verification command ran before owner approval.

## 2. First human checkpoint

The repository owner explicitly approved the session boundary and authorized only:

- repository-local read-only review of the current D01 code and evidence;
- `npm run compile`;
- `npm test`;
- `npm run task -- d01:verify`;
- `npm run task -- d01:replay`;
- `npm run task -- phase0.5:verify`;
- `npm run task -- checksums:check`; and
- `git diff --check`.

The approval did not authorize fixes, official/scored runs, external access, commit,
or push.

## 3. Initial review and first deterministic failure

The visible export records a repository-local read-only review of D01 documentation,
provenance, manifests, orchestration, decision policy, replay logic, and oracle
boundaries.

The agent reported that the implementation remained unscored and that the reviewed
design preserved candidate immutability, decision finalization, oracle-process
separation, and offline replay behavior. Complete underlying file contents and
command stdout are not present in the native export, so these remain agent-reported
review conclusions.

Recorded command results:

- `npm run compile` — passed.
- `npm test` — failed with 48 of 49 tests passing.

The repository self-scan reported two `absolute-user-path` findings in the new
session-boundary file: `repository.root` and `context.repository_root`.

The agent stopped immediately. The remaining verification commands did not run, and
no repair was attempted.

## 4. Second human checkpoint and bounded repair

The repository owner authorized exactly two value changes in the session-boundary
file. The absolute values were replaced with the privacy-safe identifier
`current_clean_repository_root`. No other repair was authorized.

The owner also authorized restarting the approved verification scope from the
beginning, with another mandatory stop on any new deterministic failure.

## 5. Verification retry

The visible export records:

- `npm run compile` — passed;
- `npm test` — passed, reported as 49/49;
- `npm run task -- d01:verify` — passed;
- `npm run task -- d01:replay` — passed;
- `npm run task -- phase0.5:verify` — passed; and
- `npm run task -- checksums:check` — failed with
  `CONTROL_CHECKSUMS_MISMATCH`.

The agent reported successful visible, step-contract, oracle self-check, physical
boundary, vertical-slice, replay, and Phase 0.5 checks. Exact sub-counts and digest
details are agent-reported because their complete stdout is not present in the
native export.

The agent stopped at the checksum failure. `git diff --check` did not run at that
point, and no checksum repair was attempted.

## 6. Third human checkpoint and checksum retry

The repository owner authorized one bounded repository-local checksum diagnosis.
The authorization permitted a checksum-manifest write only if the sole finding was
the new session-boundary file. Any additional mismatch required an immediate stop.

The diagnostic reported exactly one finding:

- `artifacts/trajectories/session-boundaries/SES-20260829-008.yaml` — `extra`.

The agent then ran the authorized commands:

- `npm run task -- checksums:write`;
- `npm run task -- checksums:check`; and
- `git diff --check`.

The agent reported that the checksum manifest was regenerated and verified for 156
files, `git diff --check` passed with no output, and only the checksum manifest was
changed during reconciliation. The sole-modified-file statement is agent-reported;
the native export does not include a complete post-change diff.

## Outcome

The complete owner-approved verification scope was reported as passing after two
bounded retries:

1. privacy-safe correction of two session-boundary values; and
2. reconciliation of the new boundary entry into the checksum manifest.

No official or scored run was performed. The visible export records no external
access, commit, or push. The task concluded that its trace was ready for separate
owner-controlled capture and review, but was not automatically submission eligible.

## Evidence limitations

- This is the complete native user-visible task history, not a raw internal trace.
- Hidden reasoning and internal application events are unavailable and not claimed.
- Some tool responses appear only as collapsed cards or agent summaries.
- Exact detailed test and digest claims without visible stdout are explicitly
  labelled agent-reported.
- The trace proves the bounded unscored verification history; it does not prove an
  official benchmark result or production readiness.
