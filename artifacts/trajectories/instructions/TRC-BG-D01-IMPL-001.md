# TRC-BG-D01-IMPL-001 — neutral implementation packet

## Purpose

Implement only the owner-approved BG-D01 foundation in a new neutral task under
`SES-20260829-004`. Use the frozen synthetic museum behavior and repository-relative
contracts only.

## Authorized implementation

- Arm-visible deterministic fixture API, React reference, and exactly five frozen
  visible tests.
- Two immutable signals candidates: one preserving and one with exactly the frozen
  lost-accumulation stale-snapshot defect family.
- Verifier-only canonical driver, ground truth, and D01-pair self-check.
- Node permission-system boundary proving both arms can read the candidate but cannot
  enumerate, read, hash, stat, realpath, or distinguish existence of verifier-only
  material.
- SHA-256 manifests, provenance, changelog, trajectory plan/index, checksum
  reconciliation, and a Russian owner-review companion.

## Required verification

```text
npm run compile
npm run test:d01:visible
npm run test:d01:verifier
npm run test:d01:boundary
npm run manifests:d01:check
npm test
npm run preflight:implementation
git diff --check
```

The real denylist is available only through the approved scanner interface. Its
value and path must not be printed or retained.

## Hard stops

No orchestrator beyond the minimal boundary harness, official/scored arm run, model
call, replay generation, Chromium, GUI, repair demo, other fixture, commit, or push.
Model invocation count remains zero. Stop for repository-owner review after the
checkpoint evidence and Russian companion are complete.

The exact configured Codex model identity is not machine-exported in this task
evidence. Repository records must use that limitation instead of claiming an exact
model name.
