# TRC-BG-PHASE05-001 — Phase 0.5 reviewed-layer candidate

**Status:** reviewed-layer scan and repository-owner EN/RU human review passed.  
**Boundary:** `SES-20260829-002`; branch `impl/beyondgreen`; starting checkpoint
`2a41d4d2bab8a8b25406400a8ec7d8cd21112a4e`.  
**Agent/model provenance:** `Codex desktop / GPT-5.6 Sol (owner-observed current default; raw export has no model field)`. The task inherited the current default and
did not set a model override; this is owner-observed provenance, not a machine-
exported model assertion.  
**Scope:** Phase 0.5 research, decisions, measured spike, conditional freeze, and
validation only. No product implementation, scored fixture/candidate/oracle,
official benchmark, repair demo, commit, or push occurred.

This readable candidate was reconstructed from repository evidence and clean-task
facts. The packaging task did not open the immutable external raw file or learn its
path. Internal thread/message/tool identifiers and the unrelated trace-first prelude
are excluded.

## 1. Initial verification and research

The task verified the clean boundary and reread the required contracts. Public
read-only metadata fixed the candidate stack: Node `22.22.3`, npm `10.9.8`,
TypeScript `5.9.3`, React/ReactDOM `19.2.8`, jsdom `30.0.1`, Zod `4.5.2`,
`@types/node` `22.20.1`, `@types/react` `19.2.18`, `@types/react-dom` `19.2.5`,
`@types/jsdom` `30.0.0`, and `@preact/signals-react` `3.12.0` under MIT.

The independently designed behavior allocation was frozen as four development
classes (`BG-D01` stale snapshots/museum board, `BG-D02` queued updates/game
scoreboard, `BG-D03` derived state/trip packing, `BG-D04` cleanup/public clock) and
six held-out classes (`BG-H01` prop reset/quiz, `BG-H02` async ordering/astronomy as
the challenging case, `BG-H03` identity/reading list, `BG-H04` conditional
lifecycle/weather, `BG-H05` external store/unit preference, `BG-H06` rollback/theme).

The live adapter went through two research revisions. A Responses API/OpenAI SDK
option and a temporary cost-driven `gpt-5.6-terra` candidate were considered, then
rejected by the owner as unnecessary under fixed ChatGPT subscription billing. The
selected optional live contract became:

```text
codex exec --ephemeral --ignore-user-config --json --output-schema <schema> --sandbox read-only --model gpt-5.6-sol
```

It uses one call per future candidate, no automatic model/transport retry, no model
substitute, and a 180-second total timeout. Marginal USD cost and token usage are
`not_measured` unless the CLI reports them stably. No API key, Responses API, or
OpenAI SDK dependency is used. Deterministic `offline-replay-jsonl-v1` is mandatory.

The Chromium candidate became an independent museum visit group-allocation board:
300 synthetic cards in a CSS grid, identical observables in both arms, fixed bulk
actions, correctness before performance, explicit userland render counters, CDP
`Performance.getMetrics` `TaskDuration` deltas, five warmups and 30 measured samples
per arm in alternating order, and no tuning after results.

Research validation encountered non-substantive retries: localized EN/RU number
comparison false mismatches, a porcelain-scope parser issue, a stale patch context
that made no change, and an unavailable direct denylist environment followed by the
authorized safe control launcher. The final research packet remained pending until
the owner approved the measured spike.

## 2. Owner authorization for the measured spike

The owner was asked:

`Одобряете технический Phase 0.5 spike с подписочным codex exec/gpt-5.6-sol без API, одним вызовом без повторов и сценарием на 300 карточек?`

The selected response was `Одобряю spike (Recommended)`. This authorized only the
bounded Phase 0.5 work, not product or scored work.

`npm install --package-lock-only --ignore-scripts` and
`npm ci --ignore-scripts` succeeded. The first license approach,
`npm query . --json`, failed with `EQUERYNODEPTYPE`; npm printed an external machine
path in raw output. That path was neither opened nor retained here.

## 3. License audit checkpoints

The owner authorized one corrected local-scanner retry:

`Разрешаете одну исправленную попытку transitive-license audit через локальный Node-сканер, после которой spike продолжится только при полном PASS?`

Selected: `Разрешаю retry (Recommended)`.

A deterministic scanner was added to read only `package-lock.json` and repository-
local installed `package.json` metadata. Its unit tests first caught two scanner
defects (a `SEE LICENSE` classification and an ESM helper); both were fixed, and
15/15 tests passed. The authorized audit enumerated 54 packages: 51 allowed, two
`MIT-0`, one `BlueOak-1.0.0`, zero missing and zero unknown. It failed closed.

