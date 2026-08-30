# Граница deadline-first реализации общего официального слоя

**Сессия:** `SES-20260830-018`
**Статус:** одобрено владельцем; shared interfaces/factories прошли ограниченную проверку, работа остановлена перед fixture-потоками
**Исходный commit:** `fcfa5a88dce7683c629318266835995d0bfa05ee`
**Будущая собственная ветка clean worktree:** `codex/beyondgreen-official-runner`

## Что проверено и что создано

Полностью прочитаны `AGENTS.md`, все обязательные clean-room, trace, challenge, preflight, product и evaluation contracts, `config/topic.yaml` и шаблон `SESSION_BOUNDARY`. Точный `HEAD` совпадает с требуемым commit, а рабочее дерево до этих двух файлов было чистым. Новая ветка `codex/beyondgreen-official-runner` пока не создана.

Созданы только `SES-20260830-018.yaml` и эта русская карточка. Код продукта, тесты, fixtures — синтетические проверочные примеры, candidates — проверяемые варианты, oracles — скрытые эталоны, manifests — списки идентичности, отчёты запуска и индексы трасс не менялись. Компиляция, тесты, кандидаты, preflight, scanner, replay, официальный запуск и раскрытие held-out результатов не выполнялись. Вызовов модели, Claude, Chromium, браузера, MCP, commit и push не было.

Первая попытка проверить структуру этих двух файлов остановилась до разбора YAML: установленная версия Ruby/Psych не поддерживает метод `safe_load_file` и вернула `NoMethodError`. Команда не изменила файлы или внешнее состояние, а последующие проверки в цепочке не запускались. Разрешён один совместимый повтор через `safe_load(File.read(...))`; его итог фиксируется в boundary.

Совместимый повтор прошёл: YAML разобран, обязательные поля и статус `pending` подтверждены, точная фраза одобрения совпадает, `git diff --check` прошёл, а область изменений состоит ровно из этих двух boundary-файлов.

Во время read-only проверки Git команда инвентаризации рабочих копий напечатала машинные пути других worktree. Их содержимое не открывалось и не менялось, пути не перенесены в репозиторий. Поэтому текущая подготовительная контрольная стенограмма исключена из submission; кандидатом на допустимую трассу может стать только новая реализационная последовательность после явного одобрения, сканирования и человеческой проверки.

## Точный разрешаемый объём

После одобрения цель — минимальный общий слой `src/official/`, необходимый до deadline:

- физически разделённые adapters — адаптеры полномочий — для arm (сравниваемой стороны), observer (наблюдателя после решения) и evaluator (независимого оценщика со скрытым эталоном);
- общий runner — исполнитель, aggregation — сведение неизменяемых результатов, JSON/HTML report — отчёт и deterministic offline replay — детерминированное воспроизведение без сети;
- три параллельных непересекающихся потока привязки уже замороженных fixtures: `BG-D02`–`BG-D04`, `BG-H01`–`BG-H03` и `BG-H04`–`BG-H06`;
- общие `src/official` компоненты остаются под одним координатором; потоки могут менять только свои привязки и тесты, чтобы не разойтись в общей семантике;
- разрешены только локальные compile/tests, проверки физической изоляции, fail-closed поведения, агрегации, отчёта и offline replay, а также безопасные preflight-проверки. Они не должны запускать официальный arm или создавать scored run record — запись оцениваемого запуска.

Общий слой нельзя строить копированием D01-специфичных схем наблюдения, поведения музейной доски, путей, идентификаторов, эвристик кандидатов или выводов скрытого эталона. Fixture-специфичная семантика остаётся за внедряемыми описателями и адаптерами.

`src/d01` полностью заморожен: его нельзя менять, обобщать или импортировать в новый общий слой. До запуска любых fixture-потоков координатор обязан создать и стабилизировать независимые interfaces/factories — интерфейсы и фабрики — в `src/official/`, не импортируя D01-specific contracts, harness или visible assertions.

Каждый общий fixture descriptor — явное описание фикстуры — обязан без автоматического вывода имён задавать candidate module/export, способ создания через mount-function или class-constructor, соответствующую binding — привязку вызова, arm-visible contracts/invariants/actions/observations/visible assertions, observer entrypoint и evaluator entrypoint. Нельзя выводить эти значения из fixture ID, имени файла, имени candidate, символов исходного кода или соглашений D01.

После стабилизации общего интерфейса владение разделяется так:

- координатор владеет shared core и специальным adapter для `BG-D03`; он явно учитывает class `TrayPlanner` и отсутствие обычного mount harness, используя class-constructor binding;
- первый fixture-only поток владеет только `BG-D02` и `BG-D04`;
- второй — только `BG-H01`–`BG-H03`;
- третий — только `BG-H04`–`BG-H06`.

Worker-потоки не меняют shared paths и `src/d01`. До стабилизации shared interfaces они не запускаются.

