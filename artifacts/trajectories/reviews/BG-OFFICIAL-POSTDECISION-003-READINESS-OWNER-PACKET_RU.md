# BeyondGreen — готовность POSTDECISION-003 после SES-036

Статус: **READY_FOR_OWNER_CHECKPOINT_APPROVAL**<br>
Дата проверки: `2026-08-31T10:37:38Z`

## Итог

Блокер первого observer устранён и проверен не только unit-тестами, но и полным
production-equivalent rehearsal: все 20 нейтральных сценариев были выданы, а все 80
observer captures успешно выполнены через реальные process/capability boundaries.

Ни один arm не запускался, модель не вызывалась, evaluator не запускался, официальный
output не создавался. `POSTDECISION-003` подготовлен в коде, но не запускался.

## Что изменено

1. BG-D01 observer bridge теперь принимает ровно один терминальный `dispose`.
   Действия после `dispose` и повторный `dispose` отклоняются до mount. Если сценарий
   не содержит `dispose`, прежний обязательный cleanup сохраняется.
2. Role process возвращает только безопасную категорию стадии отказа: например,
   `LOAD_CANDIDATE`, `NORMALIZE_SCENARIO`, `MOUNT`, `EXECUTE_STEP` или `DISPOSE`.
   Исходное сообщение, stack trace, stderr, пути и скрытые значения не сохраняются.
3. Будущий create-once recovery сохраняет только ограниченную failure-record
   проекцию: ordinal, arm, capture ordinal, role, request ID, disposition,
   retry policy, error code и безопасную stage-категорию.
4. Добавлена отдельная задача `evaluation:observer-rehearsal`. Она использует 40
   замороженных решений RUN-002, но не имеет доступа к arm/model/evaluator execution.
5. Следующий output root изменён только вперёд на
   `RUN-BG-OFFICIAL-EVAL-V1.1.0-002-POSTDECISION-003`. Скрипт требует boundary
   `SES-20260831-036` и раскрывает две предыдущие create-once попытки в provenance.

## Проверки

- `npm run compile`: PASS;
- targeted process, D01 bridge, physical role и recovery tests: `14/14`;
- полный `npm test`: `233/233`;
- frozen self-test: PASS для 10 fixtures и 20 candidates;
- control checksums: `812/812`;
- `git diff --check`: PASS;
- control preflight: `READY_FOR_CLEAN_BRANCH`;
- implementation preflight: `READY_FOR_IMPLEMENTATION` с ожидаемым предупреждением
  о незакоммиченном checkpoint;
- production-equivalent observer rehearsal:
  - slots: `20/20`;
  - scenarios: `20/20`;
  - captures: `80/80`;
  - arm executions: `0`;
  - model invocations: `0`;
  - evaluator invocations: `0`;
  - capture digest:
    `3d8d29d717495afd2bda1325cdf4270b62db53ca826b5dc034e76a427ad2b8ea`.

Один локальный тест сначала ожидал старый раскрывающий текст исключения. После
введения privacy-safe категории ожидание было детерминированно заменено на
`EXECUTE_STEP`; product/runtime дефектом это не являлось. После редакции весь набор
проверок прошёл.

## Неизменность исходных результатов

- RUN-001: не изменён;
- RUN-002: 44 файла, bundle SHA-256
  `5df68dc714d66ca44852d2487213ae5bb222f8444cedc734ccaabdf2abbe6d95`;
- частичный POSTDECISION-002: 4 файла, 18 625 байт, сохранён без изменений;
- observer/evaluator records в POSTDECISION-002: `0/0`;
- 40 immutable arm decisions: не менялись и повторно не исполнялись.

## Что ещё запрещено

- запуск `POSTDECISION-003`;
- любые arm/model calls или `evaluation:run`;
- изменение candidates, decisions, frozen scenarios, oracle или scoring;
- commit, push, ZIP и публикация.

## Следующий отдельный гейт

Сначала требуется checkpoint commit текущего SES-036 scope без push. После него —
отдельное явное разрешение владельца на единственный owner-controlled запуск:

```text
MICRO1_OFFICIAL_SESSION_BOUNDARY=SES-20260831-036 npm run task -- evaluation:recover-post-decision --evaluation-version eval-v1.1.0
```

Команду должен запускать владелец из обычного Terminal. При любом результате
`POSTDECISION-003` нельзя повторять, удалять, перезаписывать или регенерировать.

Обе preflight-проверки повторили четыре штатных binary human-review notices для
публичных материалов организатора. Их человеческий просмотр перед ZIP остаётся
обязательным и не относится к текущему runtime-блокеру.
