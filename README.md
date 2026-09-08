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
| Decision accuracy | `10/20` | `19/20` | ≥ 16/20 — met |
| Accuracy advantage over baseline | — | `+9/20` | ≥ 6/20 — met |
| Reason-correct defect recall | `0/10` | `3/10` | ≥ 8/10 — **missed** |
| False alarms on preserving candidates | `0/10` | `1/10` | ≤ 2/10 — met |
| Completion | `20/20` | `19/20` | ≥ 18/20 — met |

Targets were predeclared in [`docs/EVALUATION.md`](docs/EVALUATION.md) before any fixture
was written. Where a target is missed, both the unchanged target and the honest result are
published. `BG-H02` (async ordering) was labeled the challenging case before its code
existed.

The single incomplete decision is a preserving-case abstention on `BG-H06`. The frozen
reason-correct scorer credited `3/10` through a strict lexical proxy: a normalized rationale
must literally contain the verifier-owned behavior-class token or failed-action label. Seven
decision-correct rejects did not match that token contract, even when their explanations were
diagnostically specific; the unchanged `3/10` therefore measures this strict operational
proxy, not all semantically correct diagnoses. Full comparison and challenging-case analysis:
[`docs/EVALUATION.md`](docs/EVALUATION.md).

---

## Demo video

- Primary, verified without sign-in: [YouTube](https://youtu.be/R_AA3WqmVyw)
- Public backup mirror: [Vimeo](https://vimeo.com/1222716472)

The final cut is 4:54, below the five-minute limit. It includes the problem, fair
baseline, complete workflow, measured comparison, strongest retained change, removed
scope, honest limitation, and the evidence-backed hot take.

---

## Quick start

Requires Node `22.22.3` (see `.node-version`). Runtime dependencies are React,
`@preact/signals-react`, jsdom, and Zod; tests run on `node:test`.

```bash
make setup                    # pinned install: npm ci --ignore-scripts
npm run task -- list          # every supported task, with descriptions
npm test                      # the whole ordinary suite
npm run task -- d01:demo      # macOS only: physical sandbox, JSON + static HTML
npm run task -- d01:replay    # deterministic replay, no network, no subprocess
npm run task -- replay --evaluation-version eval-v1.1.0 # official evidence replay
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

Isolating the oracle in its own process is what makes a verdict checkable, but it
relocates the risk instead of removing it — every official run we lost failed in the
infrastructure around that boundary (the pre-arm launcher, then the observer bridge,
then the evaluator transcript) and none of them failed in the agent's reasoning, which is
why a process boundary needs the same asserted vocabulary, cardinality, and schemas you
would demand of the code it is judging.

Evidence: [`docs/IMPROVEMENT_CHANGELOG.md`, ITR-043 onward](docs/IMPROVEMENT_CHANGELOG.md#itr-043--harden-and-rehearse-post-decision-observer-execution).

## Agent trajectories

Representative coding-agent trajectories with instructions, tool responses, retries, and
human checkpoints: [`artifacts/trajectories/`](artifacts/trajectories/), indexed in
[`artifacts/trajectories/index.yaml`](artifacts/trajectories/index.yaml).

---

## For reviewers who want the engineering detail

Task catalog, fixture-by-fixture verification, immutable manifests, clean-room and trace
policies, and the phase history are documented separately:

- [`docs/REVIEWER_GUIDE.md`](docs/REVIEWER_GUIDE.md) — task catalog and what each command proves
- [`docs/SUBMISSION_REPORT.md`](docs/SUBMISSION_REPORT.md) — concise evidence-first judging report
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — components, process boundaries, and data flow
- [`docs/PROJECT_SPEC.md`](docs/PROJECT_SPEC.md) — normative product contract
- [`docs/EVALUATION.md`](docs/EVALUATION.md) — evaluation methodology and metrics
- [`docs/REPRODUCTION.md`](docs/REPRODUCTION.md) — safe judge path and official offline replay
- [`docs/DISCLOSURES.md`](docs/DISCLOSURES.md) — provenance, tools, safety, and honest limits
- [`docs/D01_REPRODUCTION.md`](docs/D01_REPRODUCTION.md) — evidence paths and limitations for the D01 slice
- [`docs/CLEAN_ROOM_POLICY.md`](docs/CLEAN_ROOM_POLICY.md), [`docs/TRACE_POLICY.md`](docs/TRACE_POLICY.md), [`docs/PROVENANCE.md`](docs/PROVENANCE.md)

## Scope and honest limits

- The benchmark is synthetic. Fixtures were authored independently per fixture, but they
  are not production code, and generalization to real repositories is not demonstrated.
- v1 covers React state to signals only.
- The official adapter was `codex-exec-jsonl-v1` with `gpt-5.6-sol`, one invocation per
  BeyondGreen candidate and zero retries. Fixed-subscription marginal USD and stable
  token totals were not measured.
