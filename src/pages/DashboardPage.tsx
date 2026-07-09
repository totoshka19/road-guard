import { useAppSelector } from '../app/hooks'
import { CityMap } from '../components/map/CityMap'
import { Sidebar } from '../components/Sidebar'
import { PlaybackControls } from '../features/playback/PlaybackControls'
import { HeatmapToggle } from '../features/ui/HeatmapToggle'
import {
  selectAllCameras,
  selectCamerasReady,
} from '../features/cameras/selectors'

export function DashboardPage() {
  const cameraCount = useAppSelector(selectAllCameras).length
  const isReady = useAppSelector(selectCamerasReady)

  return (
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
  )
}
