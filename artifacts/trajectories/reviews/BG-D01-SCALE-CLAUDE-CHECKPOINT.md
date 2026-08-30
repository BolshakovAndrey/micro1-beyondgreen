# BG-D01 repeated scale-readiness checkpoint

**Review class:** independent read-only review of the complete current BG-D01 state  
**Boundary:** `SES-20260830-001`  
**Reviewer invocation:** project Claude wrapper, official `opus` alias, maximum
effort, read-only `Read`/`Glob`/`Grep` tools, safe mode, no Chrome, and no session
persistence  
**Resolved model limitation:** the wrapper emitted no full resolved model identifier;
only the requested official `opus` alias is evidenced  
**Raw response:** retained outside submission artifacts only long enough for
reconciliation; 25,138 bytes; SHA-256
`535c7d0a6988aa521d9429492717d0fb9e7b4a7e8472af085f0e6b20e9a59b5a`

## Machine-readable conclusion

```text
D01_CHECKPOINT=PASS_WITH_CONCERNS
SCALE_READY=no
```

The reviewer judged 10 of the 12 requested remediation areas closed and two only
partially closed. Repository-local correctness remains green, but the implementation
does not yet establish a reusable multi-fixture orchestrator or independently bind
physical capability claims to measured sandbox evidence.

## Codex reconciliation

| Finding | Independent disposition | Current consequence |
| --- | --- | --- |
| The public invariant directly identifies the seeded D01 defect | Valid evaluation-design limitation, but not a hidden-oracle leak under the owner-approved D01 behavior freeze: the public contract was deliberately available to both arms and the seeded candidate was deliberately constructed to violate it | Owner preserved the frozen invariant methodology and authorized explicit disclosure of the construction-validity limitation |
| Network/host/verifier/candidate capability flags are parent-declared constants | Confirmed in `src/d01/execution.ts`, `src/d01/orchestrator.ts`, schemas, and tests; event order is measured, but physical capabilities are not independently evidenced | Scale blocker |
| `FixtureDescriptor` still feeds a D01-singleton engine | Confirmed: schemas, arm checks, reasoning, orchestration types, evaluator-start cardinality, and vertical manifest composition remain D01-specific | Scale blocker; a shared one-orchestrator fixture engine is still required |
| Exact trace review was receipt-only at review time | Correct at the instant of Claude review | Closed afterward: clipboard bytes exactly matched the external receipt, strict UTF-8 passed, two categorical path redactions were applied mechanically, and all 729 native reviewed lines were inspected |
| Decision-evidence map overstated negative tests | Confirmed: event reordering is tested, but missing-event and independently falsified capability tests are absent | Documentation corrected; implementation tests remain required |
| Trace/status ledgers still said capture/checkpoint pending | Confirmed | Closed by synchronizing active EN/RU projections and trace records |
| macOS-only `sandbox-exec` blocks Linux/judge portability | Confirmed | Reserved for the separate owner decision required by the boundary; no reduced-assurance fallback was added |
| Arm-visible manifest is list-bound, not directory-complete | Confirmed: an unlisted arm-visible file is not detected by directory enumeration | Scale blocker |
| Main D01 provenance still names only the original author | Confirmed | Remediation author `COD-CODEX-008` is now recorded; final provenance audit remains required |
| Compile wording/scope is imprecise | Partially confirmed: product globs are intentional, but the reproduction explanation overgeneralizes the excluded control utilities | Documentation correction required; not independently a scale blocker |
| `d01:demo` timestamps cause digest churn | Confirmed and expected for measured EV-009 wall time | Disclose as deterministic replay versus fresh-run artifact behavior; not a correctness blocker |

## Remaining technical gate

Before another scale-readiness checkpoint, a newly approved implementation boundary
must cover at least:

1. one generic fixture-engine path driven by a descriptor, with D01 as data rather
   than a copied orchestrator/schema/checker implementation;
2. runner- or sandbox-produced capability evidence, schema binding, and negative
   tests that falsify missing and inconsistent physical-capability evidence;
3. directory-complete arm-visible package binding and tamper tests;
4. exact correction of evidence-map, provenance, compile-scope, and reproducibility
   projections.

The owner preserved the approved D01 public-invariant freeze and authorized explicit
disclosure of the construction-validity limitation; the evaluation design is not
reopened. Cross-platform isolation and live reasoning remain separate owner
decisions. No official/scored run, product live-model call, Chromium call, BG-D02,
commit, or push was performed or authorized by this review.
