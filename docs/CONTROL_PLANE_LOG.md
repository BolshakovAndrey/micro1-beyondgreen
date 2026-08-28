# Control-Plane Action Log

This log records preparation performed before the clean implementation branch. It is
not a substitute for the Improvement Changelog or representative agent trajectories.
The private control-plane conversation remains excluded from submission.

## `CTL-001` — Preserve authoritative challenge contracts

- **Purpose:** prevent schedule, qualification, rubric, and deliverable requirements
  from drifting during implementation.
- **Artifacts:** `docs/CHALLENGE.md`, `docs/HACKATHON_RULES.md`, preserved official
  participant materials, and the Russian translation.
- **Decision:** retained as authoritative project inputs.
- **Trace status:** originating private control-plane conversation excluded.

## `CTL-002` — Define the topic-independent submission artifact contract

- **Hypothesis:** evidence collection must begin before product implementation or the
  final package will contain unsupported claims and incomplete trajectories.
- **Change:** created `docs/SUBMISSION_ARTIFACTS_SPEC.md` with schemas, commands,
  rubric mapping, release gates, and packaging requirements.
- **Decision:** retained; the implementation branch must adopt it without weakening
  its gates.
- **Trace status:** originating private control-plane conversation excluded; the
  artifact must be reviewed when adopted by the clean branch.

## `CTL-003` — Establish clean-room and trace preflight

- **Observed problem:** the selected project is motivated by private professional
  experience, while the challenge requires agent traces and transfers broad rights in
  the submitted package. Recording a mixed-context development session would create
  originality and NDA risk.
- **Hypothesis:** a clean session boundary, public-source provenance, external private
  denylist, and blocking automated checks can prevent private material from entering
  product prompts or evidence.
- **Change:** added clean-room, trace, provenance, and preflight contracts; local-only
  exclusions; machine-readable configuration; evidence templates; a standard-library
  scanner; and unit tests.
- **Evaluation commands:**

  ```bash
  python3 -m unittest discover -s tests -p 'test_*.py'
  python3 scripts/preflight_check.py --phase control-plane
  python3 scripts/preflight_check.py --phase implementation
  ```

- **First result:** scanner returned `READY_FOR_CLEAN_BRANCH`; the first unit-test
  invocation failed because the dynamically imported module was not registered for
  Python 3.14 dataclass resolution.
- **Retry/change:** registered the module in `sys.modules` before executing it.
- **Final result:** five tests passed; control-plane with the local-only denylist returned
  `READY_FOR_CLEAN_BRANCH`; implementation returned `BLOCKED` with the expected seven
  unresolved gates.
- **Human checkpoint:** the user approved preflight preparation and deferred Git/branch
  transition until preparation was complete.
- **Decision:** retained. Proceed to a user-approved clean branch transition; do not
  start project specification or product-agent work in this conversation.
- **Trace status:** this summary is safe provenance evidence, but it is not presented
  as a representative trajectory. The clean branch must begin a new eligible trace.

## `CTL-004` — Apply independent review before the Git snapshot

- **Observed problem:** independent Claude Opus 5 review returned
  `PASS_WITH_CONCERNS`: the private boundary was physically inside the future worktree,
  a path match could disclose the protected filename, root agent instructions did not
  require the clean-room contracts, and the temporary validator introduced a second
  runtime unrelated to the TypeScript product.
- **Hypothesis:** moving private material outside the worktree and replacing the
  temporary validator with a dependency-free Node implementation will make the first
  Git snapshot both safer and simpler to reproduce.
- **Change:** moved the private denylist/raw-trace boundary outside the repository;
  routed root agent instructions through all clean-room contracts; replaced the
  temporary validator and tests with Node 22 standard-library equivalents; added
  redacted path findings, correct prefix handling, external-symlink blocking, binary
  review notices, content-aware implementation gates, safe Git absence handling, and
  repository self-scan coverage.
- **Evaluation commands:**

  ```bash
  npm test
  npm run preflight:control
  npm run preflight:implementation
  ```

- **Result:** ten Node tests passed. The real external-denylist control scan returned
  `READY_FOR_CLEAN_BRANCH` with only four expected binary-review notices for official
  reference evidence. The negative implementation scan remained blocked on the seven
  intended product/Git gates.
- **Human checkpoint:** the user explicitly chose a single Node/TypeScript toolchain
  before the snapshot and rejected carrying temporary Python code into the clean
  branch.
- **Decision:** retained. No Python source, tests, bytecode, or runtime requirement may
  enter the snapshot. Regenerate and verify the control-plane hashes before Git.
- **Trace status:** originating conversation remains excluded. The first clean task
  must materially review/harden this control and preserve that eligible trajectory.
