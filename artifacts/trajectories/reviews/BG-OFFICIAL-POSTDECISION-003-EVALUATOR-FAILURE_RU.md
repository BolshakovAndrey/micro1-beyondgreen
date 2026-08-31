# BeyondGreen — отказ POSTDECISION-003 на evaluator

Статус: **PARTIAL_CREATE_ONCE_EVALUATOR_FAILURE**<br>
Время read-only проверки: `2026-08-31T10:57:31Z`

## Выполненная команда

Владелец ровно один раз запустил разрешённый post-decision continuation под
`SES-20260831-036` после checkpoint commit
`9292acc16a0fc30622eb1b6d7a587eb03a82ac91`.

Результат:

```text
POST_DECISION_RECOVERY_FAILED EVALUATOR_PROCESS_FAILURE:HANDLER_FAILURE
```

Команда не повторялась. `POSTDECISION-003` не удалялся, не перезаписывался и не
регенерировался.

## Сохранённый прогресс

- source/control files: `4`;
- observer records: `80/80`;
- evaluator records: `8/40`;
- failure records: `0`;
- aggregate, report и replay: отсутствуют;
- arm executions: `0`;
- model invocations: `0`;
- retries: `0`.

Все 80 observer records прошли строгую schema-проверку. Сорок пар повторных captures
совпадают по SHA-256; расхождений между capture 1 и capture 2 нет. Все восемь
evaluator records также валидны по схеме.

Частичный create-once пакет содержит 92 файла и 592 772 байта. Его read-only bundle
SHA-256 по отсортированной таблице `path/bytes/sha256`:

`62e4012eb840f95b81c3b3cab393a865ed3292b5228abea4b0b90c10dd6bbe79`.

RUN-001, RUN-002 и POSTDECISION-002 остались неизменными.

## Точная позиция отказа

Успешно записаны оба arm evaluator records для ordinals 1–4: BG-D01 candidate-a,
BG-D01 candidate-b, BG-D02 candidate-a и BG-D02 candidate-b.

Следующий детерминированный вызов — ordinal 5, `BG-D03:candidate-a`, arm
`status-quo`. Поэтому общий `HANDLER_FAILURE` относится к первому evaluator BG-D03.
Безопасная stage-категория не записалась: SES-036 подключила create-once
failure-record только к observer catch, но не к evaluator catch.

## Найденные verifier-runtime расхождения

### 1. BG-D03 падает на несовместимом словаре операций

Observer записывает операции:

```text
construct, add, setPacketCount, snapshot, snapshot
```

Evaluator replay ожидает `set-packet-count`. Это гарантированно вызывает исключение
на третьей операции. Даже после механической замены имени evaluator оставит второй
snapshot неиспользованным и завершится другим исключением. Следовательно, требуется
единый явный transcript contract, а не одно строковое исправление.

### 2. Уже записанные BG-D01 результаты не совпадают с frozen ground truth

Frozen ground truth определяет:

- candidate-a: `preserving`;
- candidate-b: `false_green`.

Но оба BG-D01 evaluator records записали `false_green` для обоих arms. Причина:
canonical oracle требует девять наблюдений, включая повторный `reset`, тогда как
neutral scenario содержит восемь наблюдаемых операций, один `reset` и терминальный
`dispose`. Evaluator корректно видит недостаточное количество observations, но
производственный provider не воспроизводит замороженную canonical sequence.

Среди восьми уже записанных evaluator records два distinct candidate/ground-truth
результата не совпадают с frozen mapping; это оба arm record candidate-a BG-D01.
Поэтому существующие evaluator records нельзя использовать для финальной агрегации.

## Рекомендованный следующий этап

Нужна отдельная ограниченная SES-037 без запуска continuation:

1. Сохранить POSTDECISION-003 побайтово неизменным как честную неудачную попытку.
2. Согласовать BG-D01 neutral scenario с неизменным canonical oracle: добавить
   обязательный повторный `reset` перед терминальным `dispose` и обновить только
   производные verifier manifests/hashes.
3. Ввести единый BG-D03 transcript contract, который сохраняет различия
   `setPacketCount`, snapshot и rendered-summary observation и воспроизводит
   неизменный derived-state oracle без словарного drift.
4. Расширить безопасную failure-record запись на evaluator catch без raw error,
   stack, stderr, путей и скрытых значений.
5. До нового create-once continuation выполнить production-equivalent evaluator
   rehearsal для всех 20 slots и обоих arms. Он обязан дать 40/40 schema-valid
   records, точное совпадение всех 20 candidate ground-truth mappings и ноль
   arm/model calls.
6. Только после зелёного rehearsal подготовить новый create-once root
   `POSTDECISION-004`; не запускать его до отдельного owner approval.

Третий `evaluation:run`, повтор arm decisions и model calls запрещены. Текущий
`POSTDECISION-003` нельзя повторять, удалять, исправлять на месте или использовать как
финальный scored output.
