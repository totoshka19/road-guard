import { useAppSelector } from '../app/hooks'
import { CITY } from '../data/city'

export function DashboardPage() {
  const cameraCount = useAppSelector((s) => s.cameras.items.length)
  const violationCount = useAppSelector((s) => s.violations.items.length)

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
          Этап&nbsp;1 · слой данных
        </span>
      </header>

      <main className="app-main">
        <section className="placeholder">
          <p className="placeholder__eyebrow">Слой данных подключён</p>
          <h2 className="placeholder__title">Данные загружены в стор</h2>
          <p className="placeholder__text">
            Мок-источник отдал камеры и историю нарушений через интерфейс
            DataSource. Дальше — карта&nbsp;MapLibre и живой поток событий.
          </p>
          <div className="stat-row">
            <div className="stat">
              <span className="stat__value">{cameraCount}</span>
              <span className="stat__label">камер</span>
            </div>
            <div className="stat">
              <span className="stat__value">{violationCount}</span>
              <span className="stat__label">событий в буфере</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <span>RoadGuard · портфолио-проект</span>
      </footer>
    </div>
  )
}
