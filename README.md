# BeyondGreen

**Verify a React state-to-signals migration that your tests already call green.**

A migration that compiles and passes every legacy test can still be broken. BeyondGreen
takes an existing, immutable candidate, inventories what the migration puts at risk,
derives behavioral probes from evidence the arm can actually see, executes them against
a physically isolated oracle, and returns an evidence bundle with an accept / reject /
abstain decision.

> Green compilation and legacy tests are evidence, not proof.

---

## Who has this problem

A frontend engineer migrating mature React code from `useState`-style state to signals.

The code is inherited, it is slow, and the suite that came with it was written for the
old implementation. It checks what the component renders. It does not check the things a
signals migration actually breaks: update ordering, identity stability, subscription
cleanup, lifecycle, rollback.

**The bottleneck.** The engineer has to decide whether to merge, and a green suite is the
only signal available. There is no cheap way to tell a faithful migration apart from one
that quietly changed an unobserved invariant. So teams either merge on hope, or keep the
slow code — and both outcomes cost real money.

**Why solving it matters.** The failure is silent and it ships. It surfaces later as a
lost update, a stale card, a leaked subscription — far from the commit that caused it,
where it is orders of magnitude more expensive to find.

---

## Results

Ten synthetic fixtures, ten behavior classes, twenty frozen candidates: ten that preserve
behavior and ten with a single seeded defect. **All twenty compile and pass 100% of their
visible legacy tests at freeze**, which is what makes the benchmark hard.

| Metric | Status quo baseline | BeyondGreen | Target |
|---|---|---|---|
| Decision accuracy | `[[x]]/20` | `[[x]]/20` | ≥ 16/20 |
| Accuracy advantage over baseline | — | `[[x]]/20` | ≥ 6/20 |
| Defect recall | `[[x]]/10` | `[[x]]/10` | ≥ 8/10 |
| False alarms on preserving candidates | `[[x]]/10` | `[[x]]/10` | ≤ 2/10 |
| Completion | `[[x]]/20` | `[[x]]/20` | ≥ 18/20 |

Targets were predeclared in [`docs/EVALUATION.md`](docs/EVALUATION.md) before any fixture
was written. Where a target is missed, both the unchanged target and the honest result are
published. `BG-H02` (async ordering) was labeled the challenging case before its code
existed.

Full comparison, per-candidate records, and the challenging-case analysis:
[`docs/EVALUATION.md`](docs/EVALUATION.md).

---

## Quick start

Requires Node `22.22.3` (see `.node-version`). Runtime dependencies are React,
`@preact/signals-react`, jsdom, and Zod; tests run on `node:test`.

```bash
npm ci
npm run task -- list          # every supported task, with descriptions
npm test                      # 209 tests
npm run task -- d01:demo      # one full verification, JSON + static HTML
npm run task -- d01:replay    # deterministic replay, no network, no subprocess
```

`d01:demo` writes the evidence bundle to
`artifacts/evaluation/BG-D01-VERTICAL-SLICE.html` — open it to see what the engineer
actually receives.

Full reproduction from a clean environment, including the baseline arm, the scored run,
expected output, runtime and cost: [`docs/REPRODUCTION.md`](docs/REPRODUCTION.md).

**Platform limit.** The isolation runner uses macOS `/usr/bin/sandbox-exec` to deny
network egress on top of Node's permission model. It fails closed on other platforms
rather than silently weakening isolation. Deterministic replay works everywhere.

---

## How it works

Both arms receive the same immutable candidate, the same visible inputs, the same
environment, and exactly one attempt.

| | Status quo | BeyondGreen |
|---|---|---|
| Inputs | candidate, compilation, visible legacy tests | identical |
| Method | accept if compilation and all visible tests pass | risk inventory → derived probes → independent execution |
| Oracle visibility | none | none until the verdict is immutable |

Four design choices carry most of the result:

**The oracle is a separate process, not a flag.** The arm cannot enumerate, read, hash, or
error-probe the verifier-only package, and the reciprocal probe proves the evaluator
cannot read the candidates either. Both denials are asserted in tests, not assumed.

**`K=0`.** Zero evaluator-derived feedback or repair rounds reach the arm before its
verdict is final. The evaluator process starts only after both arms have committed.

**The candidate is immutable.** It is hash-checked before and after every run. BeyondGreen
never repairs during a scored run — once the artifact under judgement changes, the verdict
can no longer be checked against a fixed ground truth.

**Every claim is bound to recorded evidence.** Canonical JSON, a hash chain over the
reasoning record, and an offline replay that independently rebuilds both the JSON and the
HTML and rejects tampering.

Architecture, requirement IDs, and the full contract: [`docs/PROJECT_SPEC.md`](docs/PROJECT_SPEC.md).

---

## Improvement changelog

How the solution got here, which change moved which number, and the experiments that were
removed: [`docs/IMPROVEMENT_CHANGELOG.md`](docs/IMPROVEMENT_CHANGELOG.md).

## Hot take

`[[Одно предложение + ссылка на раздел — задача 3]]`

## Agent trajectories

Representative coding-agent trajectories with instructions, tool responses, retries, and
human checkpoints: [`artifacts/trajectories/`](artifacts/trajectories/), indexed in
[`artifacts/trajectories/index.yaml`](artifacts/trajectories/index.yaml).

---

## For reviewers who want the engineering detail

Task catalog, fixture-by-fixture verification, immutable manifests, clean-room and trace
policies, and the phase history are documented separately:

- [`docs/REVIEWER_GUIDE.md`](docs/REVIEWER_GUIDE.md) — task catalog and what each command proves
- [`docs/PROJECT_SPEC.md`](docs/PROJECT_SPEC.md) — normative product contract
- [`docs/EVALUATION.md`](docs/EVALUATION.md) — evaluation methodology and metrics
- [`docs/D01_REPRODUCTION.md`](docs/D01_REPRODUCTION.md) — evidence paths and limitations for the D01 slice
- [`docs/CLEAN_ROOM_POLICY.md`](docs/CLEAN_ROOM_POLICY.md), [`docs/TRACE_POLICY.md`](docs/TRACE_POLICY.md), [`docs/PROVENANCE.md`](docs/PROVENANCE.md)

## Scope and honest limits

- The benchmark is synthetic. Fixtures were authored independently per fixture, but they
  are not production code, and generalization to real repositories is not demonstrated.
- v1 covers React state to signals only.
- `[[Строка про live adapter — заполнить после прогона]]`
