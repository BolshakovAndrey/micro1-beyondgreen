# BeyondGreen — готовность recovery RUN-002

## Классификация первой попытки

`RUN-BG-OFFICIAL-EVAL-V1.1.0-001` сохранён как неуспешная инфраструктурная попытка.
Она завершилась до первого arm decision:

- arm decisions: `0/40`;
- candidate executions completed: `0`;
- live-model invocations: `0`;
- captures: `0/80`;
- evaluator records: `0/40`;
- unblinding: не выполнялся.

Все четыре исходных файла RUN-001 повторно сверены по SHA-256 и не изменялись.
RUN-001 не удаляется, не перезаписывается и войдёт в provenance как failed attempt.

## Найденная причина

Production capability разрешала изолированному role process читать только
`src/official/runtime` и `src/official/process`. Однако общий role entrypoint до выбора
роли статически загружал `arm-handler.ts`, а тот импортировал
`src/official/reasoning/**`. Node permission model корректно запрещал этот transitive
read ещё до выполнения `main()`, поэтому status-quo process не успевал записать JSONL.

Прежний integration test не обнаружил ошибку, потому что разрешал чтение всего
`src/official`, то есть проверял более широкую capability, чем production.

## Исправление

- Status-quo policy вынесена в отдельный reasoning-free модуль.
- Изолированный role entrypoint импортирует этот узкий модуль напрямую.
- Существующий публичный API сохранён через re-export.
- Физический integration test теперь использует production-equivalent allowlist:
  только `src/official/runtime`, `src/official/process`, зависимости и конкретную
  публичную либо verifier binding.
- Новый create-once target — `RUN-BG-OFFICIAL-EVAL-V1.1.0-002`; RUN-001 не может быть
  выбран или перезаписан.
- Provenance RUN-002 явно укажет ordinal `2`, ссылку на RUN-001 и классификацию
  pre-arm infrastructure failure.

## Дополнительный найденный drift

Полный D01 package validator выявил, что четыре уже существовавших runtime
export/provider файла не были включены в directory-complete verifier manifest.
Содержимое verifier, hidden oracle, candidates и scoring не менялось. Обновлены только:

- полный code-owned source list;
- package manifest;
- производные manifest/package/vertical digests.

## Проверки

- TypeScript compile: **PASS**.
- Полный ordinary suite: **220/220 PASS**.
- D01 vertical slice: **19/19 PASS**.
- Narrow physical role integration: **PASS** для status-quo, scenario-provider,
  observer и evaluator под реальным macOS sandbox.
- Synthetic execution: **PASS**, `20/40/80/40`.
- Freeze self-test: **PASS**, 10 fixtures, 20 candidates, 10 preserving и 10
  reason-correct defects.
- Development и held-out verification: **PASS**.
- Static official preflight: **PASS**, 10 fixtures, 20 candidates, 40 arm plans.
- RUN-002: отсутствует; official run, live model и unblinding в recovery-сессии не
  выполнялись.

## Следующий гейт

Сначала требуется checkpoint commit recovery scope без push. Затем отдельное явное
разрешение на один owner-controlled запуск RUN-002 из обычного Terminal. RUN-001 должен
остаться в ZIP как прозрачное доказательство инфраструктурной ошибки и исправления.
