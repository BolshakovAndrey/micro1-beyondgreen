# Отчёт подагента по BG-D03

Дата: 2026-08-30<br>
Сессия: `SES-20260830-007`<br>
Существующая реализационная траектория: `TRC-BG-D03-001`

## Область и ограничения

Работа выполнена только в isolated worktree — изолированном рабочем дереве — для
`BG-D03`. Вложенный `Codex CLI`, новая raw-трасса, Claude, браузер, MCP, live model,
official/scored run, commit и push не запускались. Внутренние события native
subagent — встроенного подагента Codex — не заявляются как экспортированная трасса.

Shared paths — общие пути проекта, включая `package.json`, `package-lock.json`,
`tsconfig.json`, `src/d01`, общие реестры, конфигурацию и документацию, — не
изменялись. Два уже существовавших служебных файла границы сессии не редактировались.

## Гипотеза

Первичный сбой был вызван несовпадением расширений локальных импортов с принятым в
репозитории режимом NodeNext: BG-D03 ссылался на отсутствующие `.js`-файлы, тогда как
репозиторий запускает исходные TypeScript-модули и разрешает явные `.ts`-импорты.
После этой узкой правки ожидалось, что компилятор и fixture-specific проверки —
проверки только этой фикстуры — выявят оставшиеся внутренние несогласованности без
изменения замороженной семантики derived state — производного состояния.

## Изменения

1. Все локальные BG-D03 импорты переведены с `.js` на `.ts`; shared-конфигурация не
   менялась.
2. Удалена незавершённая дублирующая пара
   `candidates/BG-D03/preserving` / `candidates/BG-D03/false-green`. Единственной
   manifest-backed pair — парой, закреплённой манифестом, — остались
   `candidate-a` и `candidate-b`, как в общей структуре фикстур.
3. `canonical-driver.ts` приведён к одному API: `snapshot` является getter —
   свойством чтения, — а hidden sequence — скрытая проверочная последовательность —
   вынесена в `assertDerivedStateOracle` без дублирования.
4. Исправлено ошибочное использование `assert.doesNotThrow`, которое возвращает
   `void`, а не объект планировщика.
5. TypeScript parameter properties — параметры конструктора, одновременно
   объявляющие поля, — заменены в обеих кандидатах обычными `private readonly`
   полями и явным присваиванием. Это сохраняет поведение и совместимо с Node 22
   strip-only mode — нативным запуском TypeScript без преобразования неподдерживаемого
   синтаксиса.
6. `fixture-freeze.yaml` и `package-manifest.yaml` обновлены на единственную пару
   кандидатов и полный verifier-only пакет. Поведенческая спецификация не менялась;
   её исходный SHA-256 сохранился.
7. Публичные и экспортируемые TypeScript API проверены на содержательный English
   JSDoc; ключевые причины сохранены короткими English why-comments.

## Команды и результаты

### Диагностические и исправленные попытки

- Первичный `node --test tests/BG-D03-derived-state.test.ts` выполнялся Node
  `v18.16.1` из обычного `PATH` и завершился `ERR_UNKNOWN_FILE_EXTENSION` до запуска
  fixture-кода.
- Проверка наличия Node 22 в локальном npm cache — кэше npm — через
  `npm exec --offline --yes --package=node@22 -- node --version` завершилась
  `ENOTCACHED`. Новая зависимость не устанавливалась. npm напечатал
  machine-specific debug-log path — машинно-зависимый путь журнала; путь не
  открывался, не сохранялся в этом отчёте и исключён как privacy-категория.
- Повтор через `/bin/zsh -lc 'node -v && node --test ...'` в среде подагента также
  выбрал Node `v18.16.1`, поэтому дальнейшие runtime-проверки выполнил координатор
  разрешённым launcher — средством запуска — Node `v22.22.3`. Абсолютный путь
  launcher намеренно не записан.
- Первый запуск Node 22 после исправления импортов выявил только fixture-local
  ошибку: parameter property в `TrayPlanner.ts` не поддерживалась strip-only mode.
  После замены на обычные поля новый runtime-сбой не повторился.
- Первая сборка объединённой финальной команды статического аудита не дошла до
  проверок из-за ошибочного shell quoting — экранирования кавычек — (`unmatched
  quote`). Команда была исправлена без изменения файлов; повтор завершился
  `FINAL_STATIC_AUDIT=PASS`.

