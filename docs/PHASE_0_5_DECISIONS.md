# BeyondGreen Phase 0.5 Frozen Decisions

**Freeze status:** closed at `2026-08-29T13:41:51Z` under the explicit nested-CLI
waiver; product implementation is not authorized. The coordinator verified the
remaining condition: 60 Chromium samples (30 per arm), frozen ordering and N=300,
complete correctness with identical digests, 2400 versus 1900 card renders, 4.7071
ms versus 5.0037 ms mean `TaskDuration`, and passing listed tests plus
`git diff --check`. CPU improvement is not claimed, so its absence is not a failed
gate. Both CLI failures remain failures; live CLI runtime remains unverified.

## Measured-spike result accepted for freeze

The approved Phase 0.5 measurements are complete and frozen under the owner's
explicit nested-desktop CLI waiver. The two `codex exec` failures remain failures; live CLI operation
is unverified in this environment. App-level Sol operation is owner-observed context,
not submission evidence. The optional normal-terminal adapter keeps the frozen
no-retry contract, while deterministic offline replay is the only verified
reproducibility path and does not prove live model behavior.

The independent museum-board Chromium spike passed its correctness gate in
`Chrome/152.0.7977.64`: every value and selection across all 300 cards matched after
every action, the ordered action log/digest and reset matched, and console errors and
unhandled exceptions were both zero. The final evidence contains five warmups and
30 measured samples per arm in the frozen alternating order. Card-render calls were
2400 per baseline sample and 1900 per advanced sample, a 20.83% reduction. CDP
`TaskDuration` mean was 4.7071 ms for baseline and 5.0037 ms for advanced, so no CPU
improvement is claimed. The first protocol execution retained summaries but omitted
the contractually required individual samples; one instrumentation-only retry saved
all 60 samples without changing N=300, actions, order, warmups, or repetitions.
Evidence: `artifacts/phase-0.5-chromium-spike.json`, SHA-256
`688baad33e10966944f8d73dd09e03af1f7aa4301cd2d2c66d7efe1b03bf6b41`.

This freeze authorizes no product/scored artifact, official benchmark, commit, or
push. Product implementation remains separately gated.

**Status:** frozen under explicit nested-CLI waiver; both owner-authorized model calls remain failed  
**Checkpoint:** `impl/beyondgreen@2a41d4d2bab8a8b25406400a8ec7d8cd21112a4e`  
**Scope:** approved inputs for the measured section-20 spike; product implementation,
scored fixtures/candidates/oracles, official benchmark/scoring, repair demo, commit,
and push remain prohibited

### Repository-owner nested CLI waiver

At `2026-08-29T13:30:50Z`, the repository owner made this exact scope decision:
`«Я не вижу смысла в этом запуске, мы и так работаем через Sol сейчас, когда я отправляю эти запросы. Возможно, это не работает при вызове из приложения ChatGPT на Mac, но это и не важно, потому что запросы проходят и ответы приходят. Я хочу скипнуть эту проверку и, если других препятствий нет, закрыть эту часть»`.

This waives the nested Codex CLI live-probe gate for Phase 0.5 only. The two failed
calls remain failed and are not relabelled PASS; the CLI path is not proven. The
owner's observation that the current desktop task is operating through Sol is
context only, not submission evidence. `codex exec` remains an optional normal-
terminal live-adapter contract with the frozen no-retry policy, while its runtime
validation is deferred and unverified in this nested desktop environment.
Deterministic offline replay is the verified reproducibility path; it does not prove
live CLI behavior or replace a scored live claim. This decision permits the approved
Chromium spike to proceed, but authorizes no product/scored artifacts, benchmark,
commit, or push.

The repository owner approved these exact inputs for the separately gated Phase 0.5
spike at `2026-08-29T12:52:58Z`. The structured checkpoint question was
`«Одобряете технический Phase 0.5 spike с подписочным codex exec/gpt-5.6-sol без API, одним вызовом без повторов и сценарием на 300 карточек?»`; the selected response was
`«Одобряю spike (Recommended)»`. This records the selected response as explicit
approval of the question, not as a claim that the owner typed it verbatim. Approval
does not resolve Phase 0.5 or authorize implementation. Measured results still
require owner review before freeze.

### Measured spike stop record

