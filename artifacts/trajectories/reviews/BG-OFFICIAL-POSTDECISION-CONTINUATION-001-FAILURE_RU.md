# BeyondGreen — отказ первой post-decision continuation

Статус: **PRE_WRITE_PLAN_VALIDATION_FAILURE**<br>
Время проверки: `2026-08-31T10:02:40Z`

## Выполненная команда

Владелец один раз запустил утверждённую задачу `evaluation:recover-post-decision`
для границы `SES-20260831-034` и версии оценки `eval-v1.1.0`.

Результат:

```text
POST_DECISION_RECOVERY_FAILED Current frozen execution plan differs from the RUN-002 source plan.
```

Команда не повторялась.

## Где произошла остановка

Отказ произошёл при первой проверке плана, до создания writer и до любой записи
результатов continuation. Каталог
`RUN-BG-OFFICIAL-EVAL-V1.1.0-002-POSTDECISION-001` отсутствует.

Не выполнялись:

- выдача нейтральных сценариев;
- наблюдения;
- оценивание;
- агрегация и replay;
- arm-исполнение;
- вызовы модели.

RUN-002 повторно проверен существующим source manifest: 44 файла, сводный SHA-256
`5df68dc714d66ca44852d2487213ae5bb222f8444cedc734ccaabdf2abbe6d95`.
Рабочее дерево до создания этого отчёта было чистым.

## Точная причина

Read-only сравнение исходного execution plan RUN-002 и текущего результата static
preflight обнаружило ровно одно различие:

- исходный `inventorySha256`:
  `4b9d4100667af58f7b995ff00d4c39b81922a8cf4656c0a93fa59c7ecc0a345c`;
- текущий `inventorySha256`:
  `9bffe4f104f09ff576fcb12e7a79d66b45a54a7306efbef332b4446dae849db2`.

Все остальные поля совпали, включая 20 слотов, порядок, identifiers, candidate
paths, export names, candidate SHA-256, descriptors, membership, behavior classes,
версию оценки и ограничения arm-планов.

`inventorySha256` охватывает не только decision-critical candidate surface, но и
манифесты и verifier-only файлы. В SES-034 по отдельному разрешению были исправлены
verifier runtime imports и согласованы производные verifier manifests. Поэтому
инвентарный хеш закономерно изменился, хотя frozen candidate plan и 40 решений
RUN-002 не изменились.

## Вывод

Это детерминированный дефект слишком широкой проверки совместимости continuation,
а не изменение кандидатов, решений или методики оценки. Простое удаление проверки
небезопасно: она должна продолжать блокировать любое изменение слотов, кандидатов,
их хешей, descriptor bindings и evaluation version.

## Рекомендованное снятие блокера

Нужна отдельная граница и ограниченное исправление:

1. Сравнивать полностью decision-critical execution plan, исключая только
   `inventorySha256` из equality-проверки.
2. Отдельно валидировать текущий inventory и фиксировать оба inventory SHA-256 в
   provenance continuation.
3. Добавить regression tests: verifier-only drift при неизменном candidate plan
   разрешён; любое изменение candidate hash, slot binding, descriptor, class,
   membership, ordering или evaluation version блокируется.
4. Сохранить этот отказ как первую израсходованную continuation-попытку и не
   использовать идентификатор результата `...POSTDECISION-001` повторно.
5. После checkpoint commit разрешить один новый owner-controlled запуск с новым
   create-once output root `...POSTDECISION-002`, без arm/model calls.

До отдельного разрешения код не исправляется, новая continuation не запускается,
commit и push не выполняются.
