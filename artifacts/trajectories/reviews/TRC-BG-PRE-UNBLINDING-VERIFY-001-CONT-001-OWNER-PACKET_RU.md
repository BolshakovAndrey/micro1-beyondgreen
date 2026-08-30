# Пакет владельца: TRC-BG-PRE-UNBLINDING-VERIFY-001-CONT-001

**Решение:** трасса остаётся заблокированной и не может быть продвинута. Перенос, точечное обезличивание и обе preflight-проверки успешны; exact-ID receipt и автоматический privacy scan также успешны. Полный смысловой JSONL/chronology review не выполнен, потому что доступный безопасный интерфейс не предоставляет содержимое событий для проверяемой проекции.

## Перенос и восстановимость

Полный scope задачи `01a05412-6f74-7363-9ee8-ad69df39ad7f` перенесён как ожидаемые `13` файлов `SES-015` плюс `9` разрешённых `SES-016/CONT-001` trace-артефактов. Candidates, oracles, visible assertions, frozen behavior, scoring и methodology не менялись.

Stash `b3187593de04d0474da04cf57e873fe0c4d17d5a` с untracked-файлами сохранён после применения; `pop` и `drop` не выполнялись. Он остаётся восстанавливаемой исходной записью.

## Категориальное обезличивание SES-014

По отдельному точному разрешению владельца в `artifacts/trajectories/session-boundaries/SES-20260830-014.yaml:206` заменён только литерал локального одноразового Git hook token — маркера разрешения Git-хука — на `<one-time-git-hook-token>`.

- исходный SHA-256: `0f29507c0a7c1c52f95d360b883a6a8c38bea3cfbd95bfb7e50bbdc07fbfb69b`;
- новый SHA-256: `f9e8e3897658715d4a5712454035a5b521ebc75b87e71ba1472427f5b82c88ca`;
- diff содержит ровно одну замену;
- остальной смысл и содержимое `SES-014` не менялись;
- действие зафиксировано как `owner-approved categorical redaction` — категориальное обезличивание, одобренное владельцем.

Производный checksum-манифест после этой замены был пересобран и проверен для `523` файлов до повторных preflight.

## Повторные preflight-проверки

Обе owner-controlled safe-проверки прошли:

- `micro1-safe-preflight control` → `READY_FOR_CLEAN_BRANCH`;
- `micro1-safe-preflight implementation` → `READY_FOR_IMPLEMENTATION`.

Новых contamination findings — находок возможного загрязнения — нет. Сохранились четыре ожидаемых предупреждения о необходимости человеческого просмотра официальных бинарных `PNG/PDF`. Implementation-проверка также зафиксировала ожидаемый dirty-worktree warning, потому что разрешённые изменения ещё не закоммичены.

## Receipt и автоматический privacy scan

Безопасный exact-ID wrapper проверил только `TRC-BG-PRE-UNBLINDING-VERIFY-001-CONT-001`:

- размер: `336275` bytes;
- SHA-256: `d83df910358be79f7b8d44bbb612b60e21a75d36b5b4cab4675a36fe23c9883d`;
- private-term matches: `0` до и после path redaction — обезличивания путей;
- email matches: `0`;
- secret-assignment matches: `0`;
- absolute-user-path matches: `0`;
- внешний путь не раскрыт;
- автоматический статус: `passed_requires_submission_redaction`.

Обычная shell-сессия не получила значения `MICRO1_PRIVATE_TRACE_DIR` и `MICRO1_PRIVATE_DENYLIST`; первая прямая попытка остановилась до raw access. Обход, чтение внешней конфигурации или раскрытие пути не предпринимались.

## Почему полный review заблокирован

Доступный owner-controlled wrapper `micro1-safe-trace-review` рекламирует и предоставляет только `scan-raw TRACE_ID`. Он возвращает квитанцию и агрегированные privacy-счётчики, но не безопасную последовательность JSONL-событий.

Поэтому не подтверждены:

- строгий построчный разбор каждого JSONL-объекта;
- полная хронология prompts, actions, tool responses, errors, retries и human checkpoints;
- точные результаты команд из immutable capture;
- полнота и технический смысл возможных исключений или сокращений.

Репозиторная задача-источник подтверждает capture transport и receipt, но не раскрывает внутренний JSONL вложенного read-only verifier. Она не использовалась как подмена raw semantic review.

Создать EN/RU reviewed projections по памяти, инструкции или итоговым статусным файлам означало бы изготовить hand-authored candidate — написанную вручную реконструкцию — вместо проверенной проекции immutable source. `TRACE_POLICY` этого не разрешает. Поэтому reviewed projections не созданы, а `technical_meaning_preserved=false`.

## Retry и доказательная классификация

Первоначальный `TRC-BG-PRE-UNBLINDING-VERIFY-001` сохраняется без изменения только как честная retry record — запись неудачной попытки. Он не считается evidence реализации или проверки.

`CONT-001` доказал только успешную immutable capture identity и чистый автоматический privacy scan. До полного chronology review он также не является eligible representative evidence.

## Что не выполнялось

- trace promotion в `actual_traces`;
- изменение trajectory/provenance indexes;
- official/scored run и unblinding;
- live product model, Chromium, browser/MCP, connected apps, Claude или nested reviewer;
- commit и push.

## Следующий обязательный gate

Нужен owner-controlled exact-ID интерфейс безопасного смыслового извлечения, который передаст все JSONL-события в исходном порядке без раскрытия внешнего пути и без копирования raw source в репозиторий. Только после полного EN/RU chronology review, privacy проверки и отдельного owner approval можно обсуждать trace promotion.

