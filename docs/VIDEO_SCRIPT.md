# Final Demo Video Script

**Uploaded final cut:** 4:54.31, 1920×1080, H.264/AAC<br>
**Uploaded-file SHA-256:** `78dbefc9868a1734ae416478403386ede80a6d3c0545ee67a66d4a677e3f6d80`<br>
**Primary URL:** <https://youtu.be/R_AA3WqmVyw><br>
**Backup mirror:** <https://vimeo.com/1222716472>

The uploaded cut uses “more than forty iterations” / `40+ ITERATIONS`, because the
committed changelog runs through ITR-044. It does not show local paths, candidate source,
verifier-only data, raw traces, private identifiers, or credentials. The final card also
discloses: `Built by one engineer with AI-agent assistance`.

1. **0:00–1:09 — real problem and contextual evidence.** Show the privacy-reviewed,
   deliberately blurred context fragment only as evidence that the user problem is real.
   The underlying product must be unrecognizable, and any legible values must be
   synthetic. Explain that a React state-to-signals migration can reduce rendered work while
   still leaving behavioral correctness uncertain. The measured synthetic spike reduced
   card renders by 20.83%, but did not demonstrate a CPU improvement.
2. **1:09–1:36 — the fair benchmark.** Show that all twenty frozen candidates compile
   and pass their visible legacy tests. The status-quo arm therefore accepts all twenty
   and is correct only on the ten preserving candidates.
3. **1:36–2:00 — unscored vertical-slice evidence.** Show D01 as an explicitly unscored
   development demonstration: baseline accepts the false green while BeyondGreen rejects
   it. Do not present this slice as the official result.
4. **2:00–3:14 — end-to-end BeyondGreen flow.** Show immutable candidate identity, risk
   inventory, derived probes, two isolated captures, `K=0`, and a decision fixed before
   the verifier-only oracle is available. Explain that `reject` and `abstain` block merge,
   and that offline replay needs neither credentials nor a model call.
5. **3:14–3:55 — official comparison.** Show the committed official report: 10/20 for
   status quo versus 19/20 for BeyondGreen, a +9/20 advantage; one preserving candidate
   blocked; 19/20 completion. State plainly that reason-correct defect recall is 3/10 and
   missed the frozen 8/10 target. Mention the `BG-H06` abstention.
6. **3:55–4:24 — improvement record.** Describe **more than forty documented
   iterations** (`40+ ITERATIONS` on screen), the strongest traceable D01 improvement
   (accumulating two allocations instead of losing one), and the shift to descriptor-led
   process isolation. Do not say exactly 43: the committed changelog includes ITR-044.
7. **4:24–4:39 — removed scope and honest limitation.** Explain that generation/repair,
   three arms, and twelve fixtures were removed before execution so the submission could
   measure one verify-existing decision fairly. State that the benchmark is synthetic and
   does not prove production generalization.
8. **4:39–4:51 — hot take and reproduction.** State the evidence-backed lesson: an
   unnamed migration invariant cannot be protected reliably, and process isolation moves
   correctness risk into bridge vocabulary and cardinality. Show `make setup`,
   `make test`, and `make eval`; clarify that `make eval` is offline evidence replay.
9. **4:51–4:54 — close.** End on the product name, `Verify the migration your tests
   can't`, and the disclosure that one engineer built the project with AI-agent
   assistance.

## Final media checks

- The uploaded cut is below the five-minute limit; its duration and SHA-256 are recorded
  above and in [`VIDEO_LINK.md`](VIDEO_LINK.md).
- All video blocks decode; no silence longer than 1.5 seconds was detected.
- Integrated loudness is approximately -16.6 LUFS; true peak is approximately -1.3 dBFS.
- Context footage is irreversibly blurred and privacy-reviewed; no permission to publish
  an identifiable product recording is claimed. Any legible values must be synthetic.
  Repository screenshots expose no absolute user path or private identifier.
- The video remains external to the ZIP; only its primary and backup public URLs are
  submitted.
