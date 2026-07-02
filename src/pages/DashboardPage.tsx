export function DashboardPage() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand__mark" aria-hidden />
          <div className="brand__text">
            <h1 className="brand__title">RoadGuard</h1>
            <p className="brand__subtitle">
              Мониторинг дорожных нарушений в реальном времени
            </p>
          </div>
        </div>
        <span className="status-pill">
          <span className="status-pill__dot" aria-hidden />
          Этап&nbsp;0 · каркас развёрнут
        </span>
      </header>

      <main className="app-main">
        <section className="placeholder">
          <p className="placeholder__eyebrow">Скоро здесь появится</p>
          <h2 className="placeholder__title">
            Карта города и живая лента событий
          </h2>
          <p className="placeholder__text">
            Каркас приложения собран и задеплоен. Следующие шаги — слой данных,
            карта&nbsp;MapLibre и&nbsp;real-time поток нарушений.
          </p>
        </section>
      </main>

      <footer className="app-footer">
        <span>RoadGuard · портфолио-проект</span>
      </footer>
    </div>
  )
}
