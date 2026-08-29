# BeyondGreen — управляющий статус и чек-лист

**Назначение:** локальный dashboard для Андрея и управляющей беседы
**Не входит в submission ZIP:** да
**Обновлено:** 2026-08-29 12:09 CEST
**Дедлайн:** 2026-08-31 20:00 CEST
**Остаток на момент обновления:** примерно 55 часов 50 минут

Обозначения:

- `[x]` — завершено и проверено;
- `[ ]` — ещё не завершено;
- **NOW** — текущее следующее действие;
- **BLOCKED** — нельзя продолжать без указанного гейта;
- **PARALLEL** — выполняется независимо от критического пути.

## 1. Короткий статус

**Control plane:** готов.
**Global product spec:** нормативная v1.1 подготовлена в отдельном worktree,
прошла bounded Claude review и Codex reconciliation; статус
`NORMATIVE_V1_1_APPROVED`, ожидается перенос изменений в основной каталог.
**Product implementation:** не начата и правильно заблокирована.
**Legacy-видео:** первая приватная часть «проблематизация и пользователь» записана;
до публичного использования ожидается timestamped NDA/privacy review.
**Submission evidence:** схемы подготовлены, реальные product runs и eligible traces
ещё не созданы.

Проверенное техническое состояние:

- [x] Ветка: `impl/stateshift-guardian`.
- [x] Контрольный snapshot: `5cae0e3b5a46ea56de7b36d1ef1f3799cfb19bcf`.
- [x] Node.js: `22.22.3`.
- [x] Тесты preflight: 10/10.
- [x] Implementation scanner: `READY_FOR_IMPLEMENTATION`.
- [x] Четыре официальных binary evidence-файла помечены для review и исключения из
  финального ZIP.
- [x] Python-кода и Python-runtime в проекте нет.
- [ ] Working tree пока не зафиксирован новым checkpoint-коммитом.
- [ ] Реализация продукта, фикстуры, benchmark runs и solution-agent runs не начаты.

## 2. Текущее следующее действие — NOW

- [x] Выполнен независимый premortem Codex.
- [x] Выполнен независимый read-only premortem Claude Opus 5.
- [x] Выводы сверены с источниками в `docs/PREMORTEM_RU.md`.
- [x] **Андрей принял направление v1.1 rescope:** один основной mode
  `verify-existing`, 10 fixtures, два scored arms, decision accuracy primary.
- [x] **Обязательный интерфейс v1.1:** воспроизводимый CLI + evidence report; GUI
  только после прохождения обязательных gates.
- [x] **Repair policy:** scored verification завершается до изменения candidate;
  targeted repair запускается только после human approval и остаётся demo follow-up.
- [ ] **Андрей читает русский спек:** `docs/PROJECT_SPEC_RU.md`.
- [x] **В новой нейтральной задаче подготовить нормативную v1.1-поправку и провести
  первый bounded Claude review.**
- [x] **Андрей явно одобрил `docs/PROJECT_SPEC.md@1.1.0` в spec-review задаче.**
- [x] **Андрей одобрил product clean-room boundary:** код, данные, tests, fixtures и
  reproducible demo создаются независимо из публичных источников; приватный legacy
  video может рассматриваться для публичного показа только после отдельного
  NDA/privacy/rights review и не является источником product implementation.
- [ ] **Закрыть только те архитектурные решения, которые остались необходимы для
  сокращённого verify-existing workflow.**

Открыты два технических решения: публичное имя signals-пакета через безопасный
lookup и live reasoning engine после spike.

До выполнения этих пунктов нельзя создавать product fixtures или оптимизировать
Guardian. Legacy-видео в отдельной приватной задаче может готовиться параллельно.

## 3. Принятый v1.1 rescope и оставшиеся решения

Принято как направление плана; станет нормативным только после независимого
воссоздания и human approval в новой submission-eligible задаче:

- [x] Главный scored workflow — проверка уже существующего React → signals
  candidate (`verify-existing`), а не генерация новой миграции.
