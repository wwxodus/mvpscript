# МVPScript — анализатор переговоров

AI-анализатор стенограмм продажных звонков для B2B-интегратора Saby. Принимает стенограмму и возвращает структурированный JSON (договорённости, сроки, встречи, риски), подкреплённый цитатами.

**Stack:** SvelteKit · Bun · Zod · OpenRouter SDK (`nvidia/nemotron-3-ultra-550b-a55b:free`) · Vercel.

## Запуск

```sh
bun install
cp .env.example .env.local   # заполнить OPENROUTER_API_KEY
bun run dev
```

Env-переменные: `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`.

## Развёртывание (Vercel)

Build & Install: `bun run build` / `bun install`. Node 22/24. Добавить те же env-переменные в **Environment Variables**.

## Команды

```sh
bun run dev      # разработка
bun run check    # svelte-check
bun run lint     # prettier + eslint
bun run build    # продакшен (adapter-vercel)
```

## Структура

- `src/lib/server/llm/` — адаптер LLM (интерфейс, реализация OpenRouter, чтение env).
- `src/lib/server/schema.ts` — схема анализа (Zod) + JSON Schema.
- `src/lib/server/prompts.ts` — системный промпт экстрактора.
- `src/lib/server/transcripts.ts` — стенограммы-примеры из `transcripts/`, встроенные в сборку.
- `src/routes/api/` — `POST /api/analyze`, `GET /api/transcripts`, `GET /api/transcripts/[slug]`.
- `src/routes/+page.svelte`, `src/lib/components/` — страница и компоненты UI.
