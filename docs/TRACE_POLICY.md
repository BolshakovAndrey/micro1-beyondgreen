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

For StateShift Guardian, traces should preserve at least these decision points when
they occur:

- approval of a migration/state-inventory plan;
- approval of generated behavioral contracts;
- approval or rejection of the proposed final patch;
- acceptance of an evaluation change before unblinding held-out results;
- explicit decision to retain, revise, or remove an experiment.

Synthetic approval text must never be presented as a real human checkpoint.
