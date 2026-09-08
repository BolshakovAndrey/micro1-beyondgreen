# BeyondGreen — Submission Report

## The decision we improve

BeyondGreen helps a frontend engineer decide whether a React state-to-signals migration
is safe to merge when compilation and inherited tests are already green. The status-quo
baseline accepts every such candidate. BeyondGreen inventories migration-specific risk,
derives arm-visible probes, executes the immutable candidate twice, and commits an
accept/reject/abstain decision before a physically isolated evaluator can reveal hidden
expectations.

The usable output is a schema-validated verdict and evidence bundle, with deterministic
JSON/HTML reporting and offline replay. The full official bundle is under
`artifacts/evaluation/official/RUN-BG-OFFICIAL-EVAL-V1.1.0-002-POSTDECISION-004/`.

## Measured result

Twenty frozen candidates span ten independently authored synthetic behavior classes.
Every candidate compiles and passes all visible legacy tests. Both arms receive the same
candidate bytes and one attempt per candidate.

| Metric | Status quo | BeyondGreen | Change / target |
| --- | ---: | ---: | ---: |
| Correct decisions | 10/20 | 19/20 | +9; target ≥16/20 |
| Reason-correct defect recall | 0/10 | 3/10 | +3; target ≥8/10 **missed** |
| Preserving candidates blocked | 0/10 | 1/10 | +1; target ≤2/10 |
| Completed decisions | 20/20 | 19/20 | -1; target ≥18/20 |

These are claims `CLM-001`–`CLM-004` in `artifacts/claims.yaml`. BeyondGreen met the
accuracy, advantage, false-alarm, and completion targets. It missed the stricter
reason-correct recall target: the frozen lexical matcher credited `3/10`, while seven
decision-correct rejects did not literally contain its verifier-owned class token or
failed-action label. This unchanged score is a strict operational proxy, not a count of all
semantically correct diagnoses. `BG-H06` preserving produced the single abstention. Neither
result is suppressed.

## Purposeful agent architecture

The status-quo arm is deterministic and makes no model call. The BeyondGreen arm uses
`gpt-5.6-sol` through the frozen `codex-exec-jsonl-v1` adapter exactly once per candidate,
with zero retries. Candidate, observer, and evaluator capabilities are separated by
process and filesystem policy. The evaluator starts only after both decisions are
immutable (`K=0`). Hashes bind candidate bytes, decisions, duplicate captures, evaluator
records, aggregates, and reports. Details and trust boundaries are in
[`ARCHITECTURE.md`](ARCHITECTURE.md).

## Reproduce fastest

On any platform with Node 22.22.3:

```bash
make setup
make eval
```

`make eval` is intentionally an offline verification of the committed official evidence;
it never reruns candidates or the model. On macOS, `make test` adds the complete
production isolation suite. See [`REPRODUCTION.md`](REPRODUCTION.md).

## What existed and what was built

Before the event there was no BeyondGreen product or benchmark. The official brief,
public clarifications, React, signals, jsdom, Zod, TypeScript, Node, Codex CLI, and Claude
CLI are external inputs/tools. During the event we created the clean-room specification,
ten synthetic fixtures, twenty candidates, two arms, process-isolated evaluation runtime,
tests, reports, traces, and submission evidence. Full provenance and limitations are in
[`DISCLOSURES.md`](DISCLOSURES.md).

## Development evidence and insight

The [Improvement Changelog](IMPROVEMENT_CHANGELOG.md) records retained changes, failed
attempts, and recovery. The highest-contributing retained decision was replacing
fixture-specific execution with descriptor-driven process boundaries and explicit
capabilities: it enabled all ten heterogeneous fixtures without sharing oracle data.
The removed experiment was the broad generation/repair product scope; it was cut before
the scored build because it diluted the qualification path.

The practical hot take: a process boundary does not remove correctness risk; it moves it
into transport vocabulary and cardinality. Our official failures occurred in launch,
observer, and evaluator bridges, not in model reasoning. Isolation deserves executable
contract tests just as much as the candidate being judged.

## Links

- Primary demo video: <https://youtu.be/R_AA3WqmVyw>
- Public video mirror: <https://vimeo.com/1222716472>
- Evaluation contract and honest target accounting: [`EVALUATION.md`](EVALUATION.md)
- Representative coding-agent trajectories: [`../artifacts/trajectories/index.yaml`](../artifacts/trajectories/index.yaml)
- Video: [`VIDEO_LINK.md`](VIDEO_LINK.md)
- Safety, provenance, and licensing: [`DISCLOSURES.md`](DISCLOSURES.md)

## Release state

Source, tests, official evidence, claims, reproduction, and a 1054-file config-derived
clean-extraction rehearsal are complete. The count includes the temporary rehearsal-only
manifest; the release payload itself contains 1053 files. The final 4:54 video uses `40+ ITERATIONS`; its
primary YouTube URL passed signed-out playback, and a public Vimeo mirror is recorded.
The final independent Claude checkpoint returned `PASS_WITH_CONCERNS` with no blocking
finding, and the owner approved ZIP creation after the complete release gates. Upload and
submission remain owner-controlled actions outside the archive-building step.
