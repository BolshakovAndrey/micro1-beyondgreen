# Submission Artifact Harness — Specification

**Status:** subordinate but binding delivery contract

**Created:** 2026-08-28

**BeyondGreen amendment:** 2026-08-29, aligned with `PROJECT_SPEC.md@1.1.0`

**Audience:** developer building the solution and the evidence package

**Scope:** topic-independent artifact and packaging obligations
**Authoritative sources:** [CHALLENGE.md](CHALLENGE.md),
[HACKATHON_RULES.md](HACKATHON_RULES.md), and the preserved official PDF

`docs/PROJECT_SPEC.md` is the sole normative product-semantics contract. This file is
binding for delivery, evidence, command-surface, and packaging obligations but may
not override product semantics. Generic statements below describe the reusable
harness; current BeyondGreen values and stricter requirements come from
`docs/PROJECT_SPEC.md@1.1.0` and its projections.

### BeyondGreen v1.1 binding interpretation

- `baseline` means the status-quo verify-existing policy that accepts on green
  compilation and visible legacy tests.
- `advanced` or `solution` means BeyondGreen verification of the identical immutable
  candidate; neither term authorizes generation during a scored run.
- Evaluation contains ten fixtures, two candidates per fixture, two scored arms, and
  20 decisions per arm.
- The primary metric is decision accuracy `/20`; BPMR and a third scored arm are not
  active v1.1 semantics.
- Required interfaces are CLI, schema-validated JSON, and static HTML. A full GUI is
  not a delivery gate.

## 1. Goal

Build a topic-independent artifact harness that turns every meaningful development
iteration into a traceable, reproducible body of evidence and produces a validated
judge-ready ZIP plus an accessible video reference.

The harness is part of the submission, not post-hackathon documentation. A solution
is not release-ready unless its code, evaluation, claims, changelog, trajectories,
reproduction instructions, disclosures, and package manifest agree with one another.

## 2. Operating model

This specification forms the delivery control plane. Implementation begins only
after final human approval of normative v1.1 in a submission-eligible trace-first
task and must produce the artifacts defined here.

The selected topic is BeyondGreen and is projected through `config/topic.yaml`.
Topic-specific values may add evidence but must not remove or weaken any artifact,
validation, or release gate in this specification.

The harness must support five moments in the project lifecycle:

1. **Initialize:** create the required structure from a Topic Profile.
2. **Freeze baseline:** record the fair comparison before advanced optimization.
3. **Record iteration:** connect each meaningful change to hypothesis, evaluation,
   evidence, and decision.
4. **Build release candidate:** rerun baseline and advanced solution on the fixed
   evaluation set and generate judge-facing summaries.
5. **Package:** validate completeness and safety, then create the final ZIP and video
   reference.

## 3. Judge-facing outcomes

The final package must make these questions answerable without private context:

1. Who experiences the problem, and why does the bottleneck matter?
2. Why is an agent appropriate, and which engineering decisions improved the result?
3. Does one realistic workflow complete end to end with a usable output?
4. How much better is it than a fair, runnable baseline?
5. Can a reviewer reproduce the main result from a clean environment?
6. What failed, what was removed, and what practical reliability insight emerged?
7. Which coding agents and solution agents were used, and where are their
   representative trajectories?
8. Does the archive contain everything required without credentials, private data,
   or inaccessible dependencies?

## 4. Required repository contract

The implementation branch must converge on the following logical structure. Exact
subdirectories may be extended, but required paths and meanings are stable.

