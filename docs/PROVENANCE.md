# Provenance Ledger

**Status:** current through final submission-candidate preparation<br>
**Rule:** every submitted source, fixture, dataset, instruction, and evidence artifact
must have an independently reviewable origin.

## 1. Project-level origin statement

The project direction is motivated by the author's general professional experience:
React state migrations can retain green legacy tests while changing observable
behavior. Early private ideation informed the choice of problem, but private material
is outside the submission boundary.

No employer/client code or artifact may be included in the submission or used as the
source of submitted fixtures. Fixture implementations must originate from frozen
behavior specifications and recorded public sources.

## 2. Control-plane artifacts

| Artifact | Origin | Created | Submission status |
| --- | --- | --- | --- |
| Official challenge PDF and maintained challenge/rules documents | micro1/HackerEarth public participant materials | Before product implementation | Eligible as reference; include only if needed |
| `docs/SUBMISSION_ARTIFACTS_SPEC.md` | Codex-assisted interpretation of official requirements | During event, before topic implementation | Eligible after trace/disclosure review |
| Clean-room, trace, provenance, and Node-only preflight contracts | Codex-assisted, derived from official privacy/originality/reproducibility requirements | During event, before product implementation | Eligible after clean branch adoption and review |
| Current topic-selection conversation | Private control-plane ideation | Before clean boundary | Excluded |
| Previous raw external-review output | Private control-plane review | Before clean boundary | Excluded |
| Project-local read-only reviewer skill | Codex-assisted tooling prepared before implementation | During event | Disclose if used; include only reviewed redistributable files |
| BG-D02 queued/batched-updates development fixture | Independently authored synthetic package under `SES-20260830-006`; frozen behavior/provenance and repository-local source manifests | During event | Integrated and deterministically verified; trajectory review pending |
| BG-D03 derived-state development fixture | Independently authored synthetic package under `SES-20260830-007`; frozen package manifest | During event | Integrated and deterministically verified; trajectory review pending |
| BG-D04 subscription-cleanup development fixture | Independently authored synthetic package under `SES-20260830-008`; frozen behavior and source manifests | During event | Integrated and deterministically verified; trajectory review pending |
| D02-D04 integration and path normalization | Owner-authorized Codex continuation family under `SES-20260830-009` | During event | Repo-local verification complete; capture/review/owner promotion pending |
| Held-out H01-H06 integration coordinator evidence | Owner-authorized Codex bundle under `SES-20260830-012` | During event | Reviewed, privacy-normalized, owner-approved, and indexed in `actual_traces`; failed/no-change attempts retained only as retries |
| Official RUN-002 arm decisions | Owner-controlled `eval-v1.1.0` execution under `SES-20260831-033` | During event | Included as immutable official evidence; 40 decisions, 20 live BeyondGreen calls, zero retries |
| `POSTDECISION-004` evidence and replay | Owner-controlled recovery from immutable RUN-002 decisions after verifier-runtime corrections | During event | Included; 80 captures, 40 evaluator records, zero new arm/model calls, evidence SHA-256 recorded |
| Final judge-facing documentation and submission metadata | Codex-assisted synthesis from committed code and official evidence | During event | Submission candidate; video links, independent review, config-derived clean-extraction rehearsal, and owner ZIP authorization complete; upload remains owner-controlled |
| Final demo video | Owner-authored edit from privacy-reviewed context footage and repository evidence | During event | External only: verified YouTube primary and public Vimeo mirror; local media excluded from ZIP; no identifiable real-product UI or code is shown, and legible values are synthetic |

## 3. Source admission rule

A public source can influence implementation only after a provenance entry records:

- stable ID;
- title and URL;
- author or maintaining organization;
- access date;
- license or redistribution status;
- exact behavior/fact used;
- affected fixture or design decision;
- whether source expression is copied, adapted, or only consulted.

Public availability is not permission to redistribute. Licenses and terms must be
checked separately.

## 4. Fixture admission rule

Every synthetic fixture must have:

1. a prose behavior specification written before code;
2. at least one admitted public anchor;
3. a frozen specification hash;
4. a neutral domain with no private product overlap;
5. original source and tests authored inside the clean branch;
6. author/agent/model and creation date;
7. license declaration;
8. automated contamination scan and human review;
9. disclosure of whether it is development or held-out;
10. a record of every post-freeze change.

Use `templates/PROVENANCE_ENTRY.yaml` for the machine-readable record.

## 5. Pre-existing versus event-created work

The implementation branch must state, before its first product commit:

- which control-plane documents and helper tools existed beforehand;
- which product source, fixtures, agents, evaluations, and evidence are event-created;
- whether any public dependency or template existed before the event;
- which artifacts were modified after the event started.

This ledger must be updated when an artifact crosses from local-only to submission
scope.

## 6. Ownership warning

The participation materials state that micro1 owns submissions and may use them for
model training/evaluation. Therefore:

- no employer/client material may enter the submission;
- dependencies and public examples require license review;
- using the submitted implementation later in an employer project may require a
  separate rights review;
- the reusable professional value should also be preserved as general methodology,
  measurements, and independently implementable contracts.

This is an engineering warning, not legal advice.