The approved dependency versions were added exactly. `npm install
--package-lock-only --ignore-scripts` and `npm ci --ignore-scripts` both completed;
the latter installed 54 dependency packages, audited 55 total packages, and reported
zero vulnerabilities. The first transitive-license audit command then used the
unsupported `npm query . --json` selector and failed with `EQUERYNODEPTYPE`; its
downstream JSON parser consequently received no package array and failed too. npm
also emitted a machine-specific external debug-log path. That path was not opened,
copied, or persisted and must be redacted from any submitted trace.

This is a dependency/license and trace-redaction stop condition. No retry was made.
No stack-capability test, model call, Chromium run, offline replay, fixture,
candidate, oracle, benchmark, or product implementation followed. Phase 0.5 is not
ready to freeze.

At `2026-08-29T12:58:49Z`, the repository owner authorized exactly one corrected
license-audit attempt. The structured question was
`«Разрешаете одну исправленную попытку transitive-license audit через локальный Node-сканер, после которой spike продолжится только при полном PASS?»`; the selected
response was `«Разрешаю retry (Recommended)»`. This records explicit confirmation
of the question, not a claim that the owner typed the full statement verbatim. The
replacement `scripts/license-audit.ts` reads only `package-lock.json` and installed
`node_modules/**/package.json` metadata under the repository root and emits
`artifacts/phase-0.5-license-audit.json` without filesystem paths. Its permissive
SPDX allowlist is `0BSD`, `Apache-2.0`, `BSD-2-Clause`, `BSD-3-Clause`, `CC0-1.0`,
`ISC`, `MIT`, `Python-2.0`, `Unlicense`, `X11`, and `Zlib`; only
`LLVM-exception` is allowed as an exception. Missing, unknown, non-allowlisted, or
lock/install-mismatched metadata is a hard stop. The spike may continue only on a
complete PASS.

The one authorized corrected audit ran once and completed at
`2026-08-29T13:00:10Z`. It enumerated all 54 installed dependency packages: 51 were
allowlisted, with zero missing and zero unknown licenses, while three were valid
SPDX expressions outside the approved allowlist:

- `@csstools/color-helpers@6.1.1` — `MIT-0`;
- `@csstools/css-syntax-patches-for-csstree@1.1.9` — `MIT-0`;
- `lru-cache@11.5.2` — `BlueOak-1.0.0`.

The result is therefore a hard FAIL, not a statement that these licenses are
non-permissive. Their permissiveness was not owner-approved in the frozen allowlist.
The inventory digest is
`da4ea21744663f8a0343fc8020da92791369ea426eb298141ceb513121efede9`; the report
payload digest is
`d0d2db07447216439ac6f93a5dc7118fc4039a2e1b3ebc98cd05db28dd1d0b55`; the audited
lockfile digest is
`1beb2987e3e0654cb525b80c2f97a2f6577f92399e8a78fcd8eb9f9ab6487d4c`. No second
audit was attempted. Stack capabilities, model, replay, and Chromium remain unrun,
and Phase 0.5 is not ready to freeze.

At `2026-08-29T13:11:21Z`, the repository owner authorized exactly one privacy-safe
diagnostic retry. The structured question was
`«Разрешаете один privacy-safe диагностический повтор той же подписочной команды codex exec без замены модели?»`; the selected response was
`«Разрешаю один retry (Recommended)»`. This is explicit confirmation of the question,
not a claim that the owner typed it verbatim. The command, subscription session,
schema, sandbox, and `gpt-5.6-sol` model remain unchanged. This raises total
Phase 0.5 live-call cardinality to exactly two owner-authorized spike probes; it does
not alter the one-call/no-retry rule for any future official scored run.

Before the second call, stderr handling must classify only `auth`,
`model_unavailable`, `schema`, `argument`, `network_transport`,
`sandbox_repository`, or `unknown`. Raw stderr may exist only in process memory.
Persisted evidence is limited to safe class, exit code, hash, elapsed time, and
redaction counts for paths, emails, account/project IDs, tokens/secrets, and machine
identifiers. No raw or sanitized excerpt is required. A second failure stops the
spike with no third invocation or model substitution.