```text
.
├── README.md
├── LICENSES.md
├── Makefile
├── config/
│   └── topic.yaml
├── docs/
│   ├── SUBMISSION_REPORT.md
│   ├── ARCHITECTURE.md
│   ├── EVALUATION.md
│   ├── IMPROVEMENT_CHANGELOG.md
│   ├── REPRODUCTION.md
│   ├── DISCLOSURES.md
│   ├── VIDEO_SCRIPT.md
│   └── VIDEO_LINK.md
├── evaluation/
│   ├── cases.jsonl
│   ├── scoring-rubric.yaml
│   ├── challenging-cases.yaml
│   ├── arm-visible/
│   └── verifier-only/
├── artifacts/
│   ├── claims.yaml
│   ├── runs/
│   │   ├── baseline/
│   │   ├── advanced/
│   │   ├── repair-demo/
│   │   ├── performance-secondary/
│   │   └── replay/
│   ├── evaluator-controls/
│   ├── oracle-access-denial/
│   ├── comparisons/
│   ├── trajectories/
│   │   ├── index.yaml
│   │   ├── coding-agents/
│   │   └── solution-agents/
│   ├── demo/
│   └── provenance/
├── scripts/
│   └── ...
├── submission/
│   ├── MANIFEST.yaml
│   ├── CHECKLIST.md
│   └── SHA256SUMS
└── dist/
    └── submission.zip
```

`dist/` is generated and must not be treated as source. Raw local traces may be kept
outside the repository while they contain sensitive data, but only sanitized,
reviewed traces may enter `artifacts/trajectories/` or the final ZIP.

## 5. Topic Profile contract

`config/topic.yaml` is the selected-topic projection for the generic scaffold. It
contains the fields below plus stricter BeyondGreen v1.1 fields. The intentionally
unresolved signals-package decision is governed by `PROJECT_SPEC.md` section 20 and
must be resolved in Phase 0.5 before fixture work.

```yaml
schema_version: "1.1"
project:
  name: ""
  one_sentence_summary: ""
user:
  persona: ""
  bottleneck: ""
  practical_value: ""
workflow:
  realistic_scenario: ""
  usable_output: ""
baseline:
  description: ""
  fairness_rationale: ""
agent_solution:
  necessity: ""
  capabilities: []
evaluation:
  primary_metric: ""
  primary_metric_direction: "higher_is_better"
  success_threshold: ""
  minimum_case_count: 10
  challenging_case_ids: []
data:
  source: ""
  license_or_permission: ""
  privacy_classification: "public_or_synthetic"
safety:
  consequential_actions: false
  human_review_required: false
  boundaries: []
```

The profile is invalid when the primary metric, baseline, realistic scenario, data
provenance, or user value is missing. `minimum_case_count` may exceed 10 but may not
be lower when the chosen task permits ten cases.

## 6. Stable command surface

The implementation may choose any language or internal tools, but the repository
must expose these exact top-level commands through `make`:

| Command | Required outcome |
| --- | --- |
| `make setup` | Install or verify pinned dependencies from a clean environment. |
| `make baseline` | Run the simple baseline and write a versioned baseline run. |
| `make solution` | Run the advanced agent solution and write a versioned advanced run. |
| `make test` | Run deterministic unit/integration/contract tests. |
| `make eval` | Evaluate baseline and advanced solution on the same fixed cases. |
| `make replay` | Reproduce submitted reports from offline records without credentials. |
| `make demo` | Run one realistic end-to-end scenario and preserve its usable output. |
| `make artifacts-check` | Validate all schemas, links, claims, traces, disclosures, and release gates without modifying source evidence. |
| `make submission` | Build `dist/submission.zip` only after every blocking check passes. |

Every command must be documented in `docs/REPRODUCTION.md`, return a non-zero exit
code on failure, and avoid requiring interactive secrets for judge reproduction.

## 7. Artifact contracts

### 7.1 README and Submission Report

`README.md` is the entry point for running the project. `docs/SUBMISSION_REPORT.md`
is the entry point for judging the evidence. Together they must contain:

- intended user, bottleneck, and practical value;
- one realistic end-to-end scenario and description of the usable output;
- fair baseline and advanced solution;
- primary comparison table with baseline, advanced result, and change;
- agent architecture and purposeful design rationale;
- fastest clean-environment reproduction path;
- limitations, known failures, and safety boundaries;
- links to changelog, evaluation evidence, trajectories, disclosures, and video;
- explicit statement of what existed before the event and what was built during it.