Существующие `tests/development-fixture-isolation.test.ts` и `tests/BG-D04-isolation.test.ts` считаются текущим control evidence — контрольным доказательством — физической границы D03/D04. Новый официальный слой до запуска должен получить собственные синтетические/test-only role/capability boundary tests для arm, observer и evaluator. Реальные candidates при этом не исполняются.

## Что остаётся неизменным

Неизменны все 20 candidates и их manifests, видимые утверждения, замороженное поведение, verifier-only пакеты и oracle semantics, ground truth — эталонные решения, разделение 4/6, `BG-H02` как сложный случай, `K=0`, evaluation v1.1, формулы, знаменатели, targets — заранее заданные цели, one-attempt/180-second policy и сравнение ровно двух arms.

`codex-exec-jsonl-v1` остаётся уже замороженным необязательным live-adapter contract: один вызов, ноль повторов, read-only sandbox и общий лимит 180 секунд; недоступность означает `abstain`. В этой границе его нельзя вызывать или менять.

## Риск ветки и обязательный стоп-гейт

Новая clean worktree сейчас находится в detached HEAD на точном исходном commit. После одобрения и до первой строки product code она должна создать и присоединить собственную новую именованную ветку `codex/beyondgreen-official-runner` строго от `fcfa5a88dce7683c629318266835995d0bfa05ee`. Запрещены `--force`, чтение или изменение другой worktree, а также переключение или перемещение любой существующей ветки. Если ветку нельзя создать именно так внутри разрешённого корня, работа немедленно остановится за решением владельца. До одобрения ветка не создаётся.

После одобрения branch gate прошёл: собственная ветка `codex/beyondgreen-official-runner` создана строго от указанного commit без force, без переключения существующей ветки и без чтения или изменения другой worktree.

Shared interfaces/factories и test-only infrastructure были созданы до fixture-потоков. `npm ci --ignore-scripts` установил 54 замороженных пакета без уязвимостей, `npm run compile` прошёл. Из шести новых synthetic tests прошли четыре, а две проверки физической роли завершились ошибкой: положительное разрешённое чтение не сработало для arm/observer и evaluator. Поэтому role/capability boundary пока не доказана. В соответствии со стоп-условием диагностический повтор не выполнялся, три worker-потока не запускались, D03 adapter не начинался, реальные candidates не импортировались и не исполнялись. Полный результат: `artifacts/trajectories/reviews/BG-OFFICIAL-DEADLINE-FIRST-SHARED-INTERFACES-STOP-OWNER-PACKET_RU.md`.

Владелец затем разрешил ровно один diagnostic/correction cycle только для двух положительных test-only сценариев. Без раскрытия stderr или путей подтверждено: одиночный путь и повторяемые `--allow-fs-read` завершаются кодом 0, а comma-list — кодом 1. Единственное исправление заменило comma-list в test harness на отдельный флаг для каждого явно разрешённого пути. Разрешённый единственный повтор `npm run compile` прошёл; единственный повтор тех же трёх test files прошёл 6/6. Capability contracts и product paths не менялись. Итоговый пакет: `artifacts/trajectories/reviews/BG-OFFICIAL-DEADLINE-FIRST-SHARED-INTERFACES-OWNER-PACKET_RU.md`.

## Что одобрение не разрешает

Одобрение не разрешает исполнять candidates или расходовать официальный attempt любой стороны; выполнять official/scored run; раскрывать `BG-H01`–`BG-H06`; вызывать live model, Claude, Chromium, browser/MCP или connected apps; менять candidates, manifests, assertions, oracles, evaluation, targets, two-arm policy, dependencies или frozen adapter; продвигать trace; собирать финальный архив; делать commit или push.

При contamination finding — признаке возможного загрязнения, утечке oracle, расхождении ветки, неясном происхождении или изменении замороженной поверхности работа останавливается. Даже при зелёных тестах следующий обязательный стоп — полный русский owner packet до candidate execution, trace promotion, commit и push.

## Точная фраза одобрения

`Одобряю SESSION_BOUNDARY SES-20260830-018 и разрешаю после одобрения создать в этой clean worktree собственную именованную ветку codex/beyondgreen-official-runner строго от fcfa5a88dce7683c629318266835995d0bfa05ee без force, без чтения или изменения другой worktree и без переключения существующей ветки, затем выполнить только deadline-first реализацию общего слоя src/official с физически разделёнными arm, observer и evaluator adapters, общими runner, aggregation, JSON/HTML report и offline replay и тремя параллельными fixture-потоками BG-D02–BG-D04, BG-H01–BG-H03 и BG-H04–BG-H06; D01-specific semantics, frozen candidates/manifests, visible assertions, oracle semantics, evaluation v1.1, targets, two-arm policy и codex-exec-jsonl-v1 не менять; candidate execution, official/scored run, unblinding, live model, Claude, Chromium, browser/MCP, trace promotion, commit и push не выполнять; остановиться с полным русским owner packet.`
