# BeyondGreen — глобальная спецификация продукта

**Статус перевода:** полная ненормативная русская копия для проверки человеком
**Нормативный источник:** `docs/PROJECT_SPEC.md`
**Версия:** `1.1.0`
**Состояние:** нормативная v1.1 одобрена; этап 0.5 зафиксирован с явным исключением
для вложенного интерфейса командной строки. Для неоцениваемого вертикального сценария
D01 существует одобренная владельцем допустимая историческая трасса проверки
`TRC-BG-D01-VERIFY-002`. В одобренной границе `SES-20260830-001` перечисленные
исправления готовности к масштабированию реализованы и локально проверены. Старая
трасса не доказывает новую реализацию. Для `TRC-BG-D01-SCALE-001` подтверждены точное
совпадение байтов штатного захвата, строгая кодировка UTF-8, категориальная замена
машинных путей, полная проверка штатного слоя и сканирование по приватному списку
запретов. Повторный checkpoint Claude Opus вернул
`D01_CHECKPOINT=PASS_WITH_CONCERNS` и `SCALE_READY=no`; Codex независимо подтвердил
оставшиеся архитектурные проблемы и недостатки доказательств. Владелец одобрил
проверенную траекторию как допустимое доказательство реализации, и она включена в
`actual_traces`; её допустимость не зависит от будущей проверки готовности к
масштабированию. Затем владелец одобрил `SES-20260830-002`, а траектория
`TRC-BG-D01-SCALE-002` прошла захват, проверку, безопасное сканирование и включение в
допустимые доказательства владельцем. После того как приёмочная матрица Codex
подтвердила четыре оставшихся блокера, владелец одобрил ограниченную границу
`SES-20260830-003` и одну допустимую траекторию реализации
`TRC-BG-D01-SCALE-003`. Настоящий оркестратор, рабочие процессы, повторное
воспроизведение и отчёт теперь проходят по одному общему пути исполнения с
внедряемым описателем, а D01 остаётся корнем композиции только из данных. Схема
наблюдения D01 передаётся явно; специальный описатель только для тестов доказывает
вызов внедрённых контрактов через настоящий конвейер. Доказательства запуска теперь
проверяют связь запуска с рабочим процессом, канонические хеши песочницы и правил
путей, точное взаимно-однозначное соответствие роли, профиля и доказательства,
автомат состояний событий каждой группы и связь оценщика с неизменяемым хешем
решения. Автономное повторное воспроизведение независимо проверяет
`reasonCorrectReject` и `oracleAcceptedCandidate`. Рекурсивная проверка пакета
принимает корректные вложенные структуры и отклоняет изменение байтов уже
зарегистрированного исходного файла. В последующей одобренной владельцем границе
`SES-20260830-004` все пять ограниченных блокеров закрыты без изменения пяти видимых
утверждений, байтов кандидатов, зафиксированного поведения, oracle, методики оценки,
целей, зависимостей или политики среды выполнения. Обычные тесты прошли `56/56`;
полный `d01:verify`, автономное воспроизведение и проверка этапа 0.5 прошли. Восемь
автоматических implementation JSONL-захватов прошли безопасное сканирование, а
повторная матрица Codex дала PASS по A1, A2, A3, S1, S2, S3, S4, P1, P2 и D1.
Владелец одобрил основную трассу и семь продолжений, включил все восемь захватов в
`actual_traces` и явно установил `SCALE_READY=true`. Детерминированная редактура
машинных путей перед подачей остаётся обязательной. Официальных или оцениваемых запусков, вызовов
живой модели или Chromium, работ по BG-D02, commit и push не было.
**Одобрение человеком:** 2026-08-29T10:46:39Z
**Чистая сессия:** `SES-20260829-001`

Этот документ полностью переводит нормативную спецификацию продукта на русский
язык. При любом расхождении действует английский `docs/PROJECT_SPEC.md`; исправлять
следует перевод, а не смысл нормативного источника.

`docs/PROJECT_SPEC.md` — единственный нормативный контракт семантики продукта.
`docs/SUBMISSION_ARTIFACTS_SPEC.md` — подчинённый, но обязательный контракт поставки:
он может добавлять требования к упаковке и доказательствам, но не может менять
семантику продукта. `config/topic.yaml`, `docs/EVALUATION.md`, диаграммы, changelog,
планы реализации, схемы и отчёты являются проекциями ID требований этой
спецификации. При конфликте действует нормативный файл, а проекция исправляется.

Код продукта, реализации фикстур, official benchmark runs и scored model results не
являются частью этой спецификации. Phase 0.5 feasibility evidence упоминается только
для фиксации pre-product contracts и ограничений.

## 1. Тезис продукта

**BeyondGreen** помогает frontend-инженеру решить, безопасно ли сливать уже
существующую миграцию React state на signals, когда зрелые legacy-тесты зелёные, но
могут быть неполными. Опасный результат — правдоподобный кандидат, который
компилируется и проходит видимые тесты, но меняет наблюдаемое поведение, порядок
обновлений, идентичность, жизненный цикл, подписку или rollback-инвариант, не
покрытый этими тестами.

> Зелёная компиляция и legacy-тесты — это доказательства, но не доказанность.
> Сливать следует только тогда, когда независимый верификатор может связать
> неизменяемого кандидата с полными воспроизводимыми поведенческими доказательствами.

Judge-facing имя — BeyondGreen. Это только marketing rename; доказанный scope v1
остаётся React state → signals. Основной пользователь — frontend-инженер, мигрирующий
зрелый React-код при зелёных, но потенциально неполных legacy-тестах.

Единственный scored workflow — **verify-existing**. Кандидат уже существует до
оцениваемого запуска и остаётся неизменяемым на всём протяжении проверки.
BeyondGreen строит инвентаризацию рисков, выводит дополнительные probes и
поведенческие контракты, выполняет независимые проверки и возвращает подтверждённое
доказательствами решение о merge. Во время scored run он не создаёт и не исправляет
кандидата.