The diagnostic retry ran once and failed. The unchanged command exited 1 after
3006 ms with safe class `unknown`. Its stderr SHA-256 is
`1393963b62d2b0ef4064d9462d967f6b8688db20939a0fcc4b024e7b06ec4ba5`; all
redaction counts were zero for absolute paths, emails, account/project IDs,
tokens/secrets, and machine identifiers. No excerpt was retained. Raw stderr was not
persisted or disclosed. Across Phase 0.5 there were exactly two owner-authorized live
calls, one diagnostic retry, zero automatic model/transport retries, and no
substitute model. Both attempts abstained, so the model gate remains failed and the
spike stopped before Chromium. No third invocation is authorized.

At `2026-08-29T13:17:17Z`, the owner authorized non-model Codex CLI diagnostics only.
The structured question was
`«Разрешаете non-model диагностику Codex CLI (login status в exact-mode и codex doctor) с сохранением только безопасного класса результата?»`; the selected response
was `«Разрешаю диагностику (Recommended)»`. The diagnostic scope is limited to an
exact-mode authentication/status check, `codex doctor`, command discovery required
to determine whether doctor or subscription usage/limit/status diagnostics exist,
and such a usage/limit/status command only if advertised. It authorizes zero model or
agent calls. Raw CLI output may exist only in memory; evidence retains safe class,
pass/fail, CLI version, exit code, hashes, and redaction counts without excerpts.

The non-model diagnostic completed with `codex-cli 0.148.0` and zero model/agent
invocations. Exact-mode `codex login status --ignore-user-config` exited 2 with safe
class `exact_mode_flag_unsupported`, so authentication status under exact semantics
remains inconclusive; the task did not fall back to reading user configuration or to
a non-exact status claim. `codex doctor` was advertised but exited 1 with safe class
`network_transport`. Its in-memory output contained 14 absolute-path occurrences and
one account/project-ID occurrence; none were persisted or disclosed. `codex usage`
was advertised but exited 1 with safe class `unknown`; no `limits` or standalone
`status` command was advertised. This safely supports a CLI startup/connectivity
problem, but does not prove it caused either live-call failure. Chromium remains
blocked and Phase 0.5 is not ready to freeze.

The owner-authorized diagnosis then reran only `codex doctor` through a stricter
redaction wrapper. Wrapper tests passed 3/3. The command exited 1 after 1329 ms with
safe class `dns`, safe error code `DNS_RESOLUTION`, and controlled message
`Codex doctor reported a DNS resolution failure.` Output hashes are stdout
`862ce104bdab383665ccc8a7bc8e411f6298bea88dbfc687df6c631a13600e08`, stderr
`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`, and combined
`bd4c5e02a6e422990d8259f8b7903db0d9f80038170cd5ff7d46b6fa4375bb2f`. Before any
excerpt selection, 14 absolute paths and one account/project ID were replaced;
email, token/secret, and machine-identifier counts were zero. No excerpt or raw
output was persisted or disclosed. This confirms a DNS-resolution failure in
`codex doctor`; it still does not prove causality for either historical model call.

A privacy-safe DNS/HTTPS matrix then tested only `chatgpt.com`, `auth.openai.com`, and
`api.openai.com`. All three resolved successfully, completed TLS, and returned an
unauthenticated `4xx` response in the `under_250ms` bucket for both DNS and HTTPS.
No credentials were used; resolved IPs, headers, cookies, bodies, and URL paths/query
were neither persisted nor disclosed. Therefore a general local resolver/environment
failure is not present in this matrix, and no host-specific failure occurred among
the three allowlisted public hosts. The earlier doctor `DNS_RESOLUTION` result was
not reproduced: it may have been transient or may concern another service hostname
that safe evidence did not retain. No additional hostname can be admitted without a
validated official name. This does not clear the failed model gate or authorize
Chromium.

After the public matrix passed, the already authorized wrapper reran only
`codex doctor` once. It reproduced `dns` / `DNS_RESOLUTION`, exit 1, in 1259 ms.
stdout SHA-256 was
`dcb8a2c15ce3727412039c74d5080db37ce00859bcc74d2baca806666d8c4d26`; stderr
remained empty with SHA-256
`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`; combined
SHA-256 was `acd43b1a5a2f2ccb608ad8407291d8f1d88000be64a5dbee5c4fff9107dabf27`.
Redactions again counted 14 absolute paths and one account/project ID, with all other
categories zero; no excerpt or raw output was kept. The diagnosis is now a
reproducible doctor-specific DNS failure while the three allowlisted public hosts
remain reachable. It is not a general DNS outage, and the unretained hostname must
not be reconstructed or added. Causality for prior model calls remains unproven.

