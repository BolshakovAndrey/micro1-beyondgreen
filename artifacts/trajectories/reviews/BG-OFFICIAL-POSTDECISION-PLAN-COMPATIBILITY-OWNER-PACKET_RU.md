# BeyondGreen — исправление допуска post-decision continuation

Статус: **READY_FOR_OWNER_CHECKPOINT_APPROVAL**. Исправление и разрешённые тесты
завершены. Continuation не запускалась.

## Исходный отказ

Первая команда continuation остановилась до записи с ошибкой несовпадения frozen
execution plan — замороженного плана исполнения. Каталог результата
`RUN-BG-OFFICIAL-EVAL-V1.1.0-002-POSTDECISION-001` не был создан. Отказ сохранён в
отдельном русском failure packet — отчёте о неудачной попытке:
`artifacts/trajectories/reviews/BG-OFFICIAL-POSTDECISION-CONTINUATION-001-FAILURE_RU.md`.

Read-only диагностика доказала, что исходный план RUN-002 и текущий план отличаются
только `inventorySha256` — сводным хешем всего frozen inventory. Все 20 слотов,
candidate hashes, bindings, descriptors, membership, behavior classes, порядок,
лимиты и версия оценки совпали.

## Что исправлено

Полное побайтовое сравнение планов заменено каноническим сравнением всех полей кроме
`inventorySha256`. Исключено ровно одно поле. Любое другое изменение плана, включая
добавленное поле, остаётся блокирующим.

Оба inventory hash закреплены как production-константы:

- RUN-002: `4b9d4100667af58f7b995ff00d4c39b81922a8cf4656c0a93fa59c7ecc0a345c`;
- текущий после verifier repair SES-034:
  `9bffe4f104f09ff576fcb12e7a79d66b45a54a7306efbef332b4446dae849db2`.

Если хотя бы один из них изменится, recovery остановится до создания writer.
Provenance — запись происхождения результата — обязана сохранить оба значения,
признак их несовпадения и причину
`owner-approved verifier repair SES-20260831-034`.

Create-once output, то есть однократно создаваемый каталог результата, переведён на
`RUN-BG-OFFICIAL-EVAL-V1.1.0-002-POSTDECISION-002`. Идентификатор первой попытки
повторно не используется.

## Доказательства

- TypeScript compilation: PASS.
- Полный repository test suite: 230/230 PASS.
- Точечный recovery suite: 6/6 PASS.
- Тест перебрал каждый лист плана кроме `inventorySha256`; каждое изменение было
  заблокировано.
- Изолированный drift только `inventorySha256` разрешён.
- Изменение candidate bytes блокируется до создания output.
- Production disclosure test подтвердил оба точных inventory hash и полный current
  static inventory validation.
- Read-only production-equivalent preflight подтвердил 44 файла RUN-002, 40
  неизменяемых решений, 20 слотов и 20 candidate hashes. Candidate execution,
  official/scored run и новое unblinding не выполнялись.
- Source manifest RUN-002 сохраняет bundle SHA-256
  `5df68dc714d66ca44852d2487213ae5bb222f8444cedc734ccaabdf2abbe6d95`.
- Каталоги `POSTDECISION-001` и `POSTDECISION-002` отсутствуют.
- Производный checksum index проверен для 802 файлов; `git diff --check` прошёл.
- Safe control preflight завершился `READY_FOR_CLEAN_BRANCH`, implementation
  preflight — `READY_FOR_IMPLEMENTATION`. Остались только четыре известные бинарные
  копии материалов организатора для ручной проверки и ожидаемое предупреждение о
  незакоммиченном рабочем дереве.

## Честно зафиксированный технический повтор

Первый механический patch, выносивший production inventory hash в общие экспортируемые
константы, не применился из-за несовпавшего контекста import-блока теста. Он не
изменил ни одного файла. После чтения фактического import-блока применён точечный
patch; compile и тесты после него прошли.

## Границы целостности

RUN-001 и RUN-002 не изменялись. Candidates, decisions, oracle semantics, ground
truth, scoring и evaluation v1.1 не менялись. `evaluation:run`, continuation,
arm/model calls, commit и push не выполнялись.

## Следующий человеческий гейт

Сначала требуется отдельное разрешение на checkpoint commit текущего SES-035 scope.
Только после чистого commit может быть отдельно разрешён один owner-controlled запуск
`POSTDECISION-002`. До такого разрешения команду continuation запускать нельзя.