- [x] Набор — 10 синтетических fixtures: 4 development и 6 held-out.
- [x] На каждой fixture заранее создаются два кандидата: behavior-preserving и
  seeded false-green; всего 20 решений accept/reject.
- [x] Оба scored arms получают одни и те же кандидаты.
- [x] Baseline принимает candidate, когда компиляция и видимые legacy-тесты зелёные.
- [x] Guardian строит risk inventory и дополнительные probes/contracts, после чего
  выдаёт независимый verdict и evidence bundle.
- [x] Primary metric — decision accuracy из 20; supporting metrics — defect recall,
  false-alarm rate, completion, runtime, human time и cost.
- [x] Targeted repair остаётся human-approved, unscored follow-up после verdict.
- [x] Performance — вторичное доказательство, а не центральная scored claim.
- [x] Generation-first migration mode, третий scored arm и GUI отложены до
  прохождения CLI/evidence/package gates.
- [x] Product name для judge-facing v1 — **BeyondGreen**; это marketing rename, а не
  расширение scope за пределы React→signals.
- [x] Primary user — frontend-инженер, который мигрирует зрелый React-код и не
  доверяет полноте зелёных legacy-тестов.
- [x] Usable output — `accept/reject/abstain`, risk map, выполненные probes, evidence
  links и repair plan без самовольного изменения candidate.
- [x] Report formats — schema-validated JSON для automation/evaluator и статический
  HTML для человека и demo; обязательный entry point остаётся CLI.
- [x] Fail-closed policy — при timeout, failed probe или недостатке evidence вернуть
  `abstain` и блокировать merge, а не создавать ложную уверенность.
- [x] Repair demo — один полный D01 false-green example после human approval с
  повторной независимой верификацией исправленного candidate.
- [x] Agent roles — Codex ведёт implementation и eligible traces; Claude вызывается
  read-only только в ключевых checkpoints, а не после каждого шага.
- [x] Submission video — English voice-over + embedded English captions.
- [x] Performance evidence — один воспроизводимый синтетический Chromium-сценарий
  legacy state vs behavior-preserving signals candidate; сначала одинаковые actions
  и behavioral invariants подтверждают отсутствие регрессии, затем сравниваются
  React renders и CPU. При behavioral failure performance-win не заявляется.
- [x] Claude review policy — ровно три плановых read-only checkpoint: normative v1.1
  до product code, полный D01 vertical slice до масштабирования и финальный ZIP после
  clean-extraction rehearsal. Codex проверяет каждое замечание; Claude не редактирует
  файлы и не вызывается после каждого шага.

Оставшийся стартовый пакет решений:

- [x] React execution surface: React DOM + изолированный jsdom behavioral harness;
  реальный Chromium используется отдельно для demo/performance, а не как скрытый
  judge-critical dependency.
- [ ] Signals: использовать тот же публичный npm-пакет, что и в приватном reference
  editor, но получить его имя через отдельный приватный lookup и перенести в clean
  task только публичное имя; точную version/license независимо проверить и
  зафиксировать.
- [x] AST: TypeScript Compiler API.
- [x] Runtime validation: Zod; тесты — `node:test` плюс минимально необходимый
  React-compatible test stack.
- [x] Model path: provider-neutral adapter с проверенным offline replay для судей;
  если Guardian использует live-модель, version, prompt, seed/attempt и inference cap
  замораживаются до evaluated runs.
- [ ] Live reasoning engine официальных Guardian runs: выбрать Claude Opus 5, Codex
  либо другое проверенное adapter target на Phase 0.5 и заморозить до fixtures.
- [x] Human checkpoint: scored verification работает воспроизводимо без
  вмешательства; перед любым targeted repair обязательны human approval и YAML
  evidence с ролью, timestamp, policy digest и ссылкой на решение.
- [x] Mutation testing: один фиксированный smoke control для проверки evaluator,
  без полного mutation catalog в v1.1.
- [x] Предварительные success targets: Guardian accuracy `>=16/20`, преимущество над
  baseline `>=6/20`, defect recall `>=8/10`, false alarms `<=2/10`, completion
  `>=18/20`; actual results публикуются честно даже при недостижении цели.
