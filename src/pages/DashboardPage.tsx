import { Suspense, lazy } from 'react'
import { useAppSelector } from '../app/hooks'
import { Sidebar } from '../components/Sidebar'
import { PlaybackControls } from '../features/playback/PlaybackControls'
import { HeatmapToggle } from '../features/ui/HeatmapToggle'
import {
  selectAllCameras,
  selectCamerasReady,
} from '../features/cameras/selectors'

/**
 * Карта — единственная дверь к maplibre-gl, react-map-gl и gsap (~1 МБ).
 * За ленивой границей их не тянут ни страница камеры, ни 404, а на самом
 * дашборде каркас и статистика рисуются, не дожидаясь парсинга этого чанка.
 */
const CityMap = lazy(() =>
  import('../components/map/CityMap').then((m) => ({ default: m.CityMap })),
)

function MapSkeleton() {
  return (
    <div className="map-skeleton" role="status">
      <span className="map-skeleton__pulse" aria-hidden />
      <span className="map-skeleton__text">Загрузка карты…</span>
    </div>
  )
}

export function DashboardPage() {
  const cameraCount = useAppSelector(selectAllCameras).length
  const isReady = useAppSelector(selectCamerasReady)

  return (
    <div className="app-body">
      <main className="app-main app-main--map">
        <Suspense fallback={<MapSkeleton />}>
          <CityMap />
        </Suspense>
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
  )
}
