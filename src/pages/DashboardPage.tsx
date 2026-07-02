import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { CITY } from '../data/city'
import { CityMap } from '../components/map/CityMap'
import { Sidebar } from '../components/Sidebar'
import { PlaybackControls } from '../features/playback/PlaybackControls'
import { HeatmapToggle } from '../features/ui/HeatmapToggle'
import { useViolationStream } from '../features/playback/useViolationStream'
import { tick } from '../features/ui/uiSlice'

/** Как часто обновляем общее «сейчас» для фильтров по времени и динамики. */
const CLOCK_INTERVAL_MS = 5000

export function DashboardPage() {
  const dispatch = useAppDispatch()

  // Подключаем «живой» поток нарушений к стору на всё время жизни дашборда.
  useViolationStream()

  // Единый тикер времени: один источник now для reselect-селекторов.
  useEffect(() => {
    const id = setInterval(() => dispatch(tick(Date.now())), CLOCK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [dispatch])

  const cameraCount = useAppSelector((s) => s.cameras.items.length)
  const isReady = useAppSelector((s) => s.cameras.status === 'ready')

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand__mark" aria-hidden />
          <div className="brand__text">
            <h1 className="brand__title">RoadGuard</h1>
            <p className="brand__subtitle">
              Мониторинг дорожных нарушений · {CITY.name}
            </p>
          </div>
        </div>
        <span className="status-pill">
          <span className="status-pill__dot" aria-hidden />
          Этап&nbsp;4 · фильтры и статистика
        </span>
      </header>

      <div className="app-body">
        <main className="app-main app-main--map">
          <CityMap />
          <div className="map-overlay">
            <p className="map-overlay__eyebrow">Камеры фотовидеофиксации</p>
            <p className="map-overlay__count">
              {isReady ? cameraCount : '…'}
              <span className="map-overlay__unit"> на карте</span>
            </p>
            <p className="map-overlay__hint">
              Клик по кластеру — приблизить, по камере — детали
            </p>
          </div>
          <HeatmapToggle />
          <PlaybackControls />
        </main>
        <Sidebar />
      </div>

      <footer className="app-footer">
        <span>RoadGuard · портфолио-проект · {CITY.name}</span>
      </footer>
    </div>
  )
}