The next authorized doctor-only diagnosis added strict hostname extraction. Tests
passed 4/4: only exact `openai.com` / `chatgpt.com` roots or valid label chains ending
`.openai.com` / `.chatgpt.com` are accepted, with paths, query, ports, and lookalike
domains rejected. `codex doctor` again returned `dns` / `DNS_RESOLUTION`, exit 1, in
1883 ms. No allowlisted hostname was extractable, so evidence records
`failed_hostname: null`, `unknown_or_non_allowlisted_redacted`, and no follow-up DNS
lookup. stdout SHA-256 was
`0f66f6cd971e53f86845e67202e5450e5d8de261d437640e407e60b983c40035`; stderr was
empty; combined SHA-256 was
`94d219b3ae1eac135d107d6abb0eb5ea1eef48ef03d6906539f5540f1d02cacf`. Redactions
again counted 14 paths and one account/project ID, with all other categories zero.
No hostname, raw output, or excerpt was retained. The unknown name must remain
redacted and must not be guessed or probed.

At `2026-08-29T13:03:36Z`, the repository owner approved a narrow policy amendment.
The structured question was
`«Одобряете MIT-0 и BlueOak-1.0.0 как допустимые permissive-лицензии, обязательный THIRD_PARTY_NOTICES.md и один финальный повтор audit?»`; the selected response was
`«Одобряю и продолжить (Recommended)»`. This records confirmation of the question,
not a claim that the owner typed it verbatim. Only `MIT-0` and `BlueOak-1.0.0` are
added to the allowlist. Coordinator-supplied authoritative SPDX grounds are
`https://spdx.org/licenses/MIT-0.html` and
`https://spdx.org/licenses/BlueOak-1.0.0.html`.

`THIRD_PARTY_NOTICES.md` is now a required reproducible packaging artifact. It must
retain license text or SPDX links for every dependency actually bundled or otherwise
distributed; this does not imply that `node_modules` itself must be shipped. One
final audit is authorized against the unchanged lockfile/install tree. Because the
historical inventory digest incorrectly included policy status, the already saved
failed report was used to establish the policy-neutral `name/version/license`
expectation `68519a270c035c5cb2c8cb92f6d27b44ed47958a4c31b134bcbdb7f4a364ef18` before
the amendment. The lockfile expectation remains
`1beb2987e3e0654cb525b80c2f97a2f6577f92399e8a78fcd8eb9f9ab6487d4c`; the old
policy-coupled digest `da4ea21744663f8a0343fc8020da92791369ea426eb298141ceb513121efede9`
is preserved only as historical evidence. Continuation requires 54/54 PASS and both
unchanged-tree expectations.

The one final audit passed 54/54 with zero findings. Its stable inventory and lockfile
digests exactly matched the expectations above. Report payload SHA-256 is
`7d4d0477585c61e7179fbb6bdd1ff7bf019083536e93362b7fc12a173595ec92`; generated
`THIRD_PARTY_NOTICES.md` SHA-256 is
`6345e22330c67f4091526d3b516bf5a2e06c2694e61b057cd05aabfd8a6f35de`.

The stack harness then passed all ten behavior-class capability probes plus the
Node/TypeScript/ReactDOM/jsdom/Zod/signals integration check (11/11). Its first
integration attempt had one harness-only setup error because Node 22 exposes
`globalThis.navigator` as read-only; removing that unnecessary assignment produced
the passing run.

The frozen `gpt-5.6-sol` command was then invoked exactly once. It exited 1 after
approximately 3.93 seconds and produced no schema-valid final output. The retained
privacy-safe result is `MODEL_TRANSPORT_FAILURE`; stderr content was neither
persisted nor disclosed, only its SHA-256
`3b93186506b30e5901974d0a6f8f0c3c876309b7920735f66205cef575d0c264` was retained.
This evidence cannot distinguish model unavailability from another transport
failure. There were zero model and transport retries and no substitute model. Per
the approved gate, the spike stopped before Chromium. Phase 0.5 is not ready to
freeze.

