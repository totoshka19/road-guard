import { describe, expect, it } from 'vitest'
import { camerasToGeoJson } from './cameraGeoJson'
import type { Camera } from '../../data/types'

function makeCamera(overrides: Partial<Camera> = {}): Camera {
  return {
    id: 'cam_1',
    name: 'Камера №1',
    lat: 56.84,
    lng: 60.6,
    district: 'Кировский',
    ...overrides,
  }
}

describe('camerasToGeoJson', () => {
  it('оборачивает камеры в FeatureCollection', () => {
    const fc = camerasToGeoJson([makeCamera(), makeCamera({ id: 'cam_2' })])
    expect(fc.type).toBe('FeatureCollection')
    expect(fc.features).toHaveLength(2)
    expect(fc.features[0].type).toBe('Feature')
    expect(fc.features[0].geometry.type).toBe('Point')
  })

  it('кладёт координаты в порядке [lng, lat] — как требует GeoJSON', () => {
    const fc = camerasToGeoJson([makeCamera({ lat: 56.84, lng: 60.6 })])
    expect(fc.features[0].geometry.coordinates).toEqual([60.6, 56.84])
  })

  it('переносит id/name/district в properties (для попапа и выбора)', () => {
    const fc = camerasToGeoJson([
      makeCamera({ id: 'cam_x', name: 'Камера №7', district: 'Ленинский' }),
    ])
    expect(fc.features[0].properties).toEqual({
      id: 'cam_x',
      name: 'Камера №7',
      district: 'Ленинский',
    })
  })

  it('пустой список камер → пустая коллекция', () => {
    expect(camerasToGeoJson([]).features).toHaveLength(0)
  })
})