Every numerical or qualitative performance claim in these documents must have a
stable claim ID present in `artifacts/claims.yaml`.

### 7.2 Claims ledger

`artifacts/claims.yaml` is the machine-checkable index from judge-facing statements to
evidence. Each claim must contain:

```yaml
- id: "CLM-001"
  statement: ""
  rubric_criteria: []
  metric: ""
  baseline_value: null
  advanced_value: null
  evidence_paths: []
  run_ids: []
  limitations: ""
```

Every referenced path and run ID must exist. Unsupported claims are release blockers.
Claims may report neutral or negative results; the harness must not suppress them.

### 7.3 Evaluation set and scoring

The evaluation contract must be defined before optimization and preserved in version
control:

- `evaluation/cases.jsonl` contains stable case IDs and inputs or references to
  redistributable inputs;
- baseline and advanced solution receive the same cases and scoring procedure;
- at least ten cases are used when the task allows it;
- at least one challenging case is labeled before final evaluation;
- `evaluation/scoring-rubric.yaml` defines the primary metric, direction, scoring
  rules, aggregation, tie handling, and success threshold;
- human scoring, if used, records the rubric, reviewer role, and per-case result;
- time, cost, and failure rate are recorded when material to the value claim;
- complete per-case results are retained, not only aggregates.

Changing evaluation cases or scoring after seeing results requires a changelog entry,
a reason, and a new evaluation-set version. The previous version remains preserved.

For BeyondGreen v1.1, `cases.jsonl` and its linked manifests must represent exactly
ten fixtures, one preserving and one false-green candidate per fixture, a 4/6
development/held-out split, and the same 20 candidates for both arms. The scoring
rubric must encode decision accuracy `/20`, defect recall `/10`, false-alarm rate
`/10`, completion `/20`, the status-quo advantage, and all five frozen targets from
`PROJECT_SPEC.md` section 9.

### 7.4 Run record

Every baseline, advanced, evaluation, and demo execution used as evidence must have a
unique immutable `run_id` and a metadata record containing at least:

```yaml
schema_version: "1.1"
run_id: ""
run_type: "baseline|advanced|evaluation|demo|repair_demo|performance_secondary|replay"
started_at_utc: ""
finished_at_utc: ""
git_commit: ""
working_tree_dirty: false
config_hash: ""
evaluation_set_version: ""
command: ""
environment: {}
models_and_tools: []
case_ids: []
exit_status: 0
human_time_seconds: null
machine_time_seconds: null
estimated_cost_usd: null
output_paths: []
log_paths: []
```

The result payload must preserve per-case outcomes and errors. A failed run may be
evidence but cannot silently replace a successful release run.

### 7.5 Improvement Changelog

`docs/IMPROVEMENT_CHANGELOG.md` must begin with the frozen baseline and contain one
entry for every meaningful experiment, including discarded experiments. Each entry
has a stable ID and must record:

- observed problem or failure mode;
- hypothesis;
- exact change tested;
- evaluation command and evaluation-set version;
- before/after result or other evidence;
- evidence paths and run IDs;
- decision: `kept`, `revised`, or `removed`;
- what the result changed next;
- relevant human checkpoint.

The final section must identify the highest-contributing retained change, one removed
experiment, the main remaining failure mode, and the practical hot take about
building more reliable agents.

### 7.6 Agent trajectories

The trajectory index must disclose every coding agent and every agent inside the
submitted solution. For each agent, it records:

```yaml
- agent_id: ""
  category: "coding_agent|solution_agent"
  tool_and_model: ""
  purpose: ""
  instructions_path: ""
  representative_trace_paths: []
  related_iteration_ids: []
  redaction_review: "passed"
```

Representative traces must be readable in chronological order and include, where
they occurred:

- agent instructions and relevant context;
- actions and tool responses;
- feedback that shaped the next action;
- retries, errors, and recovery;
- human decisions or approval checkpoints;
- final result or explicit failure.

