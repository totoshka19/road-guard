import type { FeatureCollection, Point } from 'geojson'
import type { Camera } from '../../data/types'

/**
 * Свойства, которые едут в GeoJSON-фичу камеры. MapLibre при кластеризации
 * дополнит фичи кластеров своими полями (cluster, cluster_id, point_count),
 * а эти достаются для попапа и выбора конкретной камеры по клику.
 */
export interface CameraFeatureProps {
  id: string
  name: string
  district: string
}

/**
 * Камеры из стора → GeoJSON FeatureCollection для источника карты.
 *
 * Важно: в GeoJSON координаты идут в порядке [lng, lat] (долгота, широта) —
 * обратном привычному «широта, долгота». Перепутанный порядок — классическая
 * причина, по которой точки уезжают в океан у берегов Африки.
 */
export function camerasToGeoJson(
  cameras: Camera[],
): FeatureCollection<Point, CameraFeatureProps> {
  return {
    type: 'FeatureCollection',
    features: cameras.map((camera) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [camera.lng, camera.lat] },
      properties: {
        id: camera.id,
        name: camera.name,
        district: camera.district,
      },
    })),
  }
}