Полезный результат для каждого кандидата — **пакет доказательств проверки**:

- неизменяемая идентичность кандидата и хеши;
- инвентаризация рисков состояния, зависимостей, lifecycle, подписок, порядка,
  identity и rollback;
- результаты компиляции и видимых legacy-тестов;
- результаты дополнительных probes и поведенческих контрактов;
- финальный вердикт `accept`, `reject` или `abstain` с обоснованием;
- JSON, проверенный схемой, и статический HTML-отчёт;
- метаданные runtime, human time, model/token reporting, billing mode и статуса
  применимости monetary cost; и
- digests доказательств, достаточные для воспроизведения решения.

## 2. Scope, нецели и граница продукта

### Обязательный scope v1

- Только проверка существующих кандидатов React state → signals.
- Десять независимо созданных синтетических фикстур: четыре development и шесть
  held-out.
- Один behavior-preserving и один seeded false-green candidate на фикстуру: ровно 20
  фиксированных решений accept/reject.
- Два scored arms с одинаковыми неизменяемыми кандидатами: status-quo baseline и
  BeyondGreen.
- Воспроизводимый CLI, schema-validated JSON и статический HTML report.
- Полностью Node.js/TypeScript stack: TypeScript Compiler API, Zod, `node:test`,
  минимальный React harness, формальные поведенческие проверки в jsdom, а Chromium —
  только для demo и вторичных performance-доказательств.
- Provider-neutral adapter reasoning-модели и offline replay.
- Физическая изоляция скрытого оракула, `K=0` feedback верификатора и обязательный
  denied-access test.
- Один реалистичный E2E demo, полный changelog/reproduction evidence, eligible traces
  и репетиция submission после clean extraction.

### Не оценивается и жёстко ограничено

После вердикта и явного человеческого одобрения допускается одна демонстрация
targeted repair для development-фикстуры `BG-D01`. Она не оценивается, явно
маркируется и после неё выполняется новая независимая проверка. Она не может менять
scored result.

### Отложено до прохождения обязательных gates

- generation-migration как scored mode;
- третий scored arm;
- полноценный GUI;
- широкий mutation catalog;
- performance как primary claim; и
- дополнительные control docs, не требуемые qualification, judging или release.

### Явные нецели

- Автоматическое изменение реального или проприетарного репозитория.
- Заявления об общем codemod coverage, production readiness, статистической
  значимости или production performance.
- Обучение или fine-tuning модели.
- Оптимизация по held-out-результатам после unblinding.
- Доступ к browser, connected apps, private MCP, private memory, sibling workspace
  или private repository.
- Product source, fixtures, tests или scripts на Python.

## 3. Термины и семантика решений

| Термин | Нормативное определение |
| --- | --- |
| Candidate | Уже существующее изменение React state → signals, замороженное и хешированное до запуска любого scored arm. |
| Behavior-preserving candidate | Кандидат, который компилируется и выполняет все замороженные observable-, lifecycle-, subscription-, ordering-, identity- и rollback-инварианты своей фикстуры. |
| Seeded false green | Фиксированный кандидат, который компилируется и проходит видимые legacy-тесты, но нарушает хотя бы один verifier-only поведенческий инвариант. |
| Status-quo baseline | Политика, принимающая кандидата при успешной компиляции и зелёных видимых legacy-тестах без дополнительных probes, contracts или анализа риска. |
| Hidden behavior oracle | Замороженное ожидаемое поведение и проверки, физически недоступные обоим scored arms и принадлежащие только независимому evaluator. |
| Внутренний checker BeyondGreen | Принадлежащий arm oracle-free jsdom checker, который выполняет только выведенный arm `ProbePlan` и arm-visible contracts. |
| Независимый evaluator | Принадлежащий harness post-decision scorer, который единолично владеет verifier-only oracles и ground truth и запускается только после фиксации arm verdict. |
| `K=0` | Ноль evaluator-derived feedback или repair rounds до того, как arm verdict станет immutable и будет оценён. |
| `accept` | Доказательства полны, и все блокирующие проверки поддерживают merge неизменяемого кандидата. |
| `reject` | Доказательства выявляют воспроизводимый блокирующий дефект или нарушение контракта. |
| `abstain` | Решение нельзя доказательно принять из-за неполных evidence, операционной ошибки обязательного probe, timeout или иной неопределённости. Abstention блокирует merge. |
| Завершённое решение | Schema-valid финальный `accept` или `reject` с полными обязательными evidence. `abstain` не является completion. |
| Пакет доказательств проверки | Неизменяемая идентичность входа, risk inventory, результаты проверок, verdict, rationale, resource metadata и report artifacts для одного кандидата. |

Любой timeout, operational failure обязательного probe, недостаток evidence,
nondeterminism или попытка доступа к oracle приводит к fail-closed `abstain` и
блокирует merge. Такое событие нельзя молча превращать в `accept` или в доказанный
`reject`.

## 4. Инварианты clean-room и oracle

1. Работа над продуктом читает и пишет только внутри clean repository root.
2. Единственные допустимые операции вне корня — scanner-only чтение denylist и
   проверенная запись/чтение raw trace через именованные env-переменные.
3. Employer/client code, tests, data, identifiers, structures, screenshots, traces и
   private documentation не могут попадать в source, prompts, reports или artifacts.
4. Behavior prose фикстуры независимо создаётся по public anchors до появления кода
   фикстуры или кандидата, затем хешируется и проходит provenance review.
5. Arm-visible task package и verifier-only oracle package отдельно хешируются и
   хранятся. Ни process, ни filesystem mounts scored arms не содержат verifier-only
   paths.
6. Oracle isolation обеспечивается capabilities, а не текстом prompt. До scored runs
   обязателен denied-access test.
7. Evaluation использует `K=0`: никакой independent-evaluator result, category,
   expected value, action-level diagnostic, diff или mutant information не достигает
   arm до финализации и оценки его вердикта.
