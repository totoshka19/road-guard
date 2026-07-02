import type { FeatureCollection, Point } from 'geojson'
import type { Violation } from '../../data/types'
import { VIOLATION_TYPES } from '../../data/city'

export interface ViolationFeatureProps {
  id: string
  /** Цвет по типу нарушения — читается слоем через ['get', 'color']. */
  color: string
}

/**
 * Последние `limit` нарушений → GeoJSON точек для слоя на карте.
 * Буфер хранит новейшие в начале, поэтому берём префикс: карта не должна
 * тонуть в сотнях точек, показываем только свежие.
 */
export function recentViolationsToGeoJson(
  violations: Violation[],
  limit: number,
): FeatureCollection<Point, ViolationFeatureProps> {
  return {
    type: 'FeatureCollection',
    features: violations.slice(0, limit).map((violation) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [violation.lng, violation.lat] },
      properties: {
        id: violation.id,
        color: VIOLATION_TYPES[violation.type].color,
      },
    })),
  }
}