Polished summaries alone are not valid trajectories. Raw transcripts may be included
alongside a short index, but secrets, personal data, unrelated private context, and
machine-specific tokens must be removed. Redaction must not alter the technical
meaning of the trace.

### 7.7 Architecture and engineering rationale

`docs/ARCHITECTURE.md` must map each agent, tool, memory/context mechanism,
verification step, safeguard, and human checkpoint to a concrete bottleneck or
observed failure. Components without a stated purpose are not credited as evidence of
engineering quality.

The document must include at least one end-to-end sequence, error/fallback behavior,
trust boundaries, and the location of tests covering the most important contracts.

### 7.8 Reproduction guide

`docs/REPRODUCTION.md` must assume a reviewer starts from a clean supported
environment. It must state:

- supported OS/runtime and pinned dependency versions;
- hardware, storage, network, and optional service requirements;
- data acquisition or synthetic-data generation steps;
- exact commands for setup, baseline, solution, tests, evaluation, demo, validation,
  and packaging;
- expected output paths and example success indicators;
- approximate runtime and cost for each material command;
- deterministic controls and known sources of variance;
- offline or fixture-based path when external services are not available, if the
  core result can reasonably support it;
- troubleshooting for known reproducibility failures.

No judge-critical step may depend on an undocumented local file, shell history,
private branch, or developer-only environment variable.

### 7.9 Demo and video

`make demo` must preserve one realistic, self-contained run and its final usable
output under `artifacts/demo/`. The demo evidence must identify its run ID and must
not be a hand-authored mock result presented as an execution.

`docs/VIDEO_SCRIPT.md` must fit within five minutes and cover, in order:

1. intended user and bottleneck;
2. simple baseline;
3. one end-to-end solution execution;
4. final baseline-versus-solution comparison;
5. short improvement changelog;
6. highest-contributing change;
7. one removed experiment;
8. remaining failure mode and hot take.

`docs/VIDEO_LINK.md` must contain the final URL and an access-check record confirming
that a signed-out reviewer can open it without requesting permission. The video file
itself is not required inside the ZIP unless the platform explicitly asks for it.

### 7.10 Disclosures, provenance, and safety

`docs/DISCLOSURES.md` and `artifacts/provenance/` must identify:

- components and data that existed before the event;
- components created during the event;
- third-party libraries, services, models, datasets, and licenses/terms;
- data source and permission for every submitted input set;
- coding agents used to build the project;
- consequential actions, sandboxing, and approval boundaries;
- qualified human review where the solution can significantly affect a person;
- known privacy, safety, licensing, and reliability limitations.

The repository, logs, traces, screenshots, demo, and ZIP must be scanned for secrets
and private information before packaging. A finding blocks the package; automatic
redaction without human review is insufficient for release.

### 7.11 Submission manifest and archive

`submission/MANIFEST.yaml` must enumerate every required judge artifact, its path,
purpose, rubric criteria, inclusion status, and SHA-256 digest. `SHA256SUMS` must cover
all files placed in the final ZIP except itself when tooling limitations require that
exception to be documented.

`make submission` must produce one archive containing source code, required
configuration/instructions, tests, README, judge-facing documents, evaluation data
that may legally be redistributed, evidence, and coding-agent traces.

For BeyondGreen, redistributable `evaluation/arm-visible/` and
`evaluation/verifier-only/` packages, evaluator-control reports, and denied-access
evidence are mandatory archive contents. Runtime process/filesystem capabilities
enforce oracle isolation; verifier-only artifacts are not hidden by omitting them
from the reproducible archive.

The archive must exclude at minimum:

- credentials, `.env` values, tokens, cookies, and private keys;
- personal or non-shareable data;
- `.git/`, caches, virtual environments, dependency directories, and temporary files;
- unreviewed raw traces;
- generated artifacts not referenced by the manifest;
- files whose license or terms prohibit redistribution.

Extracting the ZIP into a clean temporary directory and following
`docs/REPRODUCTION.md` is the definitive release test.

## 8. Rubric-to-evidence matrix