8. Scanner findings, неопределённые provenance/license или сходство с запомненной
   приватной структурой останавливают затронутую задачу для human review.
9. Judge-facing records раскрывают имена env-переменных и digests, но не приватные
   значения, denylist contents или raw absolute paths.

## 5. Фиксированный benchmark и создание candidates

Evaluation v1.1 содержит ровно десять независимо созданных синтетических фикстур:

- `BG-D01`–`BG-D04`: development fixtures;
- `BG-H01`–`BG-H06`: held-out fixtures.

До fixture code каждой фикстуре назначается ровно один behavior class. Assignment
является bijection: каждый class используется ровно одной fixture.

1. stale snapshots;
2. queued или batched updates;
3. derived state;
4. subscription cleanup;
5. prop reset;
6. async ordering;
7. identity stability;
8. conditional lifecycle;
9. external store; и
10. rollback.

До fixture code минимум одна fixture маркируется challenging case. Её manifest
записывает причину сложности и behavior class, а final report объясняет, что показал
её результат.

Для каждой фикстуры независимый fixture-authoring path создаёт и замораживает:

- behavior-first prose, public anchors, neutral domain, provenance, license/terms,
  observable actions, invariants и SHA-256 digest;
- один behavior-preserving candidate; и
- один seeded false-green candidate, который остаётся зелёным при compilation и
  visible legacy tests, но нарушает хотя бы один verifier-only invariant.

Каждый behavior-preserving candidate также обязан компилироваться и проходить 100%
visible legacy tests своей fixture. Freeze self-test фиксирует этот факт; preserving
candidate, проваливший visible gate, недействителен и независимо создаётся заново до
benchmark freeze.

Итого ровно 20 фиксированных ground-truth решений: десять `accept` и десять `reject`.
Оба scored arms получают те же candidates. Development/held-out membership, hashes
кандидатов, ground truth, visible inputs и oracle hashes замораживаются до
оптимизации solution. Development workflow и оба arms capability-denied доступ к
held-out oracle packages; evaluator открывает их только при единственном записанном
unblinding.

До scored run любого arm evaluator self-tests обязаны принять все десять preserving
candidates и отклонить все десять false-green candidates. Любая ошибка блокирует
evaluation.

## 6. Нормативный scored workflow

Подготовка fixture и evaluator происходит вне обоих scored arms:

```text
author behavior prose and public provenance
  -> freeze arm-visible task package
  -> independently freeze verifier-only oracle package
  -> create and hash preserving and false-green candidates
  -> evaluator self-test on all 20 candidates
  -> human freeze approval
```

Scored workflow BeyondGreen:

```text
ingest immutable existing candidate
  -> inventory migration risk
  -> run compilation and visible legacy tests
  -> derive additional probes and behavioral contracts
  -> execute arm-owned oracle-free jsdom checks from the ProbePlan
  -> assemble complete evidence
  -> accept | reject | abstain
  -> emit JSON and static HTML report
  -> freeze arm verdict
  -> independent evaluator scores against verifier-only oracle
```

Hash кандидата проверяется до и после каждого scored run. BeyondGreen не может
редактировать, регенерировать, исправлять candidate или запрашивать второй. Evaluator
владеет финальным ground-truth scoring и не передаёт repair feedback во время run.

Для каждого candidate существует ровно один официальный scored run, ровно одна
попытка и максимум три минуты wall-clock. После Phase 0.5 и до fixtures
замораживаются model/mode, число вызовов, timeout/retry limits, правило учёта
tokens, fixed-subscription billing mode и статус применимости monetary cost;
расчёт, оценка или cap per-run USD не требуются. Timeout даёт `abstain`.
Provider transport или rate-limit failure не разрешает model retry или вторую
attempt и даёт `abstain`. Offline replay воспроизводит evidence и не является retry.

Status-quo baseline запускает тот же candidate, compilation command, visible tests,
environment, wall-clock ceiling и evidence recorder. Он принимает только при зелёной
компиляции и всех видимых legacy-тестах. Он не строит risk inventory, additional
probes, behavioral contracts или oracle-aware verification.

Для BeyondGreen доказанная compilation failure или deterministic visible legacy-test
failure является blocking defect и принудительно даёт `reject`. Crash, timeout или
nondeterministic legacy-gate result даёт `abstain`. BeyondGreen никогда не может
выдать `accept`, если legacy gate не зелёный.

## 7. Целенаправленная архитектура и typed contracts

Минимальный solution — один BeyondGreen orchestrator с узкими typed stages,
arm-owned oracle-free internal checker и отдельной independent evaluator boundary.
Этапы не являются декоративными autonomous agents.

| Этап | Вход | Выход | Fail-closed condition |
| --- | --- | --- | --- |
| `ingestCandidate` | Candidate path, fixture ID, frozen manifest | `ImmutableCandidateRef` с hashes | Missing input, hash mismatch, outside-root path |
| `inventoryRisk` | Immutable candidate и visible source/types | `RiskInventory` | Unsupported syntax, ambiguous ownership, external import |
| `runLegacyGate` | Candidate, compile command, visible test IDs | `LegacyGateResult` | Crash, timeout, nondeterminism |
| `deriveProbePlan` | Risk inventory и arm-visible contracts | `ProbePlan` со связями risk-to-check | Missing coverage или unsupported risk |
| `runInternalChecks` | Immutable candidate reference, arm-derived `ProbePlan`, arm-visible contracts | `InternalCheckResult` и evidence digests | Oracle access attempt, required-probe failure, timeout, nondeterminism |
| `decide` | Полные immutable stage records | `accept`, `reject` или `abstain` с rationale | Missing или inconsistent evidence |
| `buildReport` | Финальный evidence bundle | Schema-valid JSON и static HTML | Schema failure, dangling evidence, unsupported claim |