- [x] Один официальный candidate run: максимум 3 минуты, ровно одна попытка;
  token/cost cap уточняется на Phase 0.5 и замораживается до fixtures.
- [x] 10 behavior classes: stale snapshots, queued/batched updates, derived state,
  subscription cleanup, prop reset, async ordering, identity stability, conditional
  lifecycle, external store и rollback; окончательный 4/6 split замораживается до
  реализации fixtures.

### Scope guard v1.1

Нельзя сокращать даже при нехватке времени:

- [ ] 10 cases, включая challenging lifecycle/async cases, и 20 заранее
  зафиксированных candidate decisions.
- [ ] Одинаковый candidate set и scoring для baseline и Guardian.
- [ ] Физическую oracle isolation и denied-access test.
- [ ] Eligible coding-agent traces, clean-room и provenance evidence.
- [ ] Один полный E2E demo, Improvement Changelog и точные reproduction commands.
- [ ] Публичное видео до пяти минут и ZIP dry-run после clean extraction.
- [ ] Negative/removed experiment и честное описание ограничений.

До прохождения обязательных gates прекращаем тратить время на:

- generation-migration как scored mode;
- третий scored coding-agent arm;
- полноценный GUI;
- широкий mutation catalog;
- performance как главный результат;
- дополнительные control-документы без прямой связи с qualification/rubric.

## 4. Критический путь продукта

### Phase 0 — заморозка спецификации

- [x] Официальные условия, qualification gate и rubric сохранены.
- [x] Clean-room, trace, provenance и artifact contracts подготовлены.
- [x] Global product spec создана.
- [x] Независимые review Codex и Claude Opus 5 выполнены.
- [x] Подтверждённые замечания review исправлены.
- [x] Полный русский перевод создан и структурно проверен.
- [x] Premortem выполнен, риск-взаимодействия и minimum rescope зафиксированы.
- [x] Андрей одобрил v1.1 как направление планирования.
- [x] Независимо подготовить v1.1 normative amendment в новой нейтральной задаче.
- [x] Перед product code передать минимальный v1.1 packet Claude на read-only
  diagnosis/change review; Codex проверяет findings, после чего Андрей принимает
  нормативную версию.
- [x] Исправить подтверждённые Claude findings по K=0/oracle separation, green gate,
  challenging case, trace-first cycle и projection drift; повторные проверки прошли.
- [x] Human approval глобальной спеки зафиксирован в spec-review session record.
- [ ] После approval применить worktree changes к основной ветке и повторить проверки
  в основном каталоге.
- [ ] Human approval архитектурных решений.
- [ ] Human approval session boundary.
- [ ] Новый нейтральный submission-eligible implementation-чат.
- [ ] Eligible raw trace capture включён до первого product-изменения.

**Gate Phase 0:** спецификация и стек одобрены; новый чат имеет правдивый approved
`SESSION_BOUNDARY`; ни одного приватного источника в контексте нет.

### Phase 0.5 — runtime feasibility spike

- [ ] Зафиксировать точные package versions и licenses.
- [ ] Создать throwaway synthetic component, не являющийся benchmark fixture.
- [ ] Проверить детерминированную наблюдаемость snapshot/closure timing.
- [ ] Проверить queued updates и batching.
- [ ] Проверить derived dependencies и identity preservation.
- [ ] Проверить external-store subscription и effect cleanup.
- [ ] Проверить prop/state reset, async ordering и rollback.
- [ ] Проверить, что baseline и Guardian физически не видят verifier-only paths.
- [ ] Измерить приблизительные runtime, token и cost budgets.
- [ ] Выбрать live reasoning engine и зафиксировать model/provider/version.
- [ ] Записать spike evidence и решение go/no-go.

**Gate Phase 0.5:** выбранный стек показывает все классы поведения и позволяет
физически изолировать оракул. Если нет — стек меняется до создания фикстур.

### Phase 1 — trace-first gate, фикстуры и provenance freeze

