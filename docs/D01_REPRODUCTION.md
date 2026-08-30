# BG-D01 vertical slice reproduction

**Evaluation version:** `eval-v1.1.0`  
**Run classification:** unscored development demonstration  
**Requirements:** `FR-001`–`FR-010`, `NFR-001`–`NFR-008`, `EV-005`, `EV-006`, `AR-003`–`AR-007`

This path verifies one already-existing immutable synthetic museum-board migration.
It is not an official run, does not enter any benchmark denominator, invokes no
model, and does not repair either candidate.

## Clean setup and verification

```bash
npm ci
npm run task -- list
npm test
npm run task -- d01:verify
npm run task -- d01:manifests:check
npm run task -- d01:vertical:manifest:check
npm run task -- d01:hash
```

The last command must print the current manifest reconciliation digest:

```text
69894e4ab39484a89d300391317fc4a79d895c8790f8c1f7edb0f1a8ba6fdb92
```

The pre-review digest was
`5273199f8d591068ae827874d80352947eb511844fdf6ccabbcbce9edacccdcf`.
The current digest additionally records the scale-readiness correction package:
descriptor-owned paths/schemas/manifests, one executable source for the five visible
assertions, reciprocal process denial, double post-decision observations, measured
events, and evaluator/replay bindings. Candidate bytes, ground truth, and canonical
oracle outcomes did not change. The arm-visible package changed only to make its
existing five assertions and invariant contract code-owned and reusable.

Candidate source SHA-256 values remain:

- `candidate-a`: `f46b2ed8c85e8558b5c8812491c09d89530099b0890454415579ea4c5d69e8a5`
- `candidate-b`: `9e2a9151531aa961cf0ace3e20520fdcfa45ff0bff0f13ae214f7e5fbdad7d2b`

## Unscored end-to-end demonstration

```bash
npm run task -- d01:demo
```

The command writes only:

- `artifacts/evaluation/BG-D01-VERTICAL-SLICE.json`
- `artifacts/evaluation/BG-D01-VERTICAL-SLICE.html`
- `artifacts/evaluation/BG-D01-OFFLINE-REPLAY.jsonl`

Expected decisions for the frozen false-green `candidate-b` are:

| Arm | Pre-evaluator verdict | Post-decision correctness |
| --- | --- | --- |
| Status quo | `accept` after compilation and five visible tests | incorrect |
| BeyondGreen | `reject` after the oracle-free accumulation probe | correct |

`FixtureDescriptor` is the code-owned source for fixture/candidate IDs, paths,
schema versions, run identity, membership, and manifest bindings. The parent
validates the arm-visible package against its code-owned manifest and package digests,
recomputes both decisions from schema-validated raw arm evidence, then
recursively freezes and SHA-256 hashes them before either evaluator starts. Each arm
runs in a Node permission boundary that
can read only its candidate, the arm-visible package, reviewed workflow code, and
dependencies. It cannot read or enumerate `evaluation/verifier-only/BG-D01/`.
The decision-owning parent does not open the verifier-only manifest or package until
both decisions are final. It then starts a separate candidate-observer process twice
per arm. Both captures must have identical canonical observation digests; divergence
invalidates the run before evaluator start. The oracle-owning evaluator receives only
the validated observation pair plus the finalized decision; it never imports or
executes candidate code. The reciprocal physical test proves that the evaluator can
read its oracle package while both candidate trees remain capability-denied. All child
processes inherit no host `PATH` and run under
the macOS OS sandbox with network egress, DNS, and loopback denied. The evaluator
manifest is checked against a code-owned frozen digest, every listed source digest,
and the frozen package digest after decision finalization and before oracle execution.
The JSON records 18 measured monotonic events and derives execution-order/oracle
boundary claims from them. Pre-decision evaluator feedback therefore remains `K=0`
for this verified macOS path.

The arm-owned `ProbePlan` is derived from the risk inventory plus the arm-visible
invariant contract. It records that seeded-defect knowledge was not used. Both
candidates receive the same required probe contract. A failed probe emits a bounded
counterexample with at most five differing cards plus an omitted-count summary in
both JSON and HTML.

Each arm receives its own complete 180-second deadline: 165 seconds for arm work and
a separately enforced 15-second evaluator-finalization window. The status-quo arm
cannot consume any part of the BeyondGreen deadline, or vice versa. Arm crash,
timeout, invalid JSON, or invalid evidence produces one immutable `abstain` with no
retry. Evaluator failure or manifest/digest mismatch invalidates the entire run.

## Deterministic offline replay

Run the same submitted record twice:

```bash
npm run task -- d01:replay
npm run task -- d01:replay
```

Both lines must report identical JSON and HTML digests. The replay core validates
both finalized decision hashes, both deterministic observation pairs, each
evaluator-to-decision/input binding, every runner/worker capability proof,
measured-event-derived boundary claim, and the
stored JSON with Zod before rebuilding JSON and HTML entirely in memory. It imports no
filesystem, network, subprocess, clock, random, or workspace-write capability. The
small CLI wrapper reads the submitted JSON and prints digests; it does not write.

Each successful subprocess contributes two bound layers. The runner records the
actually applied macOS sandbox profile, Node permission model, hashed read allowlist,
network-denial policy, and empty host `PATH`; the worker records a hashed process
identity plus reciprocal allowed/denied filesystem probes. Finalized arm decisions,
observation captures, evaluator results, execution events, JSON, HTML, and offline
replay all retain or reference these proof digests. Missing, tampered, contradictory,
duplicate-process, reordered, or incomplete evidence fails closed.

Arm-visible package validation recursively enumerates the complete authorized root
before trusting manifest entries. It rejects unlisted regular files, symlinks,
path escapes, duplicate declarations, source mismatches, and manifest tamper.

## Safe clean-room checks

The private denylist is available only through the owner-approved scanner interface.
Do not print its value or path.

```bash
micro1-safe-preflight probe
micro1-safe-preflight control
micro1-safe-preflight implementation
git diff --check
```

## Accounting and limitations

The per-candidate evidence records measured UTC start/end timestamps, monotonic
duration, `development` membership, and evaluator `falseAlarm` values. Billing is a
fixed subscription. Per-run USD is `not_applicable` or `not_measured`;
it is not calculated, estimated, or capped. This checkpoint makes zero model calls
and records no exact configured model identity because none is machine-exported in
the task evidence. It performs no Chromium, browser, GUI, repair, official/scored
run, other fixture, commit, or push. The strict TypeScript compile scope is exactly
the `tsconfig.json` `include` list: candidate `*.ts`, arm-visible and verifier-only
`*.ts`, all `src/**/*.ts`, scalable `scripts/d*-*.ts`, the explicitly named task and
checksum entrypoints, `scripts/tasks/**/*.ts`, D-fixture tests, and the task-runner
test. JSON, MJS, Markdown, images, and historical Phase 0.5 control utilities outside
those patterns are not claimed as TypeScript-compiled; they have their own manifest,
runtime, preflight, or documentation checks. One development fixture cannot establish the
full 20-decision targets or production correctness. The current local runner fails
closed outside macOS because the approved D01 network-denial boundary uses
`/usr/bin/sandbox-exec`; a future cross-platform sandbox requires a separately
reviewed contract rather than a permissive fallback.