The owner then approved the exact policy amendment:

`Одобряете MIT-0 и BlueOak-1.0.0 как допустимые permissive-лицензии, обязательный THIRD_PARTY_NOTICES.md и один финальный повтор audit?`

Selected: `Одобряю и продолжить (Recommended)`.

Only those two SPDX identifiers were added. Scanner/notices tests passed 16/16 and
the sole final audit passed 54/54. Evidence:

- lockfile SHA-256 `1beb2987e3e0654cb525b80c2f97a2f6577f92399e8a78fcd8eb9f9ab6487d4c`;
- stable inventory SHA-256 `68519a270c035c5cb2c8cb92f6d27b44ed47958a4c31b134bcbdb7f4a364ef18`;
- report payload SHA-256 `7d4d0477585c61e7179fbb6bdd1ff7bf019083536e93362b7fc12a173595ec92`;
- `THIRD_PARTY_NOTICES.md` SHA-256 `6345e22330c67f4091526d3b516bf5a2e06c2694e61b057cd05aabfd8a6f35de`.

## 4. Stack, replay, live calls, and diagnostics

The first stack run proved all ten capabilities but its integration setup tried to
assign Node 22's read-only `globalThis.navigator`. Removing the unnecessary
assignment made the second run pass 11/11. Model-adapter/JSONL/offline-replay tests
first passed 4/4 and later 6/6. Replay uses UTF-8/LF, RFC 8785 JCS and SHA-256 under
`beyondgreen-replay-jsonl@1.0.0`; it performs no network, subprocess, or workspace
writes and cannot replay hidden oracles or private material.

The first exact live call exited 1 after about 3.93 seconds as
`MODEL_TRANSPORT_FAILURE`; no schema-valid output was produced. Raw stderr was not
persisted or disclosed. Its SHA-256 was
`3b93186506b30e5901974d0a6f8f0c3c876309b7920735f66205cef575d0c264`.

The owner authorized exactly one privacy-safe retry:

`Разрешаете один privacy-safe диагностический повтор той же подписочной команды codex exec без замены модели?`

Selected: `Разрешаю один retry (Recommended)`.

After a tested redaction/classification wrapper was added, the same command/model
failed again: exit 1, 3006 ms, safe class `unknown`, stderr SHA-256
`1393963b62d2b0ef4064d9462d967f6b8688db20939a0fcc4b024e7b06ec4ba5`,
and zero matches in all five redaction categories. Raw stderr and excerpts were not
retained. Total live invocations were two; automatic retries zero; substitutes zero.

The owner next authorized non-model diagnostics:

`Разрешаете non-model диагностику Codex CLI (login status в exact-mode и codex doctor) с сохранением только безопасного класса результата?`

Selected: `Разрешаю диагностику (Recommended)`.

On `codex-cli 0.148.0`, exact-mode login status rejected
`--ignore-user-config` (exit 2), doctor returned a transport/DNS failure (exit 1),
and advertised usage returned `unknown` (exit 1); no model call occurred. The
redaction wrapper ultimately passed 4/4 tests. The final doctor record was
`DNS_RESOLUTION`, exit 1, 1883 ms, stdout SHA-256
`0f66f123b52a301b10fb72b164351966e806c7aad07f8cb7ba4d86c42a4d0035`,
empty-stderr SHA-256
`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`,
combined SHA-256
`94d219b818416f92b7b06b4bb7a7443d984ea3e7b84b405343179e5ac7e6cacf`,
with 14 path and one account-ID redactions. Strict official-host extraction returned
null, so no hostname lookup ran. No raw output or excerpt was retained.

A credential-free matrix for `chatgpt.com`, `auth.openai.com`, and `api.openai.com`
reported DNS and TLS pass and HTTP `4xx` under 250 ms for all three. It retained no
IP, headers, cookies, body, credentials, or URL paths. This did not establish the
cause of either live-call failure.

## 5. Owner waiver and Chromium measurement

The owner stated:

`Я не вижу смысла в этом запуске, мы и так работаем через Sol сейчас, когда я отправляю эти запросы. Возможно, это не работает при вызове из приложения ChatGPT на Mac, но это и не важно, потому что запросы проходят и ответы приходят. Я хочу скипнуть эту проверку и, если других препятствий нет, закрыть эту часть`.

This waived only nested-desktop CLI runtime validation. Neither failed live call was
relabeled PASS. App-level Sol operation is owner-observed context, not submission
evidence. `codex exec` remains an optional normal-terminal adapter with runtime
validation deferred/unverified; deterministic offline replay is the verified path.

