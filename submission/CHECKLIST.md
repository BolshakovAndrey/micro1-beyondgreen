# Submission Qualification Checklist

## Qualification gate

- [x] Runnable source, pinned lockfile, tests, README, and reproduction guide exist.
- [x] Fair status-quo baseline and BeyondGreen use the same 20 frozen candidates.
- [x] Complete official per-candidate records, aggregates, failures, and offline replay ship.
- [x] Representative reviewed coding-agent trajectories are indexed.
- [x] Claims ledger maps judge-facing metrics to immutable evidence.
- [x] Four binary reference inputs received human visual review and are excluded.
- [x] Reviewed local video cut is under five minutes, decodes fully, and passed technical
      privacy and audio checks.
- [x] Confirm frame-by-frame that the public export exposes no recognizable real-product
      interface and that every legible value is synthetic; otherwise remove the fragment.
- [x] Replace stale “43 iterations” wording with `40+ ITERATIONS`, re-export, and verify
      the uploaded file's duration, SHA-256, and signed-out playback.
- [x] Public video URL is recorded and verified while signed out; a public Vimeo mirror
      is also recorded.
- [x] The config-derived 1054-file clean-extraction ZIP rehearsal (1053 release files plus
      its temporary rehearsal-only manifest) was repeated after the final Claude
      corrections, video metadata update, and submission documentation synchronization.
- [x] Final Claude read-only checkpoint has no unresolved blocking finding.
- [x] Safe scans, checksums, and both preflight checks pass on the final candidate.

## Rubric evidence

- [x] Problem & User Value — README and `docs/SUBMISSION_REPORT.md`.
- [x] Agent Solution & Engineering — architecture, isolation tests, traces, failure recovery.
- [x] End-to-End Quality — D01 demo, official report, and video script.
- [x] Measured Improvement — 10/20 baseline versus 19/20 BeyondGreen; complete records.
- [x] Reproducibility — commands documented and clean-extraction rehearsal passed.
- [x] Hot Take / Insights — final changelog summary and evidence-backed limitation.

The final archive must not be created while any item above remains unchecked.
