# RoadGuard

Real-time дашборд мониторинга дорожных нарушений: карта города с камерами
фотовидеофиксации и «прилетающими» с них нарушениями ПДД.

> Портфолио-проект (React + TypeScript). Данные сейчас генерируются в браузере и
> имитируют настоящий real-time; архитектура спроектирована так, чтобы позже
> подменить симуляцию на реальный бэкенд (`fetch` + `WebSocket`) без переписывания
> UI. Подробности — в [PLAN.md](./PLAN.md).

## Стек

- **Vite + React 19 + TypeScript** (strict)
- **ESLint 9** (flat config) + **Prettier**
- **GitHub Actions** — CI (lint + формат + типы + сборка)
- Дальше по плану: Redux Toolkit, MapLibre GL, Chart.js, GSAP, PWA, Vitest

## Требования

- Node.js **20+** (разработка велась на Node 24)

## Команды

```bash
npm install        # установка зависимостей
npm run dev        # дев-сервер с HMR
npm run build      # прод-сборка в dist/
npm run preview    # локальный просмотр собранной версии
npm run lint       # ESLint
npm run format     # Prettier — форматирование
npm run typecheck  # проверка типов (tsc)
```

## Структура

```
src/
  app/        # store + типизированные хуки Redux
  data/       # слой абстракции данных (интерфейс DataSource + мок/реальная реализация)
  features/   # cameras / violations / stats / filters / playback
  components/  # общий UI
  pages/      # DashboardPage, CameraDetailPage
  lib/        # утилиты
  styles/     # глобальные стили
```

## Деплой

Собранная статика (`dist/`) публикуется бесплатно на **Cloudflare Pages** или
**Vercel** — оба дают SPA-fallback из коробки.

Рекомендуемый путь (без секретов в репозитории) — Git-интеграция:

1. Запушить репозиторий на GitHub.
2. В дашборде Cloudflare Pages / Vercel подключить репозиторий.
3. Указать команду сборки `npm run build` и каталог вывода `dist`.
4. Далее хостинг сам пересобирает и деплоит на каждый push в `main`.

CI (`.github/workflows/ci.yml`) прогоняет линт, форматирование, проверку типов и
сборку на каждый push и pull request в `main`.

## Статус

🚧 В разработке. Текущий этап — **0 (каркас и пайплайн деплоя)**.
