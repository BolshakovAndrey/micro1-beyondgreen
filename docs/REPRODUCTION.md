# Reproduction — from a clean environment to the official run

**Evaluation version:** `eval-v1.1.0`
**Requirements:** `EV-004`–`EV-010`, `NFR-001`–`NFR-009`, `AR-003`–`AR-007`

This document is the single path from an empty machine to the evidence behind every claim
in the README. It separates what anyone can reproduce from what is, by protocol, executed
exactly once.

## What can and cannot be reproduced

| Level | What it produces | Where it runs | Model calls |
|---|---|---|---|
| **A. Offline replay** | Rebuilds submitted evidence and rejects tampering | any platform | none |
| **B. Full local verification** | Every fixture, isolation, and manifest check | macOS only | none |
| **C. Official scored run** | The 20-candidate, two-arm benchmark result | macOS + authenticated `codex` CLI | 20 |

Levels A and B are fully reproducible by a reviewer and need no credentials and no
network. Level C is **create-once**: its output roots cannot be overwritten, deleted, or
regenerated, and a second execution would not be a rerun of the benchmark — it would be a
different, unscored run. A reviewer confirms level C by reading its immutable evidence and
replaying it, not by executing it again.

## 1. Environment

Node `22.22.3` (`.node-version`); the package `engines` field enforces `>=22.22.3 <23`.
Dependencies are exact-pinned and installed from the lockfile only.

```bash
node --version          # v22.22.3
make setup              # npm ci --ignore-scripts
npm run task -- list    # the full task catalog with descriptions
```

Runtime: `react` `19.2.8`, `react-dom` `19.2.8`, `@preact/signals-react` `3.12.0`,
`jsdom` `30.0.1`, `zod` `4.5.2`. Build/test: `typescript` `5.9.3` and `node:test`.
There is no test framework, no bundler, and no network dependency in any level.

**Platform boundary.** The isolation runner denies network egress with macOS
`/usr/bin/sandbox-exec` on top of Node's permission model. On other platforms it **fails
closed**: no permissive fallback is registered, because a weaker sandbox that still
reported success would invalidate the isolation claim. Level A is platform-independent.

## 2. Level A — deterministic offline replay (any platform)

```bash
make setup
make eval
make eval
```

Both replay invocations must finish with `OFFICIAL_OFFLINE_REPLAY_VERIFIED` and the same
evidence SHA-256 `972cf43f76d0e68534b481a15bfc9f6b9e2db3bf83b4cb5c80d654d07b378f07`.
The replay core validates
both finalized decision hashes, both observation pairs, every evaluator-to-decision
binding, each runner/worker capability proof, and the stored JSON against its Zod schema
before rebuilding the report entirely in memory. It imports no filesystem-write, network,
subprocess, clock, or random capability, and it rejects a tampered report.

## 3. Level B — full verification from a clean checkout (macOS)

```bash
npm test
npm run task -- d01:verify
npm run task -- d01:demo
npm run task -- d01:replay
npm run task -- d02:verify
npm run task -- d03:verify
npm run task -- d04:verify
npm run task -- development:verify
npm run task -- held-out:verify
npm run task -- freeze:self-test
npm run task -- official:preflight
```

Every command prints a single success marker of the form `TASK_PASSED <task>`; any other
exit is a failure and is never summarised as a pass. `npm run task -- d01:demo` writes the
reviewer-facing bundle to `artifacts/evaluation/BG-D01-VERTICAL-SLICE.{json,html}` plus
`artifacts/evaluation/BG-D01-OFFLINE-REPLAY.jsonl`.

What each command proves is tabulated in [`REVIEWER_GUIDE.md`](REVIEWER_GUIDE.md); the D01
evidence paths, expected verdicts, and limits are in
[`D01_REPRODUCTION.md`](D01_REPRODUCTION.md).

**Wall clock.** On the reference machine (Apple Silicon, macOS 24.6, Node 22.22.3) the
ordinary suite takes roughly 25 seconds; the D01 slice commands are dominated by real
subprocess launches under the OS sandbox and take a few seconds each. Level B as a whole
is minutes, not hours.

## 4. Level C — the official scored run

### Preconditions

1. A clean working tree at the reviewed commit.
2. The `codex` CLI, locally authenticated: `codex login status` reports
   `Logged in using ChatGPT`. The frozen adapter is `codex-exec-jsonl-v1` against the
   observed `codex-cli 0.148.0`; the frozen model is `gpt-5.6-sol`. No key-based
   credential is used, and no other model may be substituted — an unavailable model stops
   the run instead of silently falling back.
3. An owner-approved session boundary recorded under
   `artifacts/trajectories/session-boundaries/`, exported as
   `MICRO1_OFFICIAL_SESSION_BOUNDARY` in the form `SES-YYYYMMDD-NNN`. The runner refuses
   to start without it.

### Commands

```bash
npm run task -- baseline:verify    --evaluation-version eval-v1.1.0
npm run task -- beyondgreen:verify --evaluation-version eval-v1.1.0
npm run task -- official:preflight

MICRO1_OFFICIAL_SESSION_BOUNDARY=SES-YYYYMMDD-NNN \
  npm run task -- evaluation:run --evaluation-version eval-v1.1.0

npm run task -- replay --evaluation-version eval-v1.1.0
```

The two `*:verify` commands validate the frozen command contract of each arm **without**
executing an official run. `official:preflight` validates the frozen 10×2 inventory and
builds a non-executable 20-slot, two-arm plan.

### Expected output

On success `evaluation:run` prints one JSON line:

```json
{"status":"OFFICIAL_EVALUATION_COMPLETED","evaluationVersion":"eval-v1.1.0",
 "slots":20,"armPlans":40,"captures":80,"observationPairs":40,"evidenceSha256":"…"}
```

