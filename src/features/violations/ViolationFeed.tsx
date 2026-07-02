import { useEffect, useState } from 'react'
import { useAppSelector } from '../../app/hooks'
import { VIOLATION_TYPES } from '../../data/city'
import { formatRelativeTime } from '../../lib/formatRelativeTime'

/** Сколько событий держим в DOM ленты (буфер в сторе больше). */
const FEED_LIMIT = 60

/** Тикающее «сейчас» — чтобы относительное время в ленте обновлялось живьём. */
function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

export function ViolationFeed() {
  const items = useAppSelector((s) => s.violations.items)
  const now = useNow(1000)
  const visible = items.slice(0, FEED_LIMIT)

  return (
    <aside className="feed">
      <header className="feed__header">
        <h2 className="feed__title">Лента событий</h2>
        <span className="feed__count">{items.length}</span>
      </header>
      {visible.length === 0 ? (
        <p className="feed__empty">Ожидаем события…</p>
      ) : (
        <ul className="feed__list">
          {visible.map((violation) => {
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
                  <p className="feed-item__meta">
                    {violation.district} · {violation.plate}
                  </p>
                </div>
                <time className="feed-item__time">
                  {formatRelativeTime(violation.timestamp, now)}
                </time>
              </li>
            )
          })}
        </ul>
      )}
    </aside>
  )
}
