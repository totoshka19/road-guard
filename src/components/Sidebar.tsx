import { useState } from 'react'
import { useAppSelector } from '../app/hooks'
import { FilterControls } from '../features/filters/FilterControls'
import { KpiCards } from '../features/stats/KpiCards'
import { StatsCharts } from '../features/stats/StatsCharts'
import { ViolationFeed } from '../features/violations/ViolationFeed'
import { selectFilteredViolations } from '../features/stats/selectors'

type Tab = 'stats' | 'feed'

export function Sidebar() {
  const [tab, setTab] = useState<Tab>('stats')
  const count = useAppSelector((s) => selectFilteredViolations(s).length)

  return (
    <aside className="sidebar">
      <div className="sidebar__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'stats'}
          className={
            tab === 'stats'
              ? 'sidebar__tab sidebar__tab--active'
              : 'sidebar__tab'
          }
          onClick={() => setTab('stats')}
        >
          Статистика
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'feed'}
          className={
            tab === 'feed'
              ? 'sidebar__tab sidebar__tab--active'
              : 'sidebar__tab'
          }
          onClick={() => setTab('feed')}
        >
          Лента <span className="sidebar__badge">{count}</span>
        </button>
      </div>

      {tab === 'stats' ? (
        <div className="sidebar__panel sidebar__panel--scroll">
          <FilterControls />
          <KpiCards />
          <StatsCharts />
        </div>
      ) : (
        <ViolationFeed />
      )}
    </aside>
  )
}
