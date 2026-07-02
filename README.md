# RoadGuard

Real-time дашборд мониторинга дорожных нарушений: карта города с камерами
фотовидеофиксации и «прилетающими» с них нарушениями ПДД.

**🔗 Живая демо: [road-guard.totoshka.workers.dev](https://road-guard.totoshka.workers.dev)**

> Портфолио-проект (React + TypeScript). Данные сейчас генерируются в браузере и
> имитируют настоящий real-time; архитектура спроектирована так, чтобы позже
> подменить симуляцию на реальный бэкенд (`fetch` + `WebSocket`) без переписывания
> UI. Подробности — в [PLAN.md](./PLAN.md).

## Стек

- **Vite + React 19 + TypeScript** (strict)
- **Redux Toolkit + React-Redux** — состояние (слайсы `cameras`/`violations`,
  кольцевой буфер на 500 событий)
- **Zod** — схемы и типы доменной модели (единый источник истины)
- **ESLint 9** (flat config) + **Prettier** + pre-commit хук (husky + lint-staged)
- **Vitest** — unit-тесты
- **GitHub Actions** — CI + авто-деплой на Cloudflare Workers
- **MapLibre GL + react-map-gl** — карта города (тёмный keyless-стиль
  OpenFreeMap), нативная кластеризация маркеров камер
- **GSAP** — анимация появления нарушений (расходящийся пульс на карте)
- _Дальше по плану:_ Chart.js (графики), PWA

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
npm test           # unit-тесты (Vitest)
```

## Структура

```
src/
  app/        # store, типизированные хуки, bootstrap-загрузка
  data/       # слой абстракции данных
    types.ts        #   Zod-схемы + выведенные типы (Camera, Violation, …)
    city.ts         #   гео-конфиг города (Екатеринбург), районы, типы нарушений
    DataSource.ts   #   интерфейс источника данных
    mock/           #   MockDataSource (симуляция) + генератор потока
  components/ # UI-компоненты
    map/            #   CityMap, слои кластеризации, GSAP-пульс нарушений
  features/   # cameras / violations / playback (+ stats / filters — далее)
    cameras/        #   слайс, выбор камеры, camerasToGeoJson
    violations/     #   слайс (буфер), лента событий, violationGeoJson
    playback/       #   слайс, контролы, подписка на поток (useViolationStream)
  lib/        # утилиты (formatRelativeTime)
  pages/      # DashboardPage
  styles/     # глобальные стили
```

## Архитектура

Весь UI работает через интерфейс `DataSource` и не знает, откуда приходят данные.
Сейчас подключён `MockDataSource` (генерация в браузере, WS-подобный поток).
Чтобы перейти на реальный бэкенд, достаточно реализовать `RealDataSource`
(`fetch` + `WebSocket`) и подменить его в одной точке — `src/data/index.ts`.

## Деплой

Хостинг — **Cloudflare Workers** (Static Assets): worker без кода раздаёт
собранную статику из `dist/` (конфиг — [`wrangler.jsonc`](./wrangler.jsonc)).

Деплой полностью автоматический через **GitHub Actions**
([`.github/workflows/ci.yml`](./.github/workflows/ci.yml)):

1. На каждый push и pull request в `main` job `quality` прогоняет
   lint → формат → типы → тесты → сборку.
2. Только на push в `main`, после успешного `quality`, job `deploy`
   публикует `dist/` на Cloudflare через `wrangler deploy`.

Для деплоя нужен один секрет в GitHub Actions — `CLOUDFLARE_API_TOKEN`
(токен с правами шаблона «Edit Cloudflare Workers»).

## Статус

🚧 В разработке.

- ✅ Этап 0 — каркас, CI/CD, авто-деплой
- ✅ Этап 1 — слой данных (типы, `DataSource`, мок-источник, Redux-стор)
- ✅ Этап 2 — карта MapLibre: камеры из GeoJSON, кластеризация, выбор камеры
- ✅ Этап 3 — живой поток: подписка, GSAP-пульс на карте, лента, плейбек
- ⏳ Этап 4 — фильтры, статистика, графики (следующий)