До этого `TRC-BG-PRE-UNBLINDING-VERIFY-001-CONT-001` имеет статус `blocked_incomplete_not_promotable`.

## Попытка добавить безопасную структурную проекцию

Владелец отдельно разрешил создать bounded repo-local mode — ограниченный репозиторный режим — `micro1-safe-trace review-projection TRACE_ID`. Его назначение: получить raw только через существующий защищённый wrapper и вернуть исключительно структуру событий без содержания.

Созданы два файла:

- `scripts/trace-review-projection.ts` — строгий UTF-8/JSONL parser и Zod-схема `micro1-safe-trace-review-projection@1.0.0`;
- `tests/trace-review-projection.test.ts` — детерминированные privacy/schema/chronology tests.

Проекция допускает только:

- последовательный номер и временной порядок по позиции в immutable JSONL;
- allowlisted event/item type — тип события/элемента из закрытого списка;
- структурную роль `system`, `assistant`, `tool` или `unknown`;
- признаки наличия tool-call/tool-result;
- безопасные статусы завершения и целочисленный exit code.

Любой raw content, аргументы инструментов, внешние пути, значения environment, runtime IDs и token/usage metadata конструктивно отсутствуют. Неизвестные типы превращаются в фиксированное `unknown`, их исходное значение не выводится.

Первый targeted test run прошёл `3/4`. Единственный сбой был в самом тесте: после Zod-разбора использовалось сравнение ссылок вместо структурного сравнения. Это не установило дефект projector. После замены только assertion на `deepEqual` повтор прошёл `4/4`; privacy, schema, chronology, malformed-input и unsafe-ID проверки зелёные. `npm run compile` прошёл.

## Новый блокер защищённого интерфейса

Команда в точной разрешённой форме:

```text
micro1-safe-trace review-projection TRC-BG-PRE-UNBLINDING-VERIFY-001-CONT-001
```

вернула прежний usage:

```text
Usage: micro1-safe-trace probe|capture TRACE_ID
```

Сбой произошёл до raw access. Существующий owner-controlled executable не dispatch — не перенаправляет — режим `review-projection` в repo-local projector и по-прежнему поддерживает только `probe` и `capture`.

Repo-local код сам не получает `MICRO1_PRIVATE_TRACE_DIR`, что является правильной границей. Без dispatch защищённого wrapper он не может прочитать immutable capture. Подмена через прямой доступ к external path, инспекция или модификация внешнего wrapper и раскрытие environment запрещены и не предпринимались.

По стоп-условию после этого:

- raw trace не читался;
- структурная проекция целевого trace не создана;
- EN/RU reviewed projections не созданы;
- производные checksums после добавления режима не согласовывались;
- обе preflight-проверки после добавления режима не повторялись;
- trace promotion, commit и push не выполнялись.

Следующий gate должен быть выполнен владельцем защищённого интерфейса: добавить в owner-controlled `micro1-safe-trace` безопасный dispatch, который по exact ID читает raw и передаёт его только на stdin `scripts/trace-review-projection.ts review-projection TRACE_ID`. Внешний путь и environment values не должны становиться доступны repo-local процессу. После этого потребуются повтор exact-ID projection, checksums, обе preflight-проверки и полный owner review до promotion.

Текущий пакет не просит и не допускает approval на trace promotion: безопасная структурная проекция отсутствует.

## Попытка точечно расширить защищённый wrapper

Владелец разрешил определить установленный `micro1-safe-trace` без вывода пути и изменить только command dispatch — разбор команды — добавив `review-projection TRACE_ID`. Любые другие изменения wrapper были запрещены.

До изменения зафиксирована идентичность wrapper:

- SHA-256: `0abf0e3aca018b2deea1f0877440bb8d0ae32eab2414cc385a1b7cd69b21c1bc`;
- размер: `3019` bytes.

Структура dispatch была выведена только после обезличивания одного абсолютного path span — фрагмента пути. Был подготовлен динамический patch, который должен был добавить отдельную ветку: проверить exact trace ID, найти raw только внутри защищённого каталога, передать bytes через stdin в repo-local projector и вывести лишь проверенную JSON-проекцию.

Patch не применился: сгенерированные строки insertion не имели обязательных `+`-маркеров формата `apply_patch`, поэтому verification остановилась до записи. Внешний wrapper после ошибки повторно проверен и полностью неизменен: тот же SHA-256 `0abf0e3aca018b2deea1f0877440bb8d0ae32eab2414cc385a1b7cd69b21c1bc`, тот же размер `3019` bytes.

При диагностике `apply_patch` включил абсолютный путь executable в tool output. Это нарушило прямое требование владельца «без раскрытия пути». Точный путь не повторяется и не сохраняется в repository artifacts; зафиксирована только категория `external executable absolute path disclosed by apply_patch diagnostic`. Raw trace, private environment values и denylist не раскрывались.

По обязательному стоп-условию:

- повторный dispatch patch не выполнялся;
- wrapper не изменён;
- smoke-test не выполнялся;
- raw trace не читался и projection не создана;
- JSONL/chronology/semantic review не выполнен;
- checksums и preflight после этой попытки не запускались;
- trace promotion, commit и push не выполнялись.

Текущий control-task tool output с раскрытым внешним executable path не может входить в submission trace. Для продолжения нужен новый точный owner gate и механизм patching, который не включает внешний target path в пользовательский diagnostic при ошибке.