Runtime schemas используют Zod. Анализ source и types использует TypeScript Compiler
API. Формальные поведенческие проверки выполняются в jsdom через минимальный React
harness и `node:test`. Chromium исключён из formal correctness scoring и применяется
только для E2E demo и одного secondary performance scenario.

Reasoning engine подключается через provider-neutral adapter. Live engine выбирается
в Phase 0.5 и замораживается до fixtures. Каждый live result должен записываться и
воспроизводиться offline adapter без network. Offline replay воспроизводит submitted
evidence и не является новой scored attempt.

`InternalCheckResult` содержит только outcomes arm-visible probes и их evidence
digests и не имеет oracle capability. После фиксации arm verdict независимый
evaluator создаёт `EvaluatorResult` с ground-truth score и evidence digests. До
финализации он не раскрывает ни одному arm oracle source, expected values, action
sequences, reference diffs, failure category или diagnostics. Evaluator version/hash
mismatch делает scored record недействительным и блокирует benchmark; arm не может
наблюдать это событие или менять из-за него свой verdict.

## 8. Честное сравнение двух arms

| Arm | Входы | Decision policy | Дополнительная verification |
| --- | --- | --- | --- |
| Status quo | Тот же immutable candidate, compiler, visible tests, environment и limits | Accept при зелёной compilation и visible tests; иначе reject либо abstain при операционно неопределённом execution | Нет |
| BeyondGreen | Идентичный candidate и visible inputs | Построить risk inventory и independent evidence, затем `accept`, `reject` либо fail-closed `abstain` | Additional probes/contracts и oracle-free internal behavioral checks |

Правила fairness:

- оба arms получают те же 20 candidates и frozen visible inputs;
- candidates остаются byte-identical между arms и на всём протяжении scoring;
- каждый arm получает одну официальную попытку на candidate и одинаковый
  трёхминутный wall-clock ceiling;
- environment, compilation, visible tests, scoring, seeds и operational ceilings
  идентичны;
- reasoning controls BeyondGreen замораживаются после Phase 0.5; раскрываются
  фактические model/mode, calls, technical limits, runtime, human time, tokens только
  при их явном стабильном выводе CLI, fixed-subscription billing и monetary-cost
  status без расчёта или оценки per-run USD;
- различия baseline по ресурсам честно раскрываются, а не скрываются и не
  выравниваются искусственно;
- все decisions оценивает только independent evaluator; и
- ни один held-out result не может настраивать evaluation v1.1 после unblinding.

## 9. Замороженные метрики и targets

Ground truth содержит десять preserving и десять seeded false-green candidates.

```text
correct_decision =
  (verdict == accept AND ground_truth == preserving) OR
  (verdict == reject AND ground_truth == false_green)

decision_accuracy = correct_decisions / 20
reason_correct_reject = verdict == reject AND rationale identifies the violated frozen behavior class or invariant family
defect_recall = false_green_candidates_with_reason_correct_reject / 10
false_alarm_rate = preserving_candidates_blocked / 10
preserving_candidate_blocked = verdict == reject OR verdict == abstain
completion_rate = completed_decisions / 20
completed_decision = schema_valid_complete_report AND verdict IN {accept, reject}
accuracy_advantage = BeyondGreen correct decisions - status_quo correct decisions
```

`abstain` работает fail-closed и блокирует merge, но не является правильным
accept/reject-решением, не учитывается в defect recall, считается false alarm на
preserving candidate и не считается completion.

Reason correctness оценивает post hoc только independent evaluator после фиксации
arm verdict и rationale. Это не создаёт evaluator feedback и не ослабляет `K=0`.

По construction все 20 candidates компилируются и проходят visible legacy tests.
Status-quo policy поэтому заранее должна принять все 20: ровно `10/20` correct
decisions, `0/10` defect recall и `0/10` false alarms. Это construction-validity
control, а не empirical finding. Любой иной completed baseline result делает
candidate set или run недействительным. Утверждённый target преимущества `>=6/20`
алгебраически эквивалентен абсолютному target accuracy `>=16/20` и сохраняется как
явное comparison requirement. Основной evidence-weight имеют абсолютная accuracy
BeyondGreen, reason-correct defect recall, false-alarm rate и held-out results.

Заранее объявленные targets BeyondGreen:

- decision accuracy не менее `16/20`;
- преимущество над status-quo baseline не менее `6/20` correct decisions;
- defect recall не менее `8/10`;
- false alarms не более `2/10`; и
- completion не менее `18/20`.

Если target не достигнут, публикуются полные фактические результаты без изменения
target или сокрытия failures. Результаты являются directional evidence только для
этого synthetic benchmark; statistical significance и production generalization не
заявляются.

Supporting measures: runtime, completion, human time, model/mode, invocation count,
technical limits, tokens только при их явном стабильном выводе CLI, billing mode и
статус применимости monetary cost по arm и candidate. Для fixed subscription per-run
USD имеет статус `not_applicable` или `not_measured`, не оценивается и не записывается
нулём. Отсутствующее наблюдение — `not_measured`, а не ноль.
Aggregates включают totals и явно определённые median/p95, где это уместно.
Human time означает только agent-supervision time. Экономия human time относительно
автоматического status-quo arm не заявляется; manual review time вне scope и не
оценивается.

## 10. Вторичные performance-доказательства

Performance не является primary metric. Допускается ровно один воспроизводимый
synthetic Chromium before/after scenario как secondary evidence.

Порядок protocol:

1. выполнить идентичные user actions для before и after implementations;
2. доказать идентичность всех объявленных behavioral invariants и observable outputs;
3. только после прохождения behavioral equivalence сравнить React render counts и CPU;
4. опубликовать environment, actions, repeats, raw measurements и variance; и
5. при провале любого behavioral check не заявлять performance win.

Performance не может компенсировать correctness failure и не влияет на 20 scored
decisions.

## 11. Функциональные требования

