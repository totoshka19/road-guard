import { useAppSelector } from '../app/hooks'
import { CITY } from '../data/city'
import { CityMap } from '../components/map/CityMap'

export function DashboardPage() {
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
          Этап&nbsp;2 · карта камер
        </span>
      </header>

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
      </main>

      <footer className="app-footer">
        <span>RoadGuard · портфолио-проект · {CITY.name}</span>
      </footer>
    </div>
  )
}