## 1. Signals package

The candidate is `@preact/signals-react@3.12.0`, licensed under MIT. Public npm
metadata identifies the official upstream repository as
`https://github.com/preactjs/signals` and reports React peer support for
`^16.14.0 || 17.x || 18.x || 19.x`. The package exposes typed root, `./utils`, and
`./runtime` entry points with ESM/browser/CommonJS variants. Its declared runtime
dependencies are `@preact/signals-core@^1.14.4` and
`use-sync-external-store@^1.2.0`.

These facts establish a plausible public React signals surface, not compatibility
with BeyondGreen's behavioral fixtures. Approval of this packet would authorize a
measured stack spike that checks observability, batching, lifecycle cleanup,
identity, rollback, and external-store behavior. It would not approve the package
for product use by itself. The choice was evaluated solely from public package
metadata and contains no inference from private code, names, structures, or data.

## 2. Runtime and dependency versions

The proposed direct stack is:

| Role | Exact version | License | Reason |
| --- | --- | --- | --- |
| Node.js runtime | `22.22.3` | runtime already present | Matches the repository engine floor and satisfies jsdom's declared engine range. |
| npm | `10.9.8` | runtime already present | Generates the proposed lockfile format reproducibly. |
| TypeScript | `5.9.3` | Apache-2.0 | Conservative stable line; npm reports `7.0.2` as latest, but the spike should avoid adopting a new major before ecosystem compatibility is measured. |
| React | `19.2.8` | MIT | Exact current public version and exact ReactDOM peer match. |
| ReactDOM | `19.2.8` | MIT | Declares peer `react@^19.2.8`. |
| jsdom | `30.0.1` | MIT | Exact current public version; supports Node `^22.22.2`. |
| Zod | `4.5.2` | MIT | Exact current public schema-validation version. |
| `@types/node` | `22.20.1` | MIT | Latest public Node 22 type line, aligned with the runtime major. |
| `@types/react` | `19.2.18` | MIT | Exact current React 19 type version. |
| `@types/react-dom` | `19.2.5` | MIT | Exact current ReactDOM 19 type version. |
| `@types/jsdom` | `30.0.0` | MIT | Exact current jsdom 30 type version. |

npm reported these official upstream repository URLs for the selected packages:
React/ReactDOM `https://github.com/react/react`, TypeScript
`https://github.com/microsoft/TypeScript`, jsdom `https://github.com/jsdom/jsdom`,
Zod `https://github.com/colinhacks/zod`, and all four `@types/*` packages
`https://github.com/DefinitelyTyped/DefinitelyTyped`. The licenses in the table are
the npm-reported license fields, not inferred from repository names.

No direct `canvas` package is proposed: npm metadata marks it as an optional jsdom
peer and the formal behavior classes do not require canvas rendering. Transitive
packages remain controlled by the lockfile rather than being promoted to direct
dependencies without measured need.

After owner approval and only inside the spike task, `package.json` should use exact
versions without range prefixes. npm `10.9.8` should generate and freeze lockfile
version 3; subsequent clean installs must use `npm ci`. The committed lockfile must
pin the complete transitive graph and integrity fields. Overrides, lockfile-only
upgrades, and package-manager changes require a recorded reason, renewed license
review, and repository-owner approval. After the future install, a complete
transitive-license audit is a hard Phase 0.5 gate: any unknown, incompatible, or
unrecorded license stops the spike and returns to owner review.

## 3. Live reasoning engine and replay fallback

The primary live transport is the locally authenticated `codex exec` session behind
the provider-neutral engine interface. The frozen candidate adapter is
`codex-exec-jsonl-v1`, targeting the already observed `codex-cli 0.148.0`. It is
invoked from the arm-visible candidate root with prompt input on stdin:

```text
codex exec --ephemeral --ignore-user-config --json --output-schema <schema> --sandbox read-only --model gpt-5.6-sol
```