The neutral Chromium spike then ran with fixed N=300. The first successful protocol
execution persisted summaries but omitted required individual samples. One
instrumentation/evidence retry retained all 60 measured samples; N, actions,
ordering, warmups, and repetitions were unchanged. Across both executions there
were 140 samples including warmups; no parameter was tuned after results.

Final evidence in `Chrome/152.0.7977.64` passed all 300 values, selection IDs,
ordered action-log digest, reset, identical observables, and zero console errors or
unhandled rejections. Five warmups and 30 measured samples per arm used the frozen
alternating order. Evidence SHA-256:
`688baad33e10966944f8d73dd09e03af1f7aa4301cd2d2c66d7efe1b03bf6b41`;
observable digest:
`064dc4a20841c306c1fff12c94fb2a6c8a12f510e6154e8c0f70b4322aef01a8`;
action digest:
`5273d540115aa4e44a4d47738a0b5537ef78450f5e042132d6fd2310de83cabf`.
Userland card renders were 2400 baseline versus 1900 advanced, a 20.83% reduction
for this synthetic spike only. Mean CDP TaskDuration was 4.7071 ms baseline versus
5.0037 ms advanced, so no CPU improvement is demonstrated or claimed.

Two temporary Chromium profiles initially remained because cleanup preceded full
browser exit. A broad destructive cleanup command was rejected before execution;
the two exact repository-local directories were removed with scoped deletion without
reading them. The runner now waits for exit, its tests cover ordering, and the final
count was zero.

## 6. Conditional freeze and validation

The coordinator independently verified 60 measured samples, 30 per arm, fixed
ordering/N, matching correctness digests, the reported render/CPU values, and passing
tests. This satisfied the owner's earlier condition to close Phase 0.5 if Chromium
found no remaining obstacle. Phase 0.5 was frozen at `2026-08-29T13:41:51Z` under
the explicit nested-CLI waiver. This did not authorize product implementation.

Final checks passed: repository tests 16/16; stack 11/11; model/offline controls 6/6;
CLI privacy 3/3; doctor privacy 4/4; network privacy 3/3; Chromium harness 4/4;
license audit 54/54; YAML/Markdown/parity/privacy checks; `git diff --check`; checksum
coverage of 74 files; and safe control/implementation preflights with no contamination
findings. Implementation reported structural readiness with the expected dirty-tree
warning and four binary-review notices; automated readiness was not human authority.

Final validation also recorded three validator-only retries: corrected Ruby YAML
syntax, locale-aware decimal parity, and a bounded token-shaped secret regex. The
Russian owner card was corrected to include exact versions. None changed evidence or
claims.

## 7. Submission-layer redaction and current gate

Coordinator-supplied immutable raw metadata:

- bytes: `3511076`;
- SHA-256: `031477de3fd7e42591ba5e7c1820ac39cb2dd1b691dbae29ae850a2aee895b86`;
- absolute user-path matches: 667;
- private-term matches before path redaction: 2;
- private-term matches after path redaction: 1;
- email matches: 0;
- secret-assignment matches: 0;
- raw automated scan: `failed`.

All machine paths were replaced by stable repository-relative paths or
`<REDACTED_MACHINE_PATH>`. The one remaining private-term occurrence was omitted
without copying, naming, describing, or guessing it. Internal thread/message/tool
identifiers and the unrelated pre-Phase0.5 transcript were excluded. These omissions
do not remove any repository-evidenced decision, command category, outcome, retry,
checkpoint, digest, or measurement in this candidate. However, because the raw scan
failed and the remaining occurrence cannot be inspected in this packaging task,
The reviewed layer passed the real-denylist control scan with zero contamination and
zero machine/thread/tool metadata findings; four existing binary-review notices
remain. The repository owner then explicitly confirmed that the EN/RU reports are
accurate and safe and preserve technical meaning after the stated exclusions.
`technical_meaning_preserved=true`. The raw scan remains `failed` and none of its
counts or limitations is relabelled.

The exact approval question was:

`Подтверждаете русскую и английскую версии TRC-BG-PHASE05-001 как точный и безопасный отчёт, в котором после указанных исключений сохранён технический смысл?`

The selected response was `Подтверждаю одобрение (Recommended)`. This approval
authorizes trace promotion only, not product/scored work, model or browser execution,
commit, or push.

No product implementation, scored fixture/candidate/oracle, official benchmark,
repair demo, model/Chromium rerun, commit, or push is authorized by reviewing this
candidate.