- [ ] До первого product-файла получить и проверить одну submission-eligible raw
  coding-agent trajectory с tool responses, retry и human checkpoint.
- [ ] Выбрать нейтральный синтетический домен редактора.
- [ ] Зафиксировать публичные React/signals anchors и условия лицензий.
- [ ] Написать 10 behavior-first prose specs до кода.
- [ ] Назначить `SSG-D01`–`SSG-D04` и `SSG-H01`–`SSG-H06`.
- [ ] Для каждой фикстуры описать actions, observables, invariants, visible scope и
  hidden-oracle scope.
- [ ] Для каждой fixture независимо создать behavior-preserving и seeded
  false-green candidate; до evaluated runs не раскрывать labels arms.
- [ ] Создать отдельные `ArmVisibleTaskContractManifest` и
  `VerifierOracleManifest`.
- [ ] Создать один отдельный mutation smoke control для проверки evaluator.
- [ ] Рассчитать SHA-256, заполнить provenance и выполнить contamination scan.
- [ ] Human review и одобрение freeze.

**Gate Phase 1:** eligible trace проверен; 10 текстов, 4/6 split, 20 candidates,
manifests, smoke control, hashes и provenance заморожены до реализации и
оптимизации.

### Phase 2 — первый вертикальный срез и честный baseline

- [ ] Сначала полностью реализовать `SSG-D01`: fixture, preserving candidate,
  false-green candidate, минимальный baseline, минимальный Guardian, независимый
  evaluator, verdicts и evidence bundle; это тонкий E2E skeleton, который позже
  расширяется, а не финальная архитектура.
- [ ] Реализовать status-quo baseline: если candidate компилируется и видимые
  legacy-тесты зелёные, вернуть `accept`.
- [ ] Реализовать общий sandbox и recorder ресурсов.
- [ ] Запустить evaluator self-tests на D01 preserving/false-green pair и smoke
  control.
- [ ] Выполнить baseline на D01 и сохранить полный run.
- [ ] Выполнить ранний package dry-run с placeholder-видео: ZIP → clean extraction →
  setup/test/baseline/Guardian/eval.
- [ ] Перед масштабированием передать ограниченный D01 packet Claude на read-only
  change-review и независимо проверить каждое actionable finding.
- [ ] Зафиксировать baseline results в Improvement Changelog.
- [ ] Проверить, что failures, timeouts и no-patch не потеряны.

**Gate Phase 2:** один полный вертикальный срез и ранняя упаковка воспроизводимы;
baseline и Guardian используют один D01 candidate set, а oracle физически недоступен.

### Phase 3 — независимый evaluator и скрытые оракулы

- [ ] Реализовать process/filesystem verifier boundary.
- [ ] Реализовать immutable final-candidate handoff.
- [ ] Реализовать behavior/differential checks.
- [ ] Реализовать adversarial checks и один mutation smoke control внутри verifier
  boundary.
- [ ] Реализовать K=0 feedback rule.
- [ ] Добавить denied-access tests отдельно для baseline и Guardian.
- [ ] Добавить cardinality/seed и evaluator-version audits.
- [ ] После D01 масштабировать ту же схему на D02–D10 без изменения scoring.

**Gate Phase 3:** evaluator принимает все known-good, отклоняет все known-bad,
скрытые данные недоступны evaluated arms.

### Phase 4 — StateShift Guardian: verify-existing

- [ ] Принять уже подготовленный синтетический migration candidate как immutable
  input; не писать новую signals-реализацию внутри scored run.
- [ ] Реализовать `inventoryStateRisk` по diff, lifecycle, subscriptions, derived
  state, batching, identity и async ordering.
- [ ] Реализовать `deriveVerificationContracts` и дополнительные probes из
  доступного task context без чтения verifier oracle.
- [ ] Реализовать human checkpoint для подтверждения verification plan там, где он
  предусмотрен workflow.