All listed flags were confirmed by the previously recorded `codex exec --help`.
`<schema>` must resolve to the frozen repository-relative decision schema.
`--ephemeral` avoids session persistence, `--ignore-user-config` removes personal
configuration, JSON events and `--output-schema` provide machine-readable output,
and `--sandbox read-only` forbids solution-agent writes. The coordinator observed
`codex login status` returning `Logged in using ChatGPT`; this proposal uses that
subscription-authenticated CLI session and requires no separate key-based
credential. The model ID candidate is `gpt-5.6-sol`: on 2026-08-29 the current model
line describes GPT-5.6 Sol as the flagship for complex professional work. Fixed
subscription cost removes the reason to prefer a cost-balanced model. The spike
checks whether Sol is available in the current ChatGPT-authenticated CLI session and
how it behaves. It must not search for or silently substitute another model; Sol
unavailability stops the spike for owner review.

Each candidate permits one model invocation, zero model retries, and zero transport
retries. The adapter owns deterministic JSONL/event parsing, final schema validation,
timeout enforcement, operational abstention, and conversion to the replay format in
decision 5. The future spike must verify deterministic parsing, schema-valid final
output, the read-only sandbox, timeout behavior, unavailable-model failure, absence
of retry, and offline replay. The model receives only arm-visible candidate material;
no hidden oracle or verifier-only path may be sent. Claude remains read-only review
only and is forbidden as the solution engine.

The deterministic fallback is `offline-replay-jsonl-v1`. If the authenticated CLI
session or candidate model is unavailable, replay may validate parsing, accounting, reporting,
and deterministic decisions from previously approved public/synthetic records. It
cannot create scored live evidence or replace the required authenticated feasibility
spike. In that case product implementation stays blocked unless the owner separately
approves an explicitly offline-only evaluation claim.

## 4. Candidate budget and time controls

The authenticated Codex session uses fixed subscription billing. Marginal USD cost
per candidate is not exposed with sufficiently reliable semantics, so evidence must
record `marginal_usd_cost: not_measured`—never zero and never an estimate. No USD cap
is claimed. Token usage is recorded only if the CLI reports it explicitly and
stably during the spike; otherwise evidence records `token_usage: not_measured`.

The enforceable budget is exactly one invocation per candidate, zero model retries,
zero transport retries, and the wall-clock limit. A second invocation or retry is a
protocol failure, not a repair path.

The external wall-clock limit remains 180 seconds. The adapter receives a
165-second internal deadline, reserving 15 seconds for schema validation, evidence
finalization, and clean termination. A timeout, malformed
output, unavailable model, or second-call request must produce operational `abstain`,
not a repair attempt. The spike must verify these controls before the transport can
be approved.

## 5. Versioned deterministic offline replay

The proposed format identifier is `beyondgreen-replay-jsonl@1.0.0`. Files are UTF-8,
LF-terminated, without a byte-order mark, with one RFC 8785 JSON Canonicalization
Scheme object per line. Allowed `record_type` values, in order, are `header`, one or
more request/response pairs (`model_request`, `model_response`), `decision_input`,
`decision_output`, and `footer`.

Every record contains `schema_version`, zero-based contiguous `sequence`,
`record_type`, `created_at_utc`, `run_id`, `fixture_id`, `candidate_id`, `arm_id`,
`candidate_sha256`, `policy_sha256`, `adapter_id`, `adapter_version`, `model_id`,
`previous_chain_sha256`, and `record_sha256`. Request/response records additionally
contain `request_id`, the exact arm-visible payload or response, token-usage status,
`marginal_usd_cost`, finish, and latency fields. Usage and cost values follow decision
4 and may be `not_measured`; they must never be fabricated. `created_at_utc` is preserved as evidence but is
excluded from semantic output comparison.

`record_sha256` is SHA-256 of the RFC 8785 canonical record with
`record_sha256` omitted. The first `previous_chain_sha256` is 64 zeroes; each later
value is `SHA256(previous_chain_sha256 + "\n" + previous record_sha256)`. The footer
records the final chain digest and the SHA-256 of the ordered canonical payload
records before the footer.

A replay is accepted only when encoding, schema/version, record order, contiguous
sequence, every record hash, the chain, footer digest, identifiers, frozen
candidate/policy/model/adapter hashes, and one-to-one request/response cardinality
all match. Replay runs with network and subprocess creation disabled and no
workspace writes. Repeated replay must produce byte-identical normalized decision
JSON and report hashes, including the same verdict and evidence references. Replay
does not consume or create a scored attempt.