| ID | Требование | Приёмочное доказательство | Mapping |
| --- | --- | --- | --- |
| FR-001 | Принять существующий immutable candidate и постоянно проверять его hash. | Hash/immutability contract tests | RUB-ASE, RUB-REP |
| FR-002 | Инвентаризировать state, reads/writes, derived edges, subscriptions, lifecycle, ordering, identity и rollback risks. | Risk-inventory schema и D01 report | RUB-ASE, RUB-E2E |
| FR-003 | Запустить compilation и все visible legacy tests без изменения их semantics. | Per-candidate legacy-gate records | RUB-MI, RUB-REP |
| FR-004 | Вывести дополнительные risk-linked probes и behavioral contracts только из arm-visible evidence. | Probe-plan schema и trace | RUB-ASE |
| FR-005 | Выполнить выведенные arm формальные jsdom behavioral checks в oracle-free internal checker. | Contract tests и internal-check evidence | RUB-ASE, RUB-E2E |
| FR-006 | Физически изолировать hidden oracles и доказать denied access до scoring. | Process/mount и denied-access tests | RUB-ASE, QG-ORIG |
| FR-007 | Обеспечить `K=0` и immutable one-attempt scored execution. | Capability и run-cardinality tests | RUB-ASE, RUB-MI |
| FR-008 | Выдавать fail-closed `accept`, `reject` или `abstain` из полных evidence. | Verdict-policy negative tests | RUB-E2E, RUB-ASE |
| FR-009 | Предоставить reproducible CLI, schema-valid JSON и static HTML reports. | CLI/E2E/schema tests | RUB-E2E, RUB-REP |
| FR-010 | Поддержать provider-neutral live adapter и deterministic offline replay. | Adapter contract и replay tests | RUB-ASE, RUB-REP |
| FR-011 | Выполнить оба scored arms на тех же 20 immutable candidates. | Candidate/hash/run reconciliation | RUB-MI |
| FR-012 | Допустить только один approved unscored D01 repair demo с последующей fresh independent verification. | Demo label, approval и rerun evidence | RUB-E2E, QG-ORIG |

## 12. Требования качества и безопасности

| ID | Требование | Приёмочное доказательство | Mapping |
| --- | --- | --- | --- |
| NFR-001 | Использовать Node.js/TypeScript, TypeScript Compiler API, Zod, `node:test`, minimal React harness и jsdom для formal checks. | Lockfile, language и dependency audit | RUB-REP, QG-REPRO |
| NFR-002 | Fail closed в `abstain` при timeout, failed required probe, nondeterminism, ambiguity или incomplete evidence. | Negative tests | RUB-ASE, QG-ORIG |
| NFR-003 | Обеспечить ровно одну attempt, отсутствие model transport retry и максимум три минуты на официальный run каждого candidate. | Run-policy audit | RUB-MI, RUB-REP |
| NFR-004 | До fixture implementation заморозить model/mode, adapter policy, invocation/time/retry limits, token-reporting policy, fixed-subscription billing и monetary-cost status, dependencies и evaluator; не проектировать per-run USD estimate или cap. | Versioned manifests и hashes | RUB-REP, QG-ORIG |
| NFR-005 | Сделать hidden oracle, private workspace, browser, connected app, private MCP и global memory недоступными или неиспользуемыми по контракту. | Capability audit и denied-access tests | RUB-ASE, QG-ORIG |
| NFR-006 | Никогда не раскрывать secrets, private paths/terms, oracle details или unsupported claims. | Preflight и human review | RUB-REP, QG-ORIG |
| NFR-007 | Сохранять каждый failure, abstention, negative result, retry prohibition, resource observation и decision. | Immutable evidence reconciliation | RUB-MI, QG-TRACE |
| NFR-008 | Обеспечить offline replay live runs и независимость judge-critical checks от network credentials. | Clean replay/extraction test | RUB-REP, QG-REPRO |
| NFR-009 | Считать performance вторичным и behavior-gated; полноценный GUI не требуется для v1. | Performance protocol и scope audit | RUB-PUV, RUB-MI |

## 13. Требования к evaluation

| ID | Требование | Приёмочное доказательство | Mapping |
| --- | --- | --- | --- |
| EV-001 | Использовать ровно 10 fixtures со split 4 development/6 held-out и десятью frozen behavior classes. | Fixture manifest и hashes | RUB-MI, RUB-REP |
| EV-002 | Заморозить один preserving и один seeded false-green candidate на fixture до arm runs; оба компилируются и проходят 100% visible legacy tests. | 20-candidate/visible-gate manifest | RUB-MI, QG-ORIG |
| EV-003 | Дать обоим scored arms одинаковые immutable candidates, visible inputs, environment и scoring. | Cross-arm digest audit | RUB-MI, RUB-REP |
| EV-004 | Оценивать ровно одну official attempt на arm/candidate с лимитом три минуты. | Run cardinality и timeout audit | RUB-MI |
| EV-005 | Выполнить self-test visible gate и evaluator на всех 20 candidates: все visible gates зелёные, затем 10 oracle accepts и 10 oracle rejects. | Visible/evaluator control report | RUB-ASE, RUB-MI |
| EV-006 | Обеспечить physical oracle isolation, denied-access testing и `K=0`. | Boundary evidence | RUB-ASE, QG-ORIG |
| EV-007 | Точно вычислять decision accuracy `/20`, accuracy advantage, reason-correct defect recall `/10`, false-alarm rate `/10` и completion `/20`. | Independent aggregate recomputation | RUB-MI |
| EV-008 | Сохранить пять predeclared targets и публиковать честные actuals при недостижении. | Rubric/hash и final report | RUB-MI, QG-ORIG |
| EV-009 | Записывать runtime, human time, model/mode, invocation count, technical limits, tokens при стабильном выводе, fixed-subscription billing, monetary-cost applicability/status, errors, abstentions, evidence paths и hashes по каждому candidate. | Immutable per-candidate records | RUB-PUV, RUB-REP |
| EV-010 | Итерировать только по development evidence и раскрыть held-out один раз. | Changelog и unblinding record | RUB-MI, QG-ORIG |
| EV-011 | Оставить D01 repair unscored и требовать approval плюс independent reverification. | Demo/run classification audit | RUB-E2E, QG-ORIG |
| EV-012 | Разрешить single Chromium performance comparison только после identical actions и passed behavioral invariants. | Performance evidence record | RUB-MI |
| EV-013 | До fixture code маркировать минимум одну fixture как challenging case, записать причину и behavior class и сообщить, что показал финальный результат. | Challenging-case manifest и report | RUB-MI, RUB-E2E |