| Criterion | Weight | Mandatory primary evidence |
| --- | ---: | --- |
| Problem & User Value | 15 | Topic Profile, README, Submission Report, realistic scenario |
| Agent Solution & Engineering | 30 | Architecture, instructions, tests, trajectories, iteration evidence, failure handling |
| End-to-End Quality | 20 | `make demo`, preserved demo run, usable output, acceptance evidence, video |
| Measured Improvement | 15 | Frozen baseline, fixed evaluation, per-case results, comparison, Improvement Changelog |
| Reproducibility | 15 | pinned setup, exact commands, run metadata, clean extraction test, manifest |
| Hot Take / Insights | 5 | main failure mode, removed experiment, evidence-backed practical lesson |

Tie-break priorities make Agent Solution & Engineering, Reproducibility, and Measured
Improvement the highest-priority evidence categories when schedule trade-offs are
required.

## 9. Release gates

### Gate A — Topic ready

- Topic Profile contains no placeholders.
- User, bottleneck, scenario, usable output, fair baseline, primary metric, data
  provenance, and safety boundaries are explicit.
- Ten or more feasible evaluation cases are planned when applicable.

### Gate B — Baseline frozen

- Baseline is runnable with `make baseline`.
- Evaluation cases and scoring contract are versioned before advanced optimization.
- Baseline run, per-case results, environment metadata, runtime, and material cost are
  preserved.

### Gate C — Iteration evidence complete

- Every meaningful retained or removed experiment has a changelog entry.
- Every entry points to existing run IDs and evidence.
- Representative coding-agent trajectories cover the decisions used in the final
  solution.

### Gate D — Final evidence complete

- Baseline and advanced solution were evaluated on the same fixed case version.
- Aggregate claims reconcile with per-case results.
- Challenging-case result, failures, limitations, highest-contributing change,
  removed experiment, and hot take are documented.
- One realistic end-to-end demo produces a usable output.

### Gate E — Reproducible and safe

- A clean extracted copy passes setup, tests, baseline, solution, evaluation, and
  artifact checks using documented commands.
- Required dependencies and data are accessible under documented terms.
- Secret/private-data scan and human redaction review pass.
- No judge-critical links require authentication or permission requests.

### Gate F — Package ready

- Manifest contains all required files and matching checksums.
- `dist/submission.zip` is the only final source-and-traces archive.
- The accessible video URL is recorded and tested while signed out.
- `submission/CHECKLIST.md` records PASS for every qualification and rubric evidence
  requirement.

Any failed gate blocks `make submission`.

## 10. Falsifiable requirements

1. **Topic-independent initialization**
   - Current: the generic harness and BeyondGreen v1.1 topic projection exist; no
     product code, fixture, candidate, or benchmark result exists.
   - Target: the harness can create all required artifact paths without knowing the
     domain implementation details.
   - Acceptance: initialization produces every required path with explicit incomplete
     markers, and `make artifacts-check` reports those markers as blockers rather
     than silently passing.

2. **Late-bound Topic Profile**
   - Current: BeyondGreen is selected and projected through `config/topic.yaml`.
   - Target: all domain-specific requirements remain consistent with normative v1.1
     and populate judge-facing artifacts without weakening generic gates.
   - Acceptance: a schema-valid filled profile passes; a profile missing user,
     baseline, metric, data provenance, or safety boundaries fails validation.

3. **Fair baseline evidence**
   - Current: no baseline implementation or result exists.
   - Target: the baseline is independently runnable and evaluated on the same cases
     and scoring contract as the advanced solution.
   - Acceptance: the validator rejects comparisons with different case-set versions
     or scoring versions unless explicitly recorded as non-comparable.

4. **Immutable evidence runs**
   - Current: no structured run records exist.
   - Target: every claim-bearing run has a unique ID, metadata, complete results, and
     linked outputs.
   - Acceptance: duplicate run IDs, missing required metadata, absent outputs, or
     dangling case references fail `make artifacts-check`.

