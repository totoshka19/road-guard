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
- **React Router v8** (data mode) — дашборд + страница отдельной камеры
- **Redux Toolkit** — клиентское состояние (выбор камеры, фильтры, плейбек)
  и кольцевой буфер живого потока на 500 событий
- **RTK Query** — серверные данные (камеры, история нарушений): кэш, хуки,
  состояния загрузки; `baseQuery` реализован поверх интерфейса `DataSource`
- **Zod** — схемы и типы доменной модели (единый источник истины)
- **ESLint 9** (flat config) + **Prettier** + pre-commit хук (husky + lint-staged)
- **Vitest** — unit-тесты
- **GitHub Actions** — CI + авто-деплой на Cloudflare Workers
- **MapLibre GL + react-map-gl** — карта города (тёмный keyless-стиль
  OpenFreeMap), нативная кластеризация маркеров камер
- **GSAP** — анимация появления нарушений (расходящийся пульс на карте)
- **Chart.js + react-chartjs-2** — графики (по типам, районам, динамика)
- **vite-plugin-pwa (Workbox)** — устанавливаемое приложение, офлайн-режим,
  промпт обновления вместо тихой подмены версии

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
  app/        # store, типизированные хуки
    api.ts          #   RTK Query: baseQuery поверх DataSource + эндпоинты
    router.tsx      #   маршруты (data mode)
  data/       # слой абстракции данных
    types.ts        #   Zod-схемы + выведенные типы (Camera, Violation, …)
    city.ts         #   гео-конфиг города (Екатеринбург), районы, типы нарушений
    DataSource.ts   #   интерфейс источника данных
    mock/           #   MockDataSource (симуляция) + генератор потока
  components/ # UI-компоненты
    RootLayout.tsx  #   каркас: шапка, футер, REST-загрузка, подписка на поток
    map/            #   CityMap, слои кластеризации/точек/heatmap, GSAP-пульс
    Sidebar.tsx     #   правая панель: вкладки «Статистика» / «Лента»
  features/   # cameras / violations / playback / filters / stats / ui
    cameras/        #   слайс выбора, селекторы поверх кэша, camerasToGeoJson
    violations/     #   слайс (буфер), лента событий, violationGeoJson
    playback/       #   слайс, контролы, подписка на поток (useViolationStream)
    filters/        #   слайс фильтров + панель фильтров
    stats/          #   reselect-селекторы, KPI-карточки, графики Chart.js
    ui/             #   слайс (heatmap, now) + переключатель тепловой карты
  lib/        # утилиты (filters, stats, formatRelativeTime, chartSetup)
  pages/      # DashboardPage, CameraDetailPage, NotFoundPage
  styles/     # глобальные стили
```

## Архитектура

Весь UI работает через интерфейс `DataSource` и не знает, откуда приходят данные.
Сейчас подключён `MockDataSource` (генерация в браузере, WS-подобный поток).
Чтобы перейти на реальный бэкенд, достаточно реализовать `RealDataSource`
(`fetch` + `WebSocket`) и подменить его в одной точке — `src/data/index.ts`.

RTK Query этому не мешает, а пользуется: его `baseQuery` — обычная функция
«запрос → `{ data }` | `{ error }`», и в [`src/app/api.ts`](./src/app/api.ts)
она реализована поверх `DataSource`, а не поверх `fetch`. Поэтому кэш, хуки и
состояния загрузки работают уже сейчас, а подмена транспорта не заденет ни один
эндпоинт и ни один компонент.

Ответственность в сторе разделена так же, как в бою:

| Что                              | Где живёт                          |
| -------------------------------- | ---------------------------------- |
| Камеры, история нарушений (REST) | кэш RTK Query                      |
| Поток новых нарушений (WS)       | `violationsSlice`, кольцевой буфер |
| Выбор камеры, фильтры, плейбек   | обычные слайсы                     |

Начальная история засеивает буфер через `matchFulfilled` — буфер не дублирует
кэш, а продолжает его живым потоком.

## PWA и офлайн

Приложение устанавливается и **полностью работает без сети**: оболочка и все
чанки лежат в precache, тайлы OpenFreeMap кэшируются по стратегии `CacheFirst`,
а данные и так генерируются в браузере. Глубокие ссылки (`/camera/:id`) офлайн
отдаёт `navigateFallback` — офлайновый аналог SPA-фолбэка на воркере Cloudflare.

Новая версия не подменяется молча: service worker встаёт в `waiting` и ждёт,
пока пользователь нажмёт «Обновить». Иначе перезагрузка оборвала бы живой поток
и обнулила кольцевой буфер.

Иконки манифеста собираются из [`public/favicon.svg`](./public/favicon.svg)
командой `npm run icons`: скрипт [`scripts/make-icons.mjs`](./scripts/make-icons.mjs)
раскладывает кривые Безье в полигон, заливает его со сглаживанием и пишет PNG
поверх встроенного `zlib` — без графических зависимостей.

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
- ✅ Этап 4 — фильтры, reselect-статистика, KPI, графики Chart.js, heatmap
- ✅ Долг по стеку — React Router, страница камеры, RTK Query
- ⏳ Этап 5 — PWA и полировка (следующий)