## 14. Требования к artifacts и evidence

| ID | Требование | Приёмочное доказательство | Mapping |
| --- | --- | --- | --- |
| AR-001 | Сохранять этот файл единственным product-semantics contract, а artifact spec — подчинённым. | Hierarchy consistency test | RUB-REP, QG-ORIG |
| AR-002 | Связать projections, schemas, decisions, claims и diagrams с requirement IDs и canonical rubric tokens. | Traceability validator | Все rubric criteria |
| AR-003 | Сохранить точные CLI, npm и Make commands и включённые в archive arm-visible/verifier-only packages для baseline, BeyondGreen, tests, evaluation, replay, demo и packaging. | Clean reproduction и oracle-boundary log | RUB-MI, RUB-REP |
| AR-004 | Записывать каждую meaningful retained, revised, removed, neutral и negative iteration с hypothesis, change, command, evidence и decision. | Improvement Changelog | RUB-MI, RUB-HT |
| AR-005 | Сохранить eligible representative trajectories реализации Codex и read-only checkpoints Claude с retries и human approvals. | Reviewed trajectory index | RUB-ASE, QG-TRACE |
| AR-006 | Записать public anchors, provenance, license/terms, prose hashes, candidate hashes, oracle hashes и reviews. | Provenance index | RUB-REP, QG-ORIG |
| AR-007 | Связать каждый judge-facing claim с immutable evidence и run IDs; unsupported claims блокируют release. | Claims ledger validation | Все rubric criteria |
| AR-008 | Поставить один E2E demo, public video не более пяти минут и manifest-backed ZIP, прошедший clean extraction. | Demo/video/extraction records | RUB-E2E, RUB-REP, QG-COMP |
| AR-009 | Сохранить один documented negative или removed experiment и все must-not-cut artifacts. | Changelog, report, manifest audit | RUB-HT, QG-COMP |

Canonical tokens: `RUB-PUV` (15), `RUB-ASE` (30), `RUB-E2E` (20), `RUB-MI`
(15), `RUB-REP` (15), `RUB-HT` (5), а также qualification gates `QG-ELIG`,
`QG-COMP`, `QG-ORIG`, `QG-TRACE` и `QG-REPRO`.

## 15. Контракт воспроизводимости и интерфейса

Runtime — Node.js `22.22.3` и npm `10.9.8`. В `package-lock.json` версии 3
зафиксированы точные версии: TypeScript `5.9.3`, React и ReactDOM `19.2.8`, jsdom
`30.0.1`, Zod `4.5.2`, `@types/node` `22.20.1`, `@types/react` `19.2.18`,
`@types/react-dom` `19.2.5` и `@types/jsdom` `30.0.0`. Выбран публичный signals-пакет
`@preact/signals-react@3.12.0` с лицензией MIT. Его возможности и аудит косвенных
лицензий зафиксированы в `config/phase-0.5.candidate.yaml` и
`artifacts/phase-0.5-license-audit.json`.

Необязательный live-adapter `codex-exec-jsonl-v1` использует локально авторизованную
команду `codex exec --ephemeral --ignore-user-config --json --output-schema <schema>
--sandbox read-only --model gpt-5.6-sol`: один вызов на candidate, без model или
transport retry, общий лимит 180 секунд с резервом 15 секунд на финализацию. Во
вложенной Codex desktop-среде его runtime-поведение отложено и не проверено по явному
решению владельца для Phase 0.5. Два измеренных CLI-отказа остаются отказами; работа
Sol, наблюдаемая владельцем в приложении, не является submission evidence.
Проверенный путь воспроизводимости — deterministic `offline-replay-jsonl-v1` с
форматом `beyondgreen-replay-jsonl@1.0.0`, UTF-8/LF, canonical JSON RFC 8785,
SHA-256 chain, без сети, subprocess и записи в workspace. Он не доказывает живую
работу модели.

Archive резервирует `evaluation/arm-visible/` для task packages и
`evaluation/verifier-only/` для oracle packages и ground-truth manifests. Оба
каталога входят в final ZIP для воспроизведения scoring. Runtime process/filesystem
capabilities, а не отсутствие в version control, запрещают scored arms монтировать
или читать `evaluation/verifier-only/`. Clean-extraction evaluation воспроизводит и
проверяет эту denied-access boundary.

Обязательные семейства команд:

```text
npm ci
npm test
npm run compile
npm run task -- list
npm run task -- d01:verify
npm run preflight:implementation
npm run task -- baseline:verify --evaluation-version eval-v1.1.0
npm run task -- beyondgreen:verify --evaluation-version eval-v1.1.0
npm run task -- evaluation:run --evaluation-version eval-v1.1.0
npm run task -- replay --evaluation-version eval-v1.1.0
npm run task -- demo:d01
npm run task -- performance:d01
npm run task -- artifacts:check
npm run task -- submission:build
```