Replay must never contain or expose a hidden oracle, evaluator feedback available
before decision time, verifier-only paths, secrets, environment values, private or
machine paths, held-out feedback, or data from private systems. It must not make a
new model call, execute recorded commands, repair a response, create a second
attempt, change evidence, or change a verdict.

## 6. Development and held-out behavior classes

The proposed immutable 4/6 assignment is independently designed synthetic prose in
neutral domains:

| ID | Membership | Behavior class | Neutral domain |
| --- | --- | --- | --- |
| `BG-D01` | development | stale snapshots | museum visit group allocation board |
| `BG-D02` | development | queued/batched updates | game scoreboard increment queue |
| `BG-D03` | development | derived state | trip packing-weight summary |
| `BG-D04` | development | subscription cleanup | public clock time-zone feed |
| `BG-H01` | held-out | prop reset | quiz question editor |
| `BG-H02` | held-out, challenging | asynchronous ordering | public astronomy-catalog search with abort and late responses |
| `BG-H03` | held-out | identity stability | reading-list selection |
| `BG-H04` | held-out | conditional lifecycle | weather detail panel |
| `BG-H05` | held-out | external-store semantics | shared unit-preference store |
| `BG-H06` | held-out | rollback | theme-preference save rollback |

`BG-D01` is the recommended first vertical slice because it can demonstrate the
green-test trap, stale-state risk, independent verification, preserved behavior,
and render/CPU evidence across a fixed synthetic 300-card surface. `BG-H02` is the mandatory
challenging case: its oracle must distinguish aborted work, out-of-order completion,
and a late response that must not overwrite the latest result.

Approval freezes only this class/domain assignment for the spike. Fixture prose,
public anchors, provenance records, candidates, hidden oracles, and hashes must be
created later under their own gates. They may not copy or resemble private code,
names, structures, layouts, or data. Held-out outcomes cannot be used for tuning.

## 7. Chromium correctness-first protocol

The proposed first scenario is `BG-D01`, a fully independent synthetic **museum
visit group allocation board**. The page displays 300 generated cards in an ordinary
CSS grid. Cards are identified only as `MVG-001` through `MVG-300`; each shows its
current visitor allocation and selected/unselected state. This design has no private
code, names, structure, layout, or data. Chromium's exact binary version must be
recorded and frozen during the measured spike; no browser was launched in this
research task.

Use a fresh browser context per sample at 1280x720, device scale factor 1, reduced
motion enabled, and network disabled after the local page is loaded. For both the
reference and candidate, execute this exact action sequence:

1. Mount 300 cards with allocation `0`, step `1`, and an empty selection.
2. Invoke `Select all`; require the ordered selection IDs `MVG-001`…`MVG-300`.
3. Invoke `Allocate twice` once. Its single user event must enqueue two updates per
   selected card from the same initial snapshot; after microtasks and one animation
   frame, require allocation `2` on all 300 cards. This is the D01 stale-snapshot
   check.
4. Change the visible bulk step to `3`, then invoke `Allocate twice` once; require
   allocation `8` on all 300 cards.
5. Invoke `Select every third`; require exactly the 100 ordered IDs `MVG-003`,
   `MVG-006`, …, `MVG-300`.
6. Invoke `Remove once`; require allocation `5` on those 100 cards and `8` on the
   other 200 cards.
7. Invoke `Reset`; require allocation `0` on all 300 cards, step `1`, and an empty
   selection.

Baseline and advanced arms must expose the same DOM and observable contract at every
step. The correctness record contains all 300 ordered card IDs and values after each
bulk action, ordered selection IDs, the exact ordered action log
`[mount, select-all, allocate-1x2, step-3, allocate-3x2, select-every-third,
remove-3x1, reset]`, and a SHA-256 digest of their canonical JSON. Reset state, log,
digest, console errors, and unhandled rejections are part of the gate.

Run five unmeasured warmups per arm, followed by 30 measured samples per arm as 15
`reference → candidate` pairs and 15 `candidate → reference` pairs. Record every raw
sample. The primary render metric is explicit, identical userland instrumentation:
board-render invocations, total card-render invocations, and per-card render counts
reset immediately before the action window. React Profiler `actualDuration` may be
reported only when both arms use the same explicitly identified profiling build;
otherwise it is omitted, never reported as zero. CPU is the delta between two CDP
`Performance.getMetrics` `TaskDuration` snapshots, one immediately before and one
immediately after the settled action window; cumulative absolute values are invalid.
Wall time is secondary. Report every raw sample plus mean, median, p95, sample
standard deviation, coefficient of variation, minimum, maximum, browser/runtime
versions, and execution order for each arm.

