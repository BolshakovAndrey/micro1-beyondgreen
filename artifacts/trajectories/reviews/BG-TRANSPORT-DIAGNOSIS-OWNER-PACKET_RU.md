# SES-028 — диагностика transport без вызова модели

Статус: **LOCAL CONTRACT PASS; ROOT CAUSE NOT PROVEN**.

## Подтверждено

- Codex CLI: `0.148.0`.
- Авторизация: активная ChatGPT-сессия.
- CLI поддерживает все frozen production flags: `--ephemeral`, `--ignore-user-config`, `--json`, `--output-schema`, `--sandbox read-only`, `--model` и stdin prompt.
- Production command builder, deadline contract, offline JSONL parser и transport lifecycle: **7/7 PASS**.
- Создаваемый transport-ом ephemeral Git repository распознаётся Git как рабочий репозиторий.
- Output-schema файл существует, является валидным JSON и доступен в ephemeral root.
- Локальный fake-runner поток проходит ту же schema/parser boundary без model invocation.

## Не подтверждено

Однозначной несовместимости CLI аргументов, ephemeral repository или локального schema lifecycle не найдено. Поэтому разрешённое условие для правки production command builder не наступило, и код не менялся.

Canary SES-027 был запущен из вложенного Codex Desktop tool environment. Возможны две оставшиеся категории причины:

1. среда запрещает или нарушает вложенный `codex exec`;
2. provider/model/API отклонил запрос после запуска CLI.

Это пока гипотезы: raw stderr SES-027 намеренно не сохранялся, а второй model call в SES-028 был запрещён.

## Безопасное следующее решение

Не запускать официальный benchmark из текущего nested tool environment. Создать отдельную repo-local canary-команду с безопасной структурной сводкой и один раз выполнить её владельцем из обычного Terminal, где `codex` уже авторизован. Такой canary остаётся non-scored: он не получает candidate, fixture, verifier/oracle данные, не создаёт official output и не выполняет unblinding.

Если owner-terminal canary пройдёт, официальный запуск также следует выполнять из обычного Terminal. Если он повторит `NONZERO_EXIT`, нужен отдельный безопасный захват только категории CLI/API ошибки до решения о модели или adapter policy; менять модель автоматически запрещено.

Model invocations в SES-028: **0**. Candidates, official run, unblinding, commit и push не выполнялись.