### Компиляция

```bash
npm run compile
```

Результат: `PASS`, exit `0`, ошибок TypeScript нет.

### Видимые, скрытые и интеграционные проверки

Команды выполнены координатором под Node `v22.22.3` без сохранения абсолютного пути
launcher:

```bash
node --test evaluation/arm-visible/BG-D03/visible.test.ts
node --test evaluation/verifier-only/BG-D03/self-check.test.ts
node --test tests/BG-D03-derived-state.test.ts
```

Результаты:

- visible legacy suite: `PASS 2/2`, fail `0`;
- verifier-only oracle self-check: `PASS 2/2`, fail `0`;
- fixture integration: `PASS 1/1`, fail `0`.

Preserving candidate — сохраняющий кандидат — принят hidden oracle — скрытым
эталоном, — а seeded false-green candidate — намеренно дефектный кандидат, остающийся
зелёным на видимых тестах, — отклонён.

### Хэши и манифесты

```bash
shasum -a 256 -c <(awk '/^[[:space:]]+- path:/ {path=$3; gsub(/"/, "", path); next} /^[[:space:]]+path:/ {path=$2; gsub(/"/, "", path); next} /^[[:space:]]+sha256:/ {hash=$2; gsub(/"/, "", hash); print hash "  " path}' evaluation/manifests/BG-D03/package-manifest.yaml)
printf '%s  %s\n' '2d7ecccd5afb2c8d7f9e300f3dbb13546d8d5ec1f03df58f9c037eb3348ecc1d' 'evaluation/behavior-specs/BG-D03.md' | shasum -a 256 -c -
```

Результат: все 9 package-manifest файлов `OK`; поведенческая спецификация `OK`.
Манифест покрывает 2 arm-visible файла, 4 verifier-only файла, 2 кандидата и 1
fixture-specific интеграционный тест.

### Неизменность кандидатов

В одном Node 22 shell-сеансе координатор сохранил SHA-256 обеих кандидатов до трёх
проверок, повторно вычислил их после проверок и сравнил значения:

```bash
before=$(shasum -a 256 candidates/BG-D03/candidate-a/TrayPlanner.ts candidates/BG-D03/candidate-b/TrayPlanner.ts)
node --test evaluation/arm-visible/BG-D03/visible.test.ts
node --test evaluation/verifier-only/BG-D03/self-check.test.ts
node --test tests/BG-D03-derived-state.test.ts
after=$(shasum -a 256 candidates/BG-D03/candidate-a/TrayPlanner.ts candidates/BG-D03/candidate-b/TrayPlanner.ts)
test "$before" = "$after"
```

Результат: exit `0`, `IMMUTABILITY=PASS`; повторные результаты тестов — `2/2`,
`2/2`, `1/1`, fail `0`.

### Границы, форматирование и документация кода

```bash
git diff --check
git diff --name-only
rg -n '^export (const|class|interface|type|function)' candidates/BG-D03 evaluation/arm-visible/BG-D03 evaluation/verifier-only/BG-D03 tests/BG-D03*
rg -n "from ['\"][.][.\/]" candidates/BG-D03 evaluation/arm-visible/BG-D03 evaluation/verifier-only/BG-D03 tests/BG-D03*
```

Результат: `git diff --check` прошёл; список tracked shared edits пуст; локальные
импорты используют `.ts`; каждый публичный или экспортируемый BG-D03 API имеет
содержательный English JSDoc. Текущие untracked файлы ограничены BG-D03 и двумя
заранее существовавшими служебными файлами `SES-20260830-007`.

## Решение и итог

Гипотеза подтверждена частично: исходный module-resolution дефект действительно
устранён заменой `.js` на `.ts`, но после него обнаружились три независимых
fixture-local дефекта обвязки — две конкурирующие пары кандидатов, смешение getter и
method API и неподдерживаемые parameter properties. Все они исправлены строго внутри
BG-D03 без изменения поведенческой спецификации или seeded failure.

BG-D03 компилируется, видимые тесты остаются зелёными для обеих кандидатов, скрытый
эталон различает preserving и false-green варианты, хэши сходятся с манифестами, а
кандидаты не изменяются во время проверок. Official/scored run не выполнялся;
repository-owner review и последующая интеграция остаются задачей координатора.
