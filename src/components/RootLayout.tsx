import { useEffect } from 'react'
import { Link, Outlet } from 'react-router'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { useGetCamerasQuery, useGetViolationsQuery } from '../app/api'
import { CITY } from '../data/city'
import { useViolationStream } from '../features/playback/useViolationStream'
import { tick } from '../features/ui/uiSlice'

/** Как часто обновляем общее «сейчас» для фильтров по времени и динамики. */
const CLOCK_INTERVAL_MS = 5000

/**
 * Общий каркас приложения: шапка, футер и слот под страницу.
 *
 * Здесь же живут вещи, которые не должны переживать смену маршрута:
 * начальная REST-загрузка (её кэш RTK Query держит, пока layout подписан)
 * и подписка на поток нарушений — иначе переход на страницу камеры рвал бы
 * стрим и оставлял дыру в ленте.
 */
export function RootLayout() {
  const dispatch = useAppDispatch()

  useGetCamerasQuery()
  useGetViolationsQuery()
  useViolationStream()

  const playing = useAppSelector((s) => s.playback.playing)

  // Единый тикер времени: один источник now для reselect-селекторов.
  useEffect(() => {
    const id = setInterval(() => dispatch(tick(Date.now())), CLOCK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [dispatch])

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          <span className="brand__mark" aria-hidden />
          <div className="brand__text">
            <h1 className="brand__title">RoadGuard</h1>
            <p className="brand__subtitle">
              Мониторинг дорожных нарушений · {CITY.name}
            </p>
          </div>
        </Link>
        <span
          className={
            playing ? 'status-pill' : 'status-pill status-pill--paused'
          }
        >
          <span className="status-pill__dot" aria-hidden />
          {playing ? 'Поток активен' : 'Поток на паузе'}
        </span>
      </header>

      <Outlet />

      <footer className="app-footer">
        <span>RoadGuard · портфолио-проект · {CITY.name}</span>
      </footer>
    </div>
  )
}
