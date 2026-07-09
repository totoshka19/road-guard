import { useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { Doughnut, Line } from 'react-chartjs-2'
import type { ChartData, ChartOptions } from 'chart.js'

import { useAppSelector } from '../app/hooks'
import { useGetCameraViolationsQuery, useGetCamerasQuery } from '../app/api'
import { VIOLATION_TYPES } from '../data/city'
import type { Violation } from '../data/types'
import { selectResolvedTheme } from '../features/ui/selectors'
import {
  CHART_ACCENT,
  CHART_ACCENT_FILL,
  chartPalette,
} from '../lib/chartSetup'
import { formatRelativeTime } from '../lib/formatRelativeTime'
import { countByType, violationsOverTime, withinLastMs } from '../lib/stats'

/** Динамика камеры: последние 6 часов, 12 корзин по 30 минут. */
const SPAN_MS = 6 * 60 * 60 * 1000
const BUCKETS = 12
/** Как часто перезапрашиваем историю камеры (REST-поллинг). */
const POLL_INTERVAL_MS = 5000
/** Сколько последних событий показываем списком. */
const RECENT_LIMIT = 20

function TypeDoughnut({ violations }: { violations: Violation[] }) {
  const palette = chartPalette(useAppSelector(selectResolvedTheme))
  const byType = useMemo(
    () => countByType(violations).filter((t) => t.count > 0),
    [violations],
  )
  const data: ChartData<'doughnut'> = {
    labels: byType.map((t) => t.label),
    datasets: [
      {
        data: byType.map((t) => t.count),
        backgroundColor: byType.map((t) => t.color),
        borderWidth: 0,
      },
    ],
  }
  const options: ChartOptions<'doughnut'> = {
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: palette.tick,
          boxWidth: 9,
          boxHeight: 9,
          font: { size: 10 },
          padding: 8,
        },
      },
    },
  }
  return <Doughnut data={data} options={options} />
}

function TimelineChart({
  violations,
  now,
}: {
  violations: Violation[]
  now: number
}) {
  const palette = chartPalette(useAppSelector(selectResolvedTheme))
  const series = useMemo(
    () => violationsOverTime(violations, now, SPAN_MS, BUCKETS),
    [violations, now],
  )
  const data: ChartData<'line'> = {
    labels: series.map((b) =>
      new Date(b.from).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    ),
    datasets: [
      {
        data: series.map((b) => b.count),
        borderColor: CHART_ACCENT,
        backgroundColor: CHART_ACCENT_FILL,
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  }
  const options: ChartOptions<'line'> = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0, color: palette.tick },
        grid: { color: palette.grid },
      },
      x: {
        ticks: { maxTicksLimit: 6, font: { size: 9 }, color: palette.tick },
        grid: { color: palette.grid },
      },
    },
  }
  return <Line data={data} options={options} />
}

export function CameraDetailPage() {
  const { cameraId = '' } = useParams()
  const now = useAppSelector((s) => s.ui.now)

  // Камеру берём из уже прогретого кэша списка: selectFromResult вытаскивает
  // одну запись без повторного запроса к источнику.
  const { camera, camerasLoading } = useGetCamerasQuery(undefined, {
    selectFromResult: ({ data, isLoading }) => ({
      camera: data?.find((c) => c.id === cameraId),
      camerasLoading: isLoading,
    }),
  })

  // История именно этой камеры — параметризованный REST-запрос со своей
  // записью кэша. Поллинг подтягивает события, «прилетевшие» после открытия.
  const {
    data: violations = [],
    isLoading,
    isError,
    error,
  } = useGetCameraViolationsQuery(cameraId, {
    skip: !cameraId,
    pollingInterval: POLL_INTERVAL_MS,
  })

  // Эндпоинт отдаёт всю историю камеры; страница показывает окно в SPAN_MS —
  // то же самое, по которому строится график. Иначе KPI считал бы события,
  // выпавшие из графика, и подпись «за 6 часов» врала бы.
  const windowed = useMemo(
    () => withinLastMs(violations, now, SPAN_MS),
    [violations, now],
  )

  const recent = useMemo(
    () =>
      [...windowed]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, RECENT_LIMIT),
    [windowed],
  )
  const topType = useMemo(() => {
    const byType = countByType(windowed)
    return windowed.length
      ? byType.reduce((max, cur) => (cur.count > max.count ? cur : max))
      : null
  }, [windowed])

  if (!camerasLoading && !camera) {
    return (
      <main className="page page--center">
        <p className="page__empty">Камера {cameraId} не найдена</p>
        <Link to="/" className="page__back">
          ← Вернуться к карте
        </Link>
      </main>
    )
  }

  return (
    <main className="page">
      <Link to="/" className="page__back">
        ← К карте
      </Link>

      <header className="page__head">
        <h2 className="page__title">{camera?.name ?? 'Загрузка…'}</h2>
        {camera && (
          <p className="page__subtitle">
            {camera.district} · {camera.lat.toFixed(4)}, {camera.lng.toFixed(4)}
          </p>
        )}
      </header>

      {isError ? (
        <p className="page__empty">
          Не удалось загрузить нарушения: {error?.message}
        </p>
      ) : isLoading ? (
        <p className="page__empty">Загрузка нарушений…</p>
      ) : (
        <>
          <div className="kpis">
            <div className="kpi">
              <span className="kpi__value">{windowed.length}</span>
              <span className="kpi__label">событий за 6 часов</span>
            </div>
            <div className="kpi">
              {topType ? (
                <span className="kpi__value kpi__value--type">
                  <span
                    className="kpi__dot"
                    style={{ background: topType.color }}
                    aria-hidden
                  />
                  {topType.count}
                </span>
              ) : (
                <span className="kpi__value">—</span>
              )}
              <span className="kpi__label">
                {topType ? topType.label : 'частый тип'}
              </span>
            </div>
            <div className="kpi">
              <span className="kpi__value">
                {recent[0] ? formatRelativeTime(recent[0].timestamp, now) : '—'}
              </span>
              <span className="kpi__label">последнее событие</span>
            </div>
          </div>

          <div className="charts charts--row">
            <section className="chart-card">
              <h3 className="chart-card__title">По типам</h3>
              <div className="chart-card__canvas">
                <TypeDoughnut violations={windowed} />
              </div>
            </section>
            <section className="chart-card">
              <h3 className="chart-card__title">Динамика · 6 ч</h3>
              <div className="chart-card__canvas">
                <TimelineChart violations={windowed} now={now} />
              </div>
            </section>
          </div>

          <section className="page__section">
            <h3 className="chart-card__title">Последние нарушения</h3>
            {recent.length === 0 ? (
              <p className="page__empty">
                За последние 6 часов с этой камеры ничего не пришло
              </p>
            ) : (
              <ul className="feed__list">
                {recent.map((violation) => {
                  const meta = VIOLATION_TYPES[violation.type]
                  return (
                    <li key={violation.id} className="feed-item">
                      <span
                        className="feed-item__dot"
                        style={{ background: meta.color }}
                        aria-hidden
                      />
                      <div className="feed-item__body">
                        <p className="feed-item__type">{meta.label}</p>
                        <p className="feed-item__meta">{violation.plate}</p>
                      </div>
                      <time className="feed-item__time">
                        {formatRelativeTime(violation.timestamp, now)}
                      </time>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  )
}
