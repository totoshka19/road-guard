import { useState } from 'react'
import { useAppSelector } from '../app/hooks'
import { useInitialData } from '../app/useInitialData'
import { FilterControls } from '../features/filters/FilterControls'
import { KpiCards } from '../features/stats/KpiCards'
import { StatsCharts } from '../features/stats/StatsCharts'
import { ViolationFeed } from '../features/violations/ViolationFeed'
import { selectFilteredViolations } from '../features/stats/selectors'
import { FeedSkeleton, PanelError, StatsSkeleton } from './PanelStates'

type Tab = 'stats' | 'feed'

export function Sidebar() {
  const [tab, setTab] = useState<Tab>('stats')
  const { isLoading, isError, errorMessage, retry } = useInitialData()
  const count = useAppSelector((s) => selectFilteredViolations(s).length)

  // Ошибка и загрузка общие для обеих вкладок: без начальных данных
  // ни статистика, ни лента показать нечего.
  const content = isError ? (
    <PanelError message={errorMessage} onRetry={retry} />
  ) : isLoading ? (
    tab === 'stats' ? (
      <StatsSkeleton />
    ) : (
      <FeedSkeleton />
    )
  ) : tab === 'stats' ? (
    <div className="sidebar__panel sidebar__panel--scroll">
      <FilterControls />
      <KpiCards />
      <StatsCharts />
    </div>
  ) : (
    <ViolationFeed />
  )

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
          Лента{' '}
          {/* Счётчик считает буфер, который живой поток наполняет и при
              упавшем REST-запросе. Показывать число рядом с «не удалось
              загрузить» — противоречить самим себе. */}
          <span className="sidebar__badge">
            {isError ? '—' : isLoading ? '…' : count}
          </span>
        </button>
      </div>

      {content}
    </aside>
  )
}
