# SES-027 — результат публичного transport canary

Статус: **FAIL — OFFICIAL RUN BLOCKED**.

Выполнен ровно один разрешённый non-scored canary через production adapter `codex-exec-jsonl-v1` и модель `gpt-5.6-sol`. Вход был фиксированным публичным синтетическим текстом без candidate ID, candidate bytes, fixture content, verifier/oracle данных или приватного контекста.

## Безопасная сводка

| Поле | Значение |
| --- | --- |
| Result | `FAIL` |
| Invocation count | `1` |
| Retry count | `0` |
| Duration | `4785 ms` |
| Failure code | `NONZERO_EXIT` |
| Strict output schema received | `false` |
| Raw output published | `false` |
| Official/scored run | `false` |
| Unblinding | `false` |

Повтор и substitute model не использовались. Временный runtime-каталог удалён. Official output root отсутствует, поэтому единственная официальная попытка не начиналась и не была израсходована.

## Решение

Официальный запуск сейчас запрещён: каждый BeyondGreen arm получил бы operational failure и `abstain`, что разрушило бы completion и accuracy.

Следующий безопасный шаг — отдельная диагностика без model invocation: проверить локальную версию Codex CLI, статус авторизации, поддержку каждого frozen аргумента production-команды и совместимость output-schema/ephemeral repository. Raw stderr по уже завершённому canary не сохранялся и восстанавливаться не должен. После конкретного детерминированного исправления потребуется отдельное решение владельца о новом non-scored canary; текущая SES-027 повторов не допускает.
