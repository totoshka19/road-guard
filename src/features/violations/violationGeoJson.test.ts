import { describe, expect, it } from 'vitest'
import { recentViolationsToGeoJson } from './violationGeoJson'
import { VIOLATION_TYPES } from '../../data/city'
import type { Violation } from '../../data/types'

function makeViolation(over: Partial<Violation> = {}): Violation {
  return {
    id: 'v1',
    cameraId: 'cam_1',
    type: 'speeding',
    plate: 'А123ВС 96',
    lat: 56.84,
    lng: 60.6,
    district: 'Кировский',
    timestamp: 1,
    ...over,
  }
}

describe('recentViolationsToGeoJson', () => {
  it('берёт только первые `limit` событий', () => {
    const many = Array.from({ length: 10 }, (_, i) =>
      makeViolation({ id: `v${i}` }),
    )
    const fc = recentViolationsToGeoJson(many, 3)
    expect(fc.features).toHaveLength(3)
    expect(fc.features.map((f) => f.properties.id)).toEqual(['v0', 'v1', 'v2'])
  })

  it('координаты в порядке [lng, lat]', () => {
    const fc = recentViolationsToGeoJson(
      [makeViolation({ lat: 56.84, lng: 60.6 })],
      10,
    )
    expect(fc.features[0].geometry.coordinates).toEqual([60.6, 56.84])
  })

  it('подставляет цвет по типу нарушения', () => {
    const fc = recentViolationsToGeoJson(
      [makeViolation({ type: 'red_light' })],
      10,
    )
    expect(fc.features[0].properties.color).toBe(
      VIOLATION_TYPES.red_light.color,
    )
  })
})
