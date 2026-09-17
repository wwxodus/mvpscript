# МVPScript — анализатор переговоров

Минимальный AI-анализатор стенограмм продажных звонков для интегратора B2B Saby.
Принимает стенограмму и возвращает структурированный, подкреплённый цитатами результат для CRM и разбора менеджера.

## Как запустить локально

```sh
bun install
cp .env.example .env.local   # и заполните значения, если нужно
bun run dev
```

Переменные окружения (см. `.env.example`):

- `OPENROUTER_API_KEY` — ключ OpenRouter.
- `OPENROUTER_MODEL` — модель, например `nvidia/nemotron-3-ultra-550b-a55b:free`.

## Как развернуть на Vercel

1. Залейте репозиторий на GitHub (или подключите папку).
2. В Vercel создайте проект и укажите:
   - **Framework**: определится автоматически (SvelteKit).
   - **Build command**: `bun run build`.
   - **Install command**: `bun install`.
   - **Node.js version**: 22 или 24 (в `vite.config.ts` задано как `nodejs24.x`).
3. В разделе **Environment Variables** добавьте `OPENROUTER_API_KEY` и `OPENROUTER_MODEL` (те же значения, что в `.env.example`).
4. Deploy. Проверяющий получит публичный URL и сможет выбрать одну из четырёх стенограмм-примеров или вставить свою.

> Стенограммы из `transcripts/*.txt` встраиваются в сборку на этапе build и на сервере не читаются с диска.

## Структура

- `src/lib/server/llm/` — изолированный адаптер LLM (`adapter.ts` — интерфейс и типы ошибок, `openrouter.ts` — реализация через `@openrouter/sdk`).
- `src/lib/server/schema.ts` — типы анализа + валидация ответа модели (Zod) и JSON Schema для structured output.
- `src/lib/server/prompts.ts` — системный промпт экстрактора.
- `src/lib/server/transcripts.ts` — загрузка стенограмм-примеров.
- `src/routes/api/analyze/+server.ts` — `POST /api/analyze`.
- `src/routes/api/transcripts/…` — список примеров и содержимое конкретной стенограммы (для превью).
- `src/lib/components/` — компоненты интерфейса.

## Команды

```sh
bun run dev      # разработка
bun run check    # svelte-check
bun run lint     # prettier + eslint
bun run build    # продакшен-сборка (adapter-vercel)
```

## Ограничения MVP

- Анализируется одна стенограмма за раз, без сохранения контекста между запросами.
- Даты разрешаются относительно даты разговора; время и часовой пояс берутся из текста.
- Извлечение вероятностное; всё подкрепляется цитатами из текста.
- Аутентификация, БД и интеграция с CRM не входят в MVP.
