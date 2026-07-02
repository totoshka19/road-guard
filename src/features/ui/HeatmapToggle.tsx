import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { toggleHeatmap } from './uiSlice'

export function HeatmapToggle() {
  const dispatch = useAppDispatch()
  const heatmap = useAppSelector((s) => s.ui.heatmap)

  return (
    <button
      type="button"
      className={heatmap ? 'map-toggle map-toggle--active' : 'map-toggle'}
      onClick={() => dispatch(toggleHeatmap())}
      aria-pressed={heatmap}
    >
      <span className="map-toggle__icon" aria-hidden>
        ▦
      </span>
      Тепловая карта
    </button>
  )
}
