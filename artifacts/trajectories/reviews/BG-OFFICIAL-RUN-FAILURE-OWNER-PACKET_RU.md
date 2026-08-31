# BeyondGreen — результат единственной официальной попытки

## Итог

Официальная команда `eval-v1.1.0` была запущена владельцем ровно один раз из обычного
Terminal в рамках `SES-20260831-031` и завершилась с кодом `1`:

```text
OFFICIAL_EVALUATION_FAILED Isolated process must emit exactly one JSONL response.
TASK_FAILED evaluation:run official evaluation execution exit=1
```

Повтор не выполнялся и запрещён. Каталог частичного результата сохранён без удаления,
перезаписи, починки или регенерации.

## На каком этапе произошёл сбой

Координатор успел создать только стартовые create-once файлы:

| Файл | Размер | SHA-256 |
| --- | ---: | --- |
| `execution-plan.json` | 11 484 байта | `1cad365be987b7237f7c01db8e6dd61cfdbf97cc59ef00176dd163f6d5d5a19c` |
| `provenance.json` | 201 байт | `f1ebb91425543943c8f3b64aead291e772c95ada183d9c34fd3a59b682047fde` |
| `run-manifest.json` | 273 байта | `14c42c2a6867fe6c3081b2f012c646e8841d2c6ef8da7377727372da6b330064` |
| `static-preflight.json` | 11 884 байта | `a76e37c53ef229690d4a42f0ae226a5b6beaefb429b3c1b51b80a7b632937488` |

Измеренное состояние:

- arm decisions: **0 из 40**;
- live-model invocations: **0**;
- observer captures: **0 из 80**;
- evaluator records: **0 из 40**;
- aggregate, HTML/JSON report и offline replay: **не созданы**;
- post-decision unblinding: **не выполнялся**.

Первым по зафиксированному порядку запускается `status-quo` arm первого слота. Поэтому
сбой произошёл до BeyondGreen arm и до первого model transport call. Отсутствие файлов
в `arm-records/`, `observer-records/` и `evaluator-records/` подтверждает, что ни одно
решение не было зафиксировано и скрытая стадия не открывалась.

## Что удалось установить о причине

Изолированный процесс не выдал единственную обязательную JSONL-строку. Точная внутренняя
ошибка не сохранилась по двум причинам текущей реализации:

1. macOS backend запускает child process со stderr, направленным в `ignore`;
2. top-level catch role entrypoint подавляет текст исключения и устанавливает только
   exit code `1`.

Поэтому доказан отказ IPC-контракта первого status-quo процесса, но недоказана более
узкая первопричина внутри child process. Дополнительный запуск кандидата или official
command для диагностики не выполнялся.

## Решение

Попытка сохраняется как честный отрицательный результат. Агрегация и replay невозможны,
поскольку scored records отсутствуют. Повтор official run, ручное достраивание результата
и unblinding запрещены утверждённой методикой. Следующее решение должно отдельно определить,
как представить заявку на базе воспроизводимых synthetic/development evidence и этого
зафиксированного failure, не выдавая их за успешный официальный score.
