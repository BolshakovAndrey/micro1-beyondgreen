# micro1 Frontier Engineering Challenge 2026

The challenge is live. The current submission deadline is 2026-08-31 18:00 UTC
(20:00 Europe/Belgrade).

Before making project decisions, read [the final challenge contract](docs/CHALLENGE.md)
and [the preserved rules, judging rubric, and schedule](docs/HACKATHON_RULES.md). The
qualification gate and rubric are treated as product requirements throughout
implementation.

The complete Russian translation of the official 10-page challenge brief is
available in [docs/MICRO1_INSTRUCTIONS_RU.md](docs/MICRO1_INSTRUCTIONS_RU.md).

The topic-independent contract for continuously collecting judge-ready evidence and
building the final submission package is defined in
[docs/SUBMISSION_ARTIFACTS_SPEC.md](docs/SUBMISSION_ARTIFACTS_SPEC.md).

Before opening the implementation branch or starting a product agent, pass the
[clean-room preflight](docs/PREFLIGHT_CHECKLIST.md). The binding NDA/provenance and
trace contracts are [docs/CLEAN_ROOM_POLICY.md](docs/CLEAN_ROOM_POLICY.md),
[docs/TRACE_POLICY.md](docs/TRACE_POLICY.md), and
[docs/PROVENANCE.md](docs/PROVENANCE.md).

```bash
npm test
npm run preflight:control
```

## Reviewer quick start

The project uses one Node/TypeScript task runner instead of adding a new
`package.json` script for every evaluation fixture or phase. This keeps the public
entry points stable while making every supported task discoverable and reviewable.

From a clean checkout with the supported Node version:

```bash
npm ci
npm run task -- list
npm test
npm run task -- d01:verify
npm run task -- d01:demo
npm run task -- d01:replay
```

Expected success markers include:

```text
TASK_PASSED test:all
TASK_PASSED d01:verify
TASK_PASSED d01:demo
TASK_PASSED d01:replay
```

`npm test` deterministically discovers ordinary tests only under the approved public
test roots. `d01:verify` additionally runs the deliberately separated verifier-only
oracle self-check and the physical access-boundary test for BG-D01. The task catalog
is implemented in [`scripts/tasks/`](scripts/tasks/); new fixtures add a small typed
task module there rather than expanding `package.json`.

The ordinary catalog intentionally excludes live model, network-diagnostic, and
Chromium-launch commands. Historical runs remain documented as evidence, but cannot
be started accidentally through `npm run task`.

Tasks ending in `:write` are maintainer-only reconciliation commands for immutable
manifests or checksum projections. Reviewers normally use `test:all`, `d01:verify`,
`d01:demo`, `d01:replay`, the corresponding `:check` tasks, and
`phase0.5:verify`. The catalog contains no obsolete live launcher: every registered
task either verifies a submitted contract, reproduces evidence, or regenerates a
reviewed projection after an authorized source change.

The D01 vertical slice is an explicitly unscored development demonstration. The
owner-approved correction boundary `SES-20260830-003` is now implemented under the
planned eligible trajectory `TRC-BG-D01-SCALE-003`. The real orchestrator and worker
processes use one injected descriptor execution path, capability evidence is bound
to canonical launch, policy, role, event-state, and immutable-decision claims,
offline replay independently checks both evaluator conclusions, and recursive
package validation covers nested registered sources. Compile, all 55 ordinary tests,
and targeted `d01:verify` passed. Its 49,485-byte native capture has exact receipt
identity, strict UTF-8, a safe raw scan, complete EN/RU technical review, and owner
promotion into `actual_traces`. The repeated Codex acceptance matrix passed package,
projection, schema-injection, and evaluator-replay criteria but confirmed five
bounded runtime/capability blockers; `SCALE_READY=false` pending SCALE-004.
It ingests and hash-checks the frozen `candidate-b`, finalizes both arm decisions
before opening the independent evaluator capability, and writes validated JSON plus
static HTML. `d01:replay` rebuilds both representations deterministically in memory;
it performs no network call, subprocess launch, or workspace write. See
[`docs/D01_REPRODUCTION.md`](docs/D01_REPRODUCTION.md) for the exact evidence paths,
expected verdicts, isolation boundary, and limitations.

The D01 isolation runner currently requires macOS `/usr/bin/sandbox-exec` to deny
network egress in addition to Node filesystem permissions. It fails closed on other
platforms; no permissive cross-platform fallback is registered.

An independent Claude Opus reviewer is available through the project skill
`.agents/skills/claude`. Invoke it by explicitly saying `клод`, `claude`, or
`$claude`; its exact context and CLI contracts are stored inside the skill.