5. **Evidence-linked claims**
   - Current: no claim ledger exists.
   - Target: each result claim maps to rubric criteria, run IDs, and concrete files.
   - Acceptance: every claim referenced in README or Submission Report resolves to
     existing evidence; an unsupported or dangling claim blocks packaging.

6. **Complete Improvement Changelog**
   - Current: no implementation iterations exist.
   - Target: baseline and every meaningful retained, revised, or removed experiment
     are documented with hypothesis, evidence, and decision.
   - Acceptance: all referenced iteration/run/evidence IDs resolve, and the final
     section names the strongest change, one removed experiment, main failure, and
     hot take.

7. **Representative agent trajectories**
   - Current: no agent trace inventory exists.
   - Target: every disclosed coding or solution agent has instructions and at least
     one representative trace showing the real path from context through result or
     failure.
   - Acceptance: agents without trace paths, instructions, purpose, or completed
     redaction review block packaging.

8. **Clean reproduction**
   - Current: no runnable solution exists.
   - Target: a reviewer can execute all stable commands from an extracted archive
     using only documented prerequisites.
   - Acceptance: the clean-extraction release test finishes successfully and records
     command, environment, duration, and exit status.

9. **End-to-end usable result**
   - Current: no topic or workflow exists.
   - Target: one realistic scenario completes from input to user-usable output and is
     preserved as demo evidence.
   - Acceptance: `make demo` exits successfully, produces the documented output, and
     emits a demo run ID referenced by the report and video script.

10. **Safe, complete package**
    - Current: no final archive exists.
    - Target: one manifest-backed ZIP contains all and only redistributable required
      source, evidence, documents, tests, and traces.
    - Acceptance: schema, link, checksum, placeholder, secret, privacy, license,
      video-access, and clean-extraction checks all pass before archive creation.

## 11. Global acceptance criteria

- [ ] All required repository paths exist and are listed in the manifest.
- [ ] Topic Profile passes schema and placeholder validation.
- [ ] Baseline and advanced solution use the same evaluation-set and scoring versions.
- [ ] The evaluation has at least ten cases when applicable and at least one labeled
  challenging case.
- [ ] Primary metric and success threshold were versioned before final optimization.
- [ ] Every aggregate result can be recomputed from submitted per-case results.
- [ ] Every judge-facing claim resolves through `artifacts/claims.yaml`.
- [ ] Every meaningful iteration has an evidence-linked changelog entry.
- [ ] Highest-contributing change and one removed experiment are identified.
- [ ] Main observed failure mode and practical hot take are evidence-backed.
- [ ] Every coding and solution agent is disclosed and has representative sanitized
  trajectories.
- [ ] One realistic end-to-end demo run produces a usable artifact.
- [ ] Reproduction commands cover setup, baseline, solution, test, evaluation, demo,
  validation, and packaging.
- [ ] A clean extracted archive passes the documented release test.
- [ ] No credentials, private data, inaccessible links, or prohibited third-party
  material appear in the package.
- [ ] Video is five minutes or less and is accessible without permission requests.
- [ ] Final archive checksums match `submission/SHA256SUMS`.
- [ ] `submission/CHECKLIST.md` records a pass for qualification gate and every rubric
  evidence category.

## 12. Deferred BeyondGreen scope

Until mandatory v1.1 gates pass, the delivery harness excludes generation-migration
scoring, a third scored arm, a full GUI, a broad mutation catalog, primary
performance claims, and nonessential control documents. Exact package/model choices
belong to Phase 0.5; fixtures, candidates, implementations, results, video recording,
and hosting remain future work after explicit human approval. No later choice may
invalidate this artifact or release contract.

## 13. Definition of done for the harness

The harness is complete when a developer can supply a valid Topic Profile, use the
stable commands throughout development, and obtain either:

- a deterministic list of unresolved judge-evidence blockers; or
- a validated `dist/submission.zip`, checksum manifest, completed checklist, and
  confirmed public video reference.

It must be impossible for the packaging command to succeed when required evidence is
missing, inconsistent, unsafe, inaccessible, or unsupported by submitted runs.