On failure it prints `OFFICIAL_EVALUATION_FAILED <reason>` and exits non-zero. A failed
run is preserved, not deleted: recovery continues from the frozen decisions with
`evaluation:recover-post-decision`, which can reach scenarios, observers, evaluators,
aggregation, and replay — never an arm and never a model.

The `execution-plan.json` stored in RUN-002 is the non-executable static-preflight plan,
so its `officialOrScoredRun:false`, `unblindingPerformed:false`, and
`candidateExecutionAllowed:false` fields describe plan creation rather than the later
official execution. The 40 immutable arm records and provenance in the same root are the
execution evidence.

`POSTDECISION-004/provenance.json` also discloses `inventorySha256Match:false`. The drift
comes from owner-approved transcript-cardinality and identity-transport bridge repairs in
SES-034/037, not candidate, decision, oracle-semantics, or scoring changes. The predeclared
construction control still reproduced exactly 10/20 for status quo and the same 10/10
ground-truth split.

### What the protocol enforces

- 20 candidates × 2 arms = 40 arm plans, one attempt each, zero retries.
- **Status quo** accepts on compilation plus visible legacy tests and makes **zero** model
  invocations.
- **BeyondGreen** makes **exactly one** model invocation per candidate. A second call, a
  retry, a timeout, or malformed output is an operational `abstain`, never a repair path.
- 180 s external wall clock per candidate; the adapter gets a 165 s deadline, reserving
  15 s for schema validation, evidence finalisation, and clean termination.
- The candidate is hashed before and after every arm; the parent opens verifier-only bytes
  only after both decisions are immutable, which is what makes `K=0` checkable.
- Each candidate is observed twice; the two canonical observation digests must be
  identical, or the run is invalidated before any evaluator starts.

## 5. Time and cost

| Item | Value |
|---|---|
| Model invocations per official run | 20 (BeyondGreen only) |
| Enforceable ceiling per candidate | 180 s wall clock / 165 s engine |
| Upper bound of the arm phase | 20 × 180 s ≈ 60 min if every candidate exhausts its ceiling |
| Levels A and B | zero model invocations, zero marginal cost |
| Billing mode | fixed subscription (ChatGPT-authenticated CLI) |
| Marginal USD per candidate | `not_measured` — never zero and never an estimate |
| Token usage | `not_measured` unless the CLI reports it explicitly and stably |
| Human time | agent-supervision time only |

No USD cap is claimed, and no time-savings claim is made against the automated status-quo
arm: manual review time is not estimated. Per-record accounting fields are listed in
[`EVALUATION.md`](EVALUATION.md).

## 6. Integrity checks

```bash
npm run task -- checksums:check
npm run task -- d01:manifests:check
npm run task -- d01:vertical:manifest:check
git diff --check
```

Immutable manifests are validated by recursively enumerating the authorised package root
before any manifest entry is trusted; unlisted files, symlinks, path escapes, duplicate
declarations, and digest mismatches all fail closed. Clean-room scans run only through the
owner-controlled `micro1-safe-preflight` interface, whose denylist value and path are
never printed.

## 7. State of the official run

The arm phase and post-decision oracle phase are complete and frozen. As recorded
in `artifacts/evaluation/official/`:

| Root | State |
|---|---|
| `RUN-…-001` | pre-arm infrastructure failure; zero decisions, model calls, captures, or unblinding |
| `RUN-…-002` | 40 immutable arm records — 20 status-quo (0 model invocations) and 20 BeyondGreen (1 each) |
| `…-POSTDECISION-002` | observer-stage failure before any capture |
| `…-POSTDECISION-003` | partial: 80/80 observer captures, schema-valid, all 40 capture pairs digest-identical; 8/40 evaluator records; no aggregate, report, or replay |
| `…-POSTDECISION-004` | complete: 80 captures, 40 evaluator records, aggregate, JSON/HTML report, and exact offline replay |

Every failed and partial root is preserved byte-for-byte as honest evidence. Scored
aggregates come only from the completed `POSTDECISION-004` root and the already-frozen
RUN-002 decisions. The recovery recorded zero arm executions and zero model invocations.

## 8. Stable commands

| Command | Purpose | Typical runtime / cost |
| --- | --- | --- |
| `make setup` | lockfile-only install | under one minute; network for npm |
| `make baseline` | validate frozen baseline contract | seconds; no model |
| `make solution` | validate frozen BeyondGreen contract | seconds; no model |
| `make test` | complete deterministic suite | about 25 seconds on reference macOS |
| `make eval` / `make replay` | verify official evidence offline | seconds; no model |
| `make demo` | write the unscored D01 JSON/HTML demo | seconds; no model |
| `make artifacts-check` | compile, checksums, official replay | under a minute; no model |
| `make submission` | temporary clean-extraction rehearsal | several minutes; final release ZIP remains a separate owner-gated artifact |

The historical one-shot `evaluation:run` command is documented above for provenance but
must not be used for judge reproduction. It would be a new, unscored execution. The safe
judge path is `make eval`.

## 9. Troubleshooting and limits

- The benchmark is synthetic, and generalisation to production repositories is not
  demonstrated.
- v1 covers React state-to-signals only.
- Level B and level C require macOS; the isolation runner fails closed elsewhere.
- The official run is create-once. A reviewer reproduces it by replaying its immutable
  evidence, not by re-executing it.
- On Linux, use `make eval` and `make artifacts-check`; production isolation tests fail
  closed because `/usr/bin/sandbox-exec` is unavailable.
- A checksum mismatch means repository bytes differ from the reviewed manifest; do not
  regenerate checksums unless intentionally reviewing a changed submission candidate.