Correctness is an absolute gate. Every observable and evidence hash must agree with
the reference in every measured run, with zero console errors or unhandled
rejections. Any behavioral mismatch marks the scenario `behavior_failure`, excludes
all of its timing/render samples from comparison, and forbids any performance claim.
Performance remains secondary evidence and has no v1.1 score effect.

Record the exact Chromium version and a publicly safe environment description: OS
family and major version, CPU architecture, logical-core count, and rounded RAM
bucket. Never record hostname, username, serial/device identifiers, filesystem
paths, or other machine-specific identifiers. The fixed size is 300 cards. If the
spike shows that this protocol is infeasible, stop and return to the owner; do not
tune the card count after seeing results.

## Public research record

The following read-only commands were run from the clean repository root. No package
was installed, packed, or executed, and no repository cache, manifest, or lockfile
was changed.

```text
node --version
npm --version
codex --version
codex exec --help
npm view @preact/signals-react version dist-tags license repository.url homepage peerDependencies dependencies engines --json
npm view @preact/signals-react@3.12.0 description keywords exports main module types --json
npm view react version dist-tags license repository.url homepage engines --json
npm view react-dom version dist-tags license repository.url homepage peerDependencies dependencies engines --json
npm view typescript version dist-tags license repository.url homepage engines --json
npm view typescript@5.9 version license repository.url engines --json
npm view jsdom version dist-tags license repository.url homepage peerDependencies dependencies engines --json
npm view zod version dist-tags license repository.url homepage engines --json
npm view @types/node version dist-tags license repository.url homepage --json
npm view @types/node@22 version --json
npm view @types/react version dist-tags license repository.url homepage peerDependencies dependencies --json
npm view @types/react-dom version dist-tags license repository.url homepage peerDependencies dependencies --json
npm view @types/jsdom version dist-tags license repository.url homepage dependencies --json
npm view react@19.2.8 version license repository.url homepage engines --json
npm view react-dom@19.2.8 version license repository.url homepage peerDependencies dependencies engines --json
npm view typescript@5.9.3 version license repository.url homepage engines --json
npm view jsdom@30.0.1 version license repository.url homepage peerDependencies engines --json
npm view zod@4.5.2 version license repository.url homepage engines --json
npm view @types/node@22.20.1 version license repository.url homepage --json
npm view @types/react@19.2.18 version license repository.url homepage peerDependencies dependencies --json
npm view @types/react-dom@19.2.5 version license repository.url homepage peerDependencies dependencies --json
npm view @types/jsdom@30.0.0 version license repository.url homepage dependencies --json
npm view openai version license repository.url homepage engines --json
```

Observed local fields were Node `v22.22.3`, npm `10.9.8`, Codex CLI `0.148.0`, and
the documented `codex exec` flags used above. npm returned the exact versions,
licenses, repositories, peers, dependencies, exports, and engine ranges cited in
decisions 1–2. TypeScript latest was `7.0.2`; the queried 5.9 line contained `5.9.2`
and `5.9.3`, so this proposal selects `5.9.3`. A read-only `openai` SDK metadata query
also occurred while the coordinator-proposed Responses alternative was under review;
the repository owner rejected that alternative as unnecessary complexity under fixed
subscription billing. The SDK is not a dependency candidate and none of its metadata
is an active stack decision. Missing optional fields were treated as absent, not
inferred.

Coordinator-provided local authentication evidence for this revision is
`codex login status` → `Logged in using ChatGPT`. This task did not rerun login or
invoke a model. Terra was a temporary cost-driven candidate during the rejected API
alternative; after fixed subscription billing was confirmed, the owner selected the
current flagship Sol candidate.

## Approval scope

Repository-owner approval of this candidate would freeze these seven inputs only for
the separately logged Phase 0.5 feasibility spike. It would not prove feasibility,
approve model behavior without the spike, authorize fixture/candidate/oracle
creation, start product implementation, or authorize commit/push. Any failed
compatibility, determinism, budget, or correctness check must return to owner review.
