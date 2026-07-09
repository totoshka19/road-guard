/**
 * Состояния боковой панели до появления данных: скелетоны и ошибка.
 *
 * Скелетоны намеренно повторяют разметку настоящих блоков (те же .kpi и
 * .chart-card), поэтому при появлении данных ничего не «прыгает».
 */

const CHART_TITLES = ['По типам', 'По районам', 'Динамика · 30 мин']
const FEED_ROWS = 8

export function StatsSkeleton() {
  return (
    <div className="sidebar__panel sidebar__panel--scroll" aria-busy>
      <div className="kpis">
        {[0, 1, 2].map((i) => (
          <div key={i} className="kpi">
            <span className="skeleton skeleton--value" />
            <span className="skeleton skeleton--label" />
          </div>
        ))}
      </div>
      <div className="charts">
        {CHART_TITLES.map((title) => (
          <section key={title} className="chart-card">
            <h3 className="chart-card__title">{title}</h3>
            <div className="chart-card__canvas">
              <span className="skeleton skeleton--chart" />
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export function FeedSkeleton() {
  return (
    <div className="feed" aria-busy>
      <ul className="feed__list">
        {Array.from({ length: FEED_ROWS }, (_, i) => (
          <li key={i} className="feed-item">
            <span className="skeleton skeleton--dot" />
            <div className="feed-item__body">
              <span className="skeleton skeleton--line" />
              <span className="skeleton skeleton--line skeleton--line-short" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function PanelError({
  message,
  onRetry,
}: {
  message: string | null
  onRetry: () => void
}) {
  return (
    <div className="panel-error" role="alert">
      <p className="panel-error__title">Не удалось загрузить данные</p>
      {message && <p className="panel-error__detail">{message}</p>}
      <button type="button" className="panel-error__retry" onClick={onRetry}>
        Повторить
      </button>
    </div>
  )
}