В корневом `package.json` остаются только устойчивые общие точки запуска. Команды,
относящиеся к конкретному этапу или примеру, описываются в типизированном и удобном
для проверки реестре `scripts/tasks/`. Команда `npm run task -- list` показывает
только уже реализованные задачи. Имена будущих семейств команд из списка выше будут
добавляться в реестр лишь после отдельного разрешения и появления соответствующей
реализации.
Команда `npm test` передаёт работу задаче `test:all`, которая в постоянном порядке
находит файлы `*.test.ts` только внутри заранее разрешённых открытых каталогов
`tests/` и `evaluation/arm-visible/`. Пустой набор, путь за пределами этих каталогов
или символическая ссылка приводят к безопасному отказу. Скрытые эталонные проверки
намеренно не входят в обычный набор. Исторические команды живых запусков Phase 0.5
в повседневном реестре отсутствуют.

Обязательный top-level Make interface — тонкие one-to-one wrappers:

```text
make setup           -> npm ci
make baseline        -> npm run task -- baseline:verify
make solution        -> npm run task -- beyondgreen:verify
make test            -> npm test
make eval            -> npm run task -- evaluation:run
make replay          -> npm run task -- replay
make demo            -> npm run task -- demo:d01
make artifacts-check -> npm run task -- artifacts:check
make submission      -> npm run task -- submission:build
```

CLI обязателен. JSON output проходит versioned Zod schema. Static HTML report
генерируется только из validated JSON и не требует server. Полноценный GUI не
является gate v1.

Каждая command записывает exit status, environment versions, evaluation version,
candidate/fixture IDs, hashes, duration, model/mode, invocation count, technical
limits, tokens только при стабильном выводе CLI, fixed-subscription billing,
monetary-cost applicability/status, human time и output paths. Per-run USD не
рассчитывается, не оценивается и не ограничивается cap. Offline replay воспроизводит
report artifacts из submitted records без credentials.

## 16. Протокол improvement и unblinding

1. Заморозить v1.1 requirements, evaluation formulas, targets, budgets, candidates и
   oracle isolation до optimization.
2. Сохранить runnable status-quo baseline и каждую BeyondGreen iteration.
3. Для каждой iteration записывать hypothesis, exact change, exact command/version,
   evidence/run IDs, result, decision, retry/failure information и human checkpoint.
4. Сохранять retained, revised, removed, neutral и negative experiments.
5. Итерировать только по development evidence `BG-D01`–`BG-D04`.
6. Выполнить ровно одно объявленное unblinding `BG-H01`–`BG-H06`.
7. Не настраивать evaluation v1.1 после unblinding. Corrections требуют новой
   benchmark version и лишают утверждения untouched-held-out.
8. Выводить strongest change, removed experiment, remaining failure и hot take только
   из measured evidence.

## 17. Контракт demo, repair и video

Один E2E demo показывает уже существующий candidate, зелёное решение status quo,
risk/probe evidence BeyondGreen и финальные decision/report. Demo является
сохранённым реальным run, а не hand-authored mock.

После неизменяемого scored verdict и явного human approval `BG-D01` можно использовать
для одной targeted unscored repair demonstration. Repaired candidate — новый demo
artifact, который проходит fresh independent verification. Его result и resource use
не входят в 20 scored decisions.

Public video длится не более пяти минут и покрывает: user и bottleneck; status-quo
baseline; одну E2E verification; two-arm comparison; strongest measured change; один
removed/negative experiment; remaining limitation; practical hot take; и
reproduction path. Link открывается без запроса permission.

## 18. Coding workflow и checkpoints независимого review

Codex реализует repository. Claude — bounded read-only independent reviewer ровно на
трёх checkpoints:

1. normative v1.1 до product code;
2. полный `BG-D01` vertical slice до масштабирования; и
3. final ZIP после clean extraction.

Claude получает minimum sufficient clean packet, не может редактировать и не
авторизует changes. Codex независимо проверяет каждое actionable finding. Где
указано, human approval остаётся gate после review.

Одобрение этой спецификации и фиксация этапа 0.5 сами по себе не разрешали разработку
продукта. Граница и первоначальная проверка траектории уже пройдены. Ограниченная
основа D01 начата по явному разрешению владельца в `SES-20260829-004`, после проверки
траектории этапа 0.5 и фиксации поведения и происхождения D01. Затем владелец одобрил
`SES-20260829-005` для полного неоцениваемого вертикального сценария D01, но эта
сессия разработки теперь исключена под `EXC-003`. Владелец разрешил независимое
чистое восстановление в `SES-20260829-007`; изменения SES-006 не наследовались. Это
разрешение покрывает только один учебный сценарий разработки до отчётов и
автономного воспроизведения. Официальные или оцениваемые запуски, исправление
кандидата, другие примеры, обращения к модели или Chromium, commit, push и все
последующие этапы требуют отдельных разрешений.

## 19. Critical path и milestones

| Фаза | Результат | Blocking gate |
| --- | --- | --- |
| 0. Normative v1.1 | Одобренная BeyondGreen spec и согласованные projections | Claude read-only review, Codex reconciliation, final human spec approval |
| Trace-first gate | Submission-eligible implementation session и trajectory plan | Approved boundary, control preflight, verified trace capture и structural implementation preflight, чистый кроме перечисленных в section 20 решений Phase 0.5 |
| 0.5 Stack spike | Зафиксированные public stack, lockfile, optional/unverified live adapter, verified offline replay, budget policy, behavior assignment и Chromium protocol | Закрыта с явным nested-CLI waiver после license 54/54, stack 11/11, replay controls и PASS правильности Chromium-сценария на 300 карточек; CPU improvement не доказано |
| D01 vertical slice | Один полный verify-existing case, reports, isolation и E2E demo path | Все contracts, denied-access test, clean replay и второй Claude checkpoint проходят |
| Early package rehearsal | ZIP собран и запущен после clean extraction | Required files, commands, licenses, traces и manifests согласованы |
| Remaining fixtures | `BG-D02`–`BG-D04` и `BG-H01`–`BG-H06` prose, candidates, oracles и development validation | Provenance, hashes, evaluator self-tests, challenging-case label и split 4/6 заморожены |
| Single unblinding | Один официальный two-arm run по всем 20 decisions | После него нет v1.1 held-out tuning; публикуются честные results |
| Final package | Public video, changelog, reports, traces и ZIP | Clean extraction и final Claude checkpoint, затем human release approval |