- [ ] Выполнить visible checks + generated probes, не изменяя candidate.
- [ ] Подключить независимый verifier без обратной связи до scoring.
- [ ] Реализовать `assessRisk` fail-closed.
- [ ] Реализовать `MigrationEvidenceBundle`.
- [ ] Реализовать финальный verdict `accept/reject/abstain` с объяснением и ссылками
  на evidence IDs.
- [ ] Реализовать отдельный human-approved targeted-repair demo после scored verdict;
  его результат не входит в primary metrics.
- [ ] Выполнить полный demo workflow на development fixture.

**Gate Phase 4:** один реалистичный workflow завершается полным usable evidence
bundle и честным accept/reject verdict.

### Phase 5 — измеряемые итерации на development fixtures

- [ ] Заморозить `eval-v1.1.0`, один scored seed/attempt и budgets.
- [ ] Для каждого изменения записывать failure, hypothesis, change, command,
  evidence, decision и next action.
- [ ] Сохранять retained, revised, removed, neutral и negative experiments.
- [ ] Найти strongest measured change.
- [ ] Сохранить минимум один removed experiment.
- [ ] Не использовать held-out results для development tuning.

**Gate Phase 5:** Improvement Changelog, trajectories и run records полностью
согласованы.

### Phase 6 — однократная held-out evaluation

- [ ] Объявить unblinding checkpoint до запуска.
- [ ] Запустить baseline и Guardian ровно один раз на каждом из 20 candidates с
  одним frozen seed/attempt.
- [ ] Не объединять diagnostic repeats с primary scored results.
- [ ] Рассчитать decision accuracy `/20`, defect recall `/10`, false-alarm rate
  `/10`, completion, runtime, human time и cost.
- [ ] Проверить заранее объявленные цели Guardian: accuracy `>=16/20`, преимущество
  над baseline `>=6/20`, defect recall `>=8/10`, false alarms `<=2/10`, completion
  `>=18/20`.
- [ ] Зафиксировать все failures и ограничения без скрытия.
- [ ] После unblinding не менять v1 под held-out results.

**Gate Phase 6:** финальное сравнение воспроизводимо, утверждения соответствуют
фактическим данным.

### Phase 7 — submission и публичное demo-видео

- [x] Подготовлен локальный supervisor draft из четырёх Mermaid-диаграмм процесса,
  верификации, oracle isolation и benchmark comparison.
- [ ] Независимо пересоздать и render-check диаграммы в submission-eligible задаче
  после одобрения спеки и реализации фактической архитектуры.
- [ ] Подготовить README, architecture, reproduction, disclosures и report.
- [ ] Связать каждое judge-facing claim с run/evidence IDs.
- [ ] Проверить и включить eligible trajectories каждого coding/solution agent.
- [ ] Написать сценарий публичного синтетического видео до пяти минут.
- [ ] Записать: реальная проблема → синтетический false-green candidate → baseline
  ошибочно принимает → Guardian отклоняет с evidence → optional repaired candidate →
  сравнение → strongest change → removed experiment → hot take.
- [ ] Для performance-фрагмента сначала показать behavioral equivalence на одном
  synthetic before/after scenario, затем renders/CPU; не делать performance claim,
  если correctness gate не пройден.
- [ ] Проверить видео на secrets, private identifiers и доступ без авторизации.
- [ ] Собрать manifest-backed `dist/submission.zip`.
- [ ] Распаковать ZIP в чистую директорию и выполнить setup/test/baseline/solution/
  eval/demo.
- [ ] После clean-extraction rehearsal выполнить финальный ограниченный Claude
  rubric-audit; Codex проверяет findings и принимает только подтверждённые действия.
- [ ] Проверить SHA-256, completeness, licenses, provenance и trace review.
- [ ] Загрузить финальную заявку до 2026-08-31 20:00 CEST.

## 5. Ближайший checkpoint для новой нейтральной задачи

Следующая задача не пишет product code. Она должна независимо прочитать только
разрешённые public/clean-room contracts и:

1. создать новый правдивый `SESSION_BOUNDARY` и остановиться для human approval;
2. после approval внести v1.1 normative amendment в `docs/PROJECT_SPEC.md`;
3. синхронизировать обязательные English submission contracts, не копируя этот
   локальный русский dashboard;
4. доказать отсутствие противоречий: 10 fixtures, 20 candidates, два scored arms,
   `verify-existing`, K=0, oracle isolation и предложенные thresholds;
5. вернуть diff, список закрытых/открытых решений и запросить финальное human
   approval спеки;
6. не создавать fixtures и implementation до этого approval.

После одобрения поправки следующая implementation-задача начинает не с кода, а с
проверки trace capture. Первый product milestone — только `SSG-D01` vertical slice.

## 6. Параллельный путь legacy-видео — PARALLEL

Эта запись подтверждает реальность исходной боли, но не является источником
submission fixtures или кода.

- [x] Отдельная приватная задача запущена.
- [x] Найден подтверждённый исторический commit до signals-инфраструктуры.
- [x] Создан изолированный worktree без изменения рабочей ветки.
- [x] Определены исторические Node/package-manager/build requirements.
- [x] Сборка выполнена, исторические ограничения классифицированы.
- [x] Приложение запущено локально только на безопасных синтетических данных.
- [x] Зафиксирован повторяемый сценарий действий в редакторе.
- [x] Определён layout записи: editor сверху, Performance Monitor снизу; React
  Profiler записывается отдельно.
- [x] Снята первая приватная baseline-запись до миграции: проблематизация и
  определение пользователя.
- [x] Сохранены commit ID, environment и точные commands во
  внешнем приватном хранилище.
- [x] Получен timestamped NDA/privacy review; подготовлена отдельная public-safe
  копия с сохранением исходника и корректными browser-only claims.
- [x] Выполнено NDA/privacy review записи и проверено полное декодирование/ключевые
  кадры public-safe копии.
- [x] Андрей подтвердил право публично показывать записанный приватный reference
  editor в заявке; окончательное включение фрагмента зависит только от технического
  NDA/privacy review и монтажа нежелательных кадров.

Никакой приватный код, screenshot, trace, path, identifier или build output не
переносится в hackathon repository. Публичное видео для жюри в любом случае должно
демонстрировать независимо созданный синтетический редактор.

## 7. Qualification gate — текущая готовность

| Проверка | Статус | Что отсутствует |
| --- | --- | --- |
| Eligibility | Требует финальной человеческой проверки | Данные участника и соответствие правилам проверяются перед submission |
| Completeness | Не готово | Нет product code, README, runs, ZIP и video link |
| Integrity/originality | Control готов, product pending | Нет frozen fixture provenance и финального human review |
| Coding-agent traces | Схема готова, eligible traces отсутствуют | Нужна новая нейтральная implementation-задача и representative traces |
| Reproducibility | Частично готово | Нет pinned product dependencies и clean extracted end-to-end run |

До rubric scoring проект пока не допускается — это ожидаемо на текущей фазе.

## 8. Rubric — текущая доказательная готовность

| Критерий | Вес | Текущий статус |
| --- | ---: | --- |
| Problem & User Value | 15 | Первая приватная problem/user запись готова; публичная пригодность ожидает NDA/privacy review, synthetic product demo ещё отсутствует |
| Agent Solution & Engineering | 30 | Архитектура спроектирована, реализация и trajectories отсутствуют |
| End-to-End Quality | 20 | Не начато |
| Measured Improvement | 15 | Метрики и baselines определены, runs отсутствуют |
| Reproducibility | 15 | Control plane проверен, product reproduction отсутствует |
| Hot Take / Insights | 5 | Нельзя формулировать до измеренных failures/iterations |

## 9. Правило обновления этого чек-листа

После каждого checkpoint:

1. отмечаем завершённые пункты только при наличии доказательства;
2. добавляем ссылку на run, trace, hash или human decision;
3. записываем новый **NOW**;
4. не отмечаем scanner readiness как human approval;
5. не переносим в файл детали приватной legacy-задачи;
6. перед commit/push отдельно запрашиваем разрешение Андрея.
