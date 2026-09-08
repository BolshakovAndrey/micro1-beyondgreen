# Agent Trace and Action Recording Policy

**Status:** blocking preflight contract  
**Goal:** preserve judge-verifiable actions without disclosing private context

## 1. What must be recorded

Every meaningful development iteration must be represented in the Improvement
Changelog, including retained, revised, and removed experiments. Each entry records:

- observed problem or failure;
- hypothesis;
- exact change;
- exact evaluation command and evaluation-set version;
- coding agent, model, and instructions;
- relevant tool responses, errors, retries, and feedback;
- human checkpoint or approval;
- before/after evidence and run IDs;
- decision and what changed next.

This does not require publishing every keystroke or unrelated conversation. It does
require at least one complete representative trajectory for every coding agent and
every solution agent, plus trace coverage for the decisions used in the final result.

## 2. Session eligibility

A trace is submission eligible only when its session begins after the clean-room
boundary and has a completed session-boundary record based on
`templates/SESSION_BOUNDARY.yaml`.

The current topic-selection conversation is permanently excluded because private
context preceded the boundary. A summary of its decision may be independently stated
in the clean product specification, but its transcript and external-review outputs
must not be submitted.

## 3. Capture layers

### Local raw layer

- Store raw exports in the external directory referenced by
  `MICRO1_PRIVATE_TRACE_DIR`. It must resolve outside the repository.
- Preserve the original file unchanged and calculate its SHA-256 digest.
- Never reference a raw local path in judge-facing documentation.
- Never commit or package the raw file before review.

### Native user-visible export fallback

When a coding-agent UI provides no raw/internal export, the most complete native
user-visible export may be used as the immutable source capture only when all of the
following are true:

- the unavailable raw-export capability and the exact native export kind are
  recorded;
- the repository owner selects the native export through the agent UI before any
  editing or redaction;
- the exact exported bytes are captured through the approved external trace
  interface and receive a SHA-256 digest;
- the review record labels the capture kind and states that hidden reasoning and
  internal application events are not claimed as captured; and
- the reviewed submission trace still passes the ordinary automated scan, manual
  review, redaction, and technical-meaning-preservation gates.

For Codex Desktop, `Copy as Markdown` plus task metadata is the approved fallback
when the task menu exposes no raw export. A hand-authored review candidate is not a
native source capture. The required `raw_sha256` index field may contain the native
source-capture digest only when `capture_kind` records this fallback explicitly.

### Submission layer

- Place only reviewed traces under `artifacts/trajectories/`.
- Preserve chronological instructions, actions, tool responses, failures, retries,
  human decisions, and outcome.
- Add a trace-review record containing the raw digest, reviewer, review date,
  exclusions/redactions by category, and a technical-meaning-preserved attestation.
- If safe sanitization would alter technical meaning, exclude the trace and rerun the
  task in a clean session.

## 4. Required trajectory index fields

```yaml
- trace_id: "TRC-000"
  agent_id: ""
  category: "coding_agent|solution_agent"
  tool_and_model: ""
  purpose: ""
  session_boundary_path: ""
  instructions_path: ""
  trace_path: ""
  related_iteration_ids: []
  related_run_ids: []
  raw_sha256: ""
  automated_scan: "passed|failed"
  human_review: "passed|failed"
  technical_meaning_preserved: false
```

No trace may be indexed as passed while any field is missing.

## 5. Forbidden trace content

- Private repository paths, names, source, tests, fixtures, data, tickets, or logs.
- Credentials, tokens, cookies, environment values, private keys, or browser state.
- Personal or customer information.
- Git identity or machine-specific metadata that is not required for reproduction.
- Private denylist contents or matching text.
- Unrelated conversation history or tool output.
- Claims that cannot be tied to submitted evidence.

## 6. Review sequence

Before a trace enters `artifacts/trajectories/`:

1. Verify its session-boundary record.
2. Run `scripts/preflight-check.ts` with the external local-only private denylist.
3. Search for secrets, absolute user paths, personal data, private terms, and unrelated
   context.
4. Review every prompt and tool response manually.
5. Confirm that any omission is logged by category and does not change the technical
   story.
6. Link the trace to concrete iteration and run IDs.
7. Mark both automated and human review as passed.

The final ZIP repeats this review over the complete extracted archive.

## 7. Human checkpoints

For BeyondGreen, traces should preserve at least these decision points when
they occur:

- final approval of normative v1.1 before product code;
- approval of the trace-first implementation boundary and Phase 0.5 freezes;
- approval of the complete D01 vertical slice before scaling;
- approval of the optional unscored D01 repair demonstration;
- acceptance of an evaluation change before unblinding held-out results;
- approval of the final clean-extracted ZIP; and
- explicit decision to retain, revise, or remove an experiment.

Synthetic approval text must never be presented as a real human checkpoint.

## 8. Russian plain-language companion

Before every repository-owner human-review checkpoint, the review packet must include
a Russian plain-language companion. It must explain, in accessible language:

- the evidence the owner is being asked to review;
- every omission, exclusion, and privacy redaction;
- errors, retries, and human feedback;
- known risks and unresolved uncertainty;
- all remaining blockers; and
- the exact actions that approval will and will not authorize.

An English judge-facing or submission artifact does not replace the Russian
companion required for owner approval. Owner approval evidence must identify the
exact Russian companion path or paths that were available when approval was given.
Unavoidable technical identifiers may remain, but each must be explained in Russian
at first use; unexplained English-language jargon is forbidden in the owner review
card.

## 9. Current BeyondGreen trace status

The trace-first, Phase 0.5, D01 verification/correction, D02–D04 integration, held-out
fixture integration, documentation, and coordinator bundles required for representative
coding-agent evidence have passed their recorded automated, semantic, privacy, Russian
owner-companion, and owner-promotion gates. Eligible projections are listed only in
`artifacts/trajectories/index.yaml`; failed and no-change attempts remain disclosed as
retry records and are not presented as implementation evidence.

`SCALE_READY=true`. Official RUN-002 arm decisions and create-once
`POSTDECISION-004` evidence are complete, but raw official execution output is evaluation
evidence rather than a coding-agent trajectory. The 2026-08-31 implementation, official,
recovery, and submission boundaries are indexed with explicit eligibility dispositions;
they are not retroactively presented as promoted representative traces. The two reviewed
pre-unblinding verification projections are also indexed as reviewed-but-not-promoted.
Raw traces and private denylist data stay outside the worktree. The primary public video
URL has passed signed-out playback and a public backup mirror is recorded. The final
Claude checkpoint is preserved in English with a complete Russian owner companion.
Commit, push, and owner upload remain separately gated operations.
