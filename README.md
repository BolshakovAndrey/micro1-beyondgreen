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
npm ci --ignore-scripts
npm run task -- list
npm test
npm run task -- d01:verify
```

Expected success markers include:

```text
TASK_PASSED test:all
TASK_PASSED d01:verify
```

`npm test` deterministically discovers ordinary tests only under the approved public
test roots. `d01:verify` additionally runs the deliberately separated verifier-only
oracle self-check and the physical access-boundary test for BG-D01. The task catalog
is implemented in [`scripts/tasks/`](scripts/tasks/); new fixtures add a small typed
task module there rather than expanding `package.json`.

The ordinary catalog intentionally excludes live model, network-diagnostic, and
Chromium-launch commands. Historical runs remain documented as evidence, but cannot
be started accidentally through `npm run task`.

An independent Claude Opus reviewer is available through the project skill
`.agents/skills/claude`. Invoke it by explicitly saying `клод`, `claude`, or
`$claude`; its exact context and CLI contracts are stored inside the skill.