Must not cut: десять cases/двадцать decisions; same candidates/scoring; physical
oracle isolation; eligible traces; clean-room/provenance; один E2E demo; changelog и
exact reproduction; public video максимум пять минут; ZIP clean-extraction rehearsal;
и один negative или removed experiment.

## 20. Открытые и зафиксированные решения

### Зафиксировано v1.1

- Имя BeyondGreen и scored workflow только verify-existing.
- Два scored arms и одинаковые 20 immutable candidates.
- Десять fixtures, split 4/6, десять behavior classes, metrics, formulas и targets.
- Лимит три минуты, одна attempt, `K=0`, physical oracle isolation, fail-closed
  abstention, CLI/JSON/HTML interface, Node/TypeScript stack и secondary-only Chromium
  performance.
- Реализация Codex и три bounded Claude read-only checkpoints.

### Зафиксировано Phase 0.5 в `2026-08-29T13:41:51Z`

1. Signals: `@preact/signals-react@3.12.0`, лицензия MIT; public repository и
   проверенные React/signals capabilities записаны в frozen decision packet.
2. Stack: Node `22.22.3`, npm `10.9.8`, TypeScript `5.9.3`, React/ReactDOM `19.2.8`,
   jsdom `30.0.1`, Zod `4.5.2` и точные type packages из раздела 15. Обязательны
   lockfile версии 3 и `npm ci`. Transitive-license gate прошёл 54/54;
   `THIRD_PARTY_NOTICES.md` обязателен для реально распространяемых dependencies.
3. Live reasoning: optional provider-neutral `codex-exec-jsonl-v1` с
   `gpt-5.6-sol` через ChatGPT-authenticated local `codex exec`, read-only sandbox,
   ephemeral session, ignored user config, JSONL/schema output, один вызов и ноль
   повторов. Проверка во вложенной desktop-среде пропущена владельцем, отложена и не
   доказана; два отказа остаются отказами, а app-level Sol не является submission
   evidence. При недоступности — `abstain`, substitute model запрещён.
4. Budget/accounting: fixed subscription; per-run USD имеет статус `not_applicable`
   или `not_measured` и не рассчитывается, не оценивается и не ограничивается cap.
   Tokens записываются только при явном стабильном выводе CLI. Один вызов, ноль
   повторов, 165 секунд engine + 15 секунд finalization.
5. Replay: `offline-replay-jsonl-v1` / `beyondgreen-replay-jsonl@1.0.0`, UTF-8/LF,
   RFC 8785 JCS, SHA-256 chain, один schema-valid final output, без network,
   subprocess и workspace write. Это проверенный путь воспроизводимости, а не model
   retry и не доказательство live operation.
6. Assignment: `BG-D01` stale snapshots (museum visit group allocation board),
   `BG-D02` queued/batched updates, `BG-D03` derived state, `BG-D04` subscription
   cleanup; `BG-H01` prop reset, `BG-H02` async ordering и заранее объявленный
   challenging case, `BG-H03` identity stability, `BG-H04` conditional lifecycle,
   `BG-H05` external store, `BG-H06` rollback. Fixture prose и oracle contents пока
   не создавались и будут отдельно независимо authored.
7. Chromium: независимая museum-board CSS grid на 300 карточек; порядок действий
   `mount`, `select-all`, `allocate-1x2`, `step-3`, `allocate-3x2`,
   `select-every-third`, `remove-3x1`, `reset`; 5 warmups и 30 measured samples на
   arm с чередованием. Correctness прошёл для всех значений, selections, action
   digest, reset и нулевых page errors. Synthetic card renders: 2400 baseline и 1900
   advanced, то есть на 20,83% меньше. Средний CDP `TaskDuration`: 4,7071 мс и
   5,0037 мс, поэтому CPU improvement явно не доказано. Render-count result относится
   только к этому synthetic spike, не влияет на scored decisions и не является
   production-performance claim.

Ранее владелец условно решил закрыть Phase 0.5, если после Chromium не останется
других препятствий. Координатор подтвердил correctness и reproducibility evidence,
поэтому условие выполнено. Эта фиксация закрывает только Phase 0.5 и не разрешает
product code, scored fixtures/candidates/oracles, official benchmark, commit или push.

## 21. Traceability и полнота rubric

| Область контракта | Требования | Основное доказательство | Rubric/gate |
| --- | --- | --- | --- |
| User и decision value | Разделы 1–3 | README, D01 report, video | RUB-PUV, RUB-E2E |
| Immutable verify-existing workflow | FR-001–FR-008 | Contract, boundary и verdict tests | RUB-ASE, RUB-E2E |
| Required interface и replay | FR-009–FR-010, NFR-008 | CLI/schema/HTML/replay tests | RUB-ASE, RUB-REP |
| Fair two-arm evaluation | FR-011, EV-001–EV-010 | Manifests, per-case records, aggregate recomputation | RUB-MI, QG-ORIG |
| D01 repair и performance guard | FR-012, EV-011–EV-013, NFR-009 | Явно маркированные demo/performance/challenging-case evidence | RUB-E2E, RUB-MI |
| Clean room и provenance | NFR-004–NFR-007, AR-005–AR-007 | Preflight, provenance, trajectories, claims | QG-ORIG, QG-TRACE |
| Reproduction и release | AR-003, AR-008–AR-009 | Changelog, video, manifest, clean extraction | RUB-REP, RUB-HT, QG-COMP, QG-REPRO |

Статус qualification gate остаётся evidence-based. Полнота спецификации сама по
себе не доказывает eligibility, implementation completeness, trace integrity или
reproducibility. Любой отсутствующий implementation artifact остаётся `UNKNOWN`,
пока не создан и не проверен после final human approval.
