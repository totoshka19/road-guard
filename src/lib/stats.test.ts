import { describe, expect, it } from 'vitest'
import { countByDistrict, countByType, violationsOverTime } from './stats'
import { DISTRICTS, VIOLATION_TYPES } from '../data/city'
import type { Violation, ViolationType } from '../data/types'

function makeViolation(over: Partial<Violation> = {}): Violation {
  return {
    id: 'v1',
    cameraId: 'cam_1',
    type: 'speeding',
    plate: 'А123ВС 96',
    lat: 56.84,
    lng: 60.6,
    district: 'Кировский',
    timestamp: 0,
    ...over,
  }
}

describe('countByType', () => {
  it('возвращает все типы в порядке VIOLATION_TYPES', () => {
    const result = countByType([])
    expect(result.map((r) => r.type)).toEqual(
      Object.keys(VIOLATION_TYPES) as ViolationType[],
    )
    expect(result.every((r) => r.count === 0)).toBe(true)
  })

  it('считает по типам', () => {
    const result = countByType([
      makeViolation({ type: 'speeding' }),
      makeViolation({ type: 'speeding' }),
      makeViolation({ type: 'red_light' }),
    ])
    const byType = Object.fromEntries(result.map((r) => [r.type, r.count]))
    expect(byType.speeding).toBe(2)
    expect(byType.red_light).toBe(1)
    expect(byType.wrong_way).toBe(0)
  })
})

describe('countByDistrict', () => {
  it('возвращает все районы, считает попадания', () => {
    const result = countByDistrict([
      makeViolation({ district: 'Кировский' }),
      makeViolation({ district: 'Кировский' }),
    ])
    expect(result).toHaveLength(DISTRICTS.length)
    expect(result.find((r) => r.district === 'Кировский')?.count).toBe(2)
  })
})

describe('violationsOverTime', () => {
  it('раскладывает события по корзинам и игнорирует выходящие за окно', () => {
    const now = 100_000
    const span = 10_000 // окно 10 c
    const buckets = 10 // по 1 c
    const result = violationsOverTime(
      [
        makeViolation({ timestamp: now - 9_500 }), // корзина 0
        makeViolation({ timestamp: now - 500 }), // корзина 9
        makeViolation({ timestamp: now - 400 }), // корзина 9
        makeViolation({ timestamp: now - 50_000 }), // вне окна
      ],
      now,
      span,
      buckets,
    )
    expect(result).toHaveLength(buckets)
    expect(result[0].count).toBe(1)
    expect(result[9].count).toBe(2)
    expect(result.reduce((s, b) => s + b.count, 0)).toBe(3)
  })
})
