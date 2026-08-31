# Карточка ограниченной коррекции перед официальным запуском BeyondGreen

Граница: `SES-20260831-020`<br>
Ветка: `codex/beyondgreen-official-runner`<br>
Исходный HEAD: `3d916e73a13553583660bc88633366f5bc8eede9`

## Решение владельца

Владелец одобрил отдельную correction-сессию — ограниченную сессию исправления — точной фразой:

> Одобряю отдельную bounded pre-official correction session: подключить execution-capable evaluation:run и две независимые post-decision captures на arm с fail-closed проверкой расхождения, используя только synthetic tests. Реальные candidates, live model, official/scored run, unblinding, commit и push запрещены.

Это разрешение позволяет исправлять только заранее найденные инфраструктурные пробелы. Оно не является одобрением SES-019 и не разрешает официальный запуск.

## Найденные пробелы и гипотеза

Команда `evaluation:run` пока выполняет только проверку контракта и не проходит через существующий official runner — официальный исполнитель. Кроме того, официальный путь должен доказуемо выполнять две независимые post-decision captures — фиксации наблюдений после решения — для каждой пары slot+arm и запрещать evaluator при любом расхождении.

Гипотеза: существующие `src/official` interfaces, process boundaries, inventory, execution plan, aggregation, report и replay можно соединить через один внедряемый execution coordinator — координатор исполнения — без изменения замороженной методики или реальных fixtures. Полноту и безопасность можно доказать только синтетическими модулями и транспортами.

## Разрешённое изменение

Команда `npm run task -- evaluation:run --evaluation-version eval-v1.1.0` должна стать execution-capable — способной выполнять полный заранее реализованный путь — при сохранении имени и единственного принятого аргумента. Путь обязан:

- выполнить статическую проверку;
- записать неизменяемый 20-slot план до любого candidate execution;
- исполнить 40 arm plans;
- не вызывать reasoning model для `status-quo`;
- вызывать внедрённый `codex-exec-jsonl-v1` ровно один раз на BeyondGreen candidate и никогда не повторять вызов;
- сделать решения обеих arms конкретного slot неизменяемыми до observer;
- выполнить две независимые observer captures для каждой slot+arm;
- собрать 80 capture records и 40 неизменяемых совпадающих пар;
- не запускать evaluator при missing, malformed или divergent captures;
- отложить held-out evaluator и unblinding до неизменяемости всех 40 решений;
- проверять candidate hash до и после каждой arm;
- создать aggregate, JSON/HTML report, replay и provenance только через атомарный create-once writer, который отказывается перезаписывать существующий путь.

## Синтетические доказательства

Тесты используют только test-only inventory, modules, transports, captures и evaluator. Они обязаны покрыть успешный полный проход, расхождение наблюдений, отсутствующую и malformed capture — запись неправильной формы, транспортный `abstain` без повтора, collision — уже существующий output path, неизменяемый порядок, запрет evaluator при ошибке пары, точную численность 20/40/80/40 и совпадение digest после offline replay.

Ни один тест не может импортировать или выполнять реальные D/H candidates, вызывать live Codex, сеть, browser, MCP, Claude, Chromium или раскрывать held-out результаты.

## Неизменяемые границы

Не изменяются `src/d01`, реальные candidates, manifests, visible assertions, verifier/oracle, методика v1.1, цели, reason-correct mapping, зависимости, модель, frozen `codex-exec-jsonl-v1`, предел 180 секунд и политика нулевых повторов.

Arms не читают `evaluation/verifier-only/`; evaluator не читает candidate roots. `K=0` сохраняется: evaluator или oracle не передают arm никакой информации до неизменяемого решения.

## Предсуществующие изменения

На старте были обнаружены две модификации старых файлов `artifacts/evaluation/BG-D01-VERTICAL-SLICE.json` и `.html`. Последующая проверка установила, что это случайная перегенерация существующего незачётного D01 demo во время запрещённого запуска SES-019. Владелец отдельно разрешил восстановить ровно эти два файла из checkpoint `3d916e7`. Восстановление завершено; другие файлы не откатывались. Инцидент записан в SES-019 и не считается official evidence — официальным доказательством.

## Фактически выполненная коррекция

Создан общий coordinator — координатор исполнения — с неизменяемым планом, проверкой candidate hash до и после каждого arm, нулём повторов, двумя независимыми captures для каждой пары slot+arm, fail-closed остановкой до evaluator при missing, malformed или divergent capture и create-once writer — писателем, который не перезаписывает существующие результаты.

Синтетический полный прогон прошёл со следующей точной численностью:

- 20 slots;
- 40 arm plans;
- 80 capture records;
- 40 observation pairs;
- 40 evaluator records;
- 0 reasoning-вызовов у `status-quo`;
- 20 внедрённых synthetic reasoning-вызовов у `BeyondGreen`;
- 0 повторов;
- полное совпадение offline replay digest.

Отдельные негативные тесты подтвердили остановку до evaluator при расхождении, отсутствии или неправильной форме capture. Collision test подтвердил отказ до arm execution, если output root уже существует. Observer writer сохраняет ровно 80 файлов и связывает каждые два одним pair digest без дополнительных файлов, меняющих утверждённую численность.

Первый запуск новых тестов остановился до arm execution: test-only helper не рекурсивно заморозил элементы внутри уже замороженного Zod-массива. Исправлена только функция заморозки синтетических тестовых данных; production semantics не менялась. Повтор прошёл 5/5.

## Результаты проверки

- `npm run compile` — успешно;
- все `tests/official/**/*.test.ts` — 40/40 успешно;
- `npm run task -- official:preflight` — успешно: 10 fixtures, 20 candidates, 20 slots и 40 arm plans;
- реальные candidates не импортировались и не выполнялись;
- live model, official/scored run и unblinding не запускались.

## Оставшийся блокер

Коррекция доказала общий execution contract, но не создала production composition root — рабочую сборку role hooks — для D02–D04 и H01–H06. Их текущие adapters являются только статическими capability plans с `candidateExecutionAllowed=false`. В репозитории нет production-пути, который выполняет arm, получает скрытый сценарий только после неизменяемых решений, передаёт его физически изолированному observer и затем передаёт нейтральный transcript evaluator, не позволяя evaluator импортировать candidate root.

Поэтому `evaluation:run` оставлена прежним fail-closed pre-unblinding validator. Подключать к ней `scripts/d00-official-run.ts` сейчас означало бы создать ложное впечатление готовности: CLI неизбежно остановилась бы из-за отсутствующих role hooks. Статус SES-020 — `BLOCKED_BEFORE_PRODUCTION_COMPOSITION_ROOT`, а не `CORRECTION_READY_FOR_CHECKPOINT`.

Для продолжения нужна отдельная ограниченная production-composition session. Она должна явно разрешить реализацию arm/observer/evaluator hooks и post-decision neutral scenario handoff, сохранив `K=0`, запрет evaluator на candidate roots, один model call, ноль повторов и неизменность candidates/oracles.

## Запреты и критерий остановки

Запрещены реальные candidates, live model, official/scored run, unblinding, browser/MCP/Claude/Chromium, сеть, изменение frozen surface, checksums write, trace promotion, commit и push.

При первом содержательном сбое compile, official tests, static preflight или synthetic full-run suite работа останавливается с точной ограниченной причиной и предлагаемым исправлением. Чисто транспортную shell-ошибку без изменения файлов можно повторить детерминированно.

После успешной проверки карточка будет дополнена фактическими командами, результатами, ошибками, рисками и статусом `CORRECTION_READY_FOR_CHECKPOINT`. Это не будет новой фразой одобрения official run.
