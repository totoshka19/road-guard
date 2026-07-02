import { describe, expect, it } from 'vitest'
import { matchesActiveFilters, windowSince } from './filters'
import type { ActiveFilters } from './filters'
import type { Violation } from '../data/types'

const NOW = 1_700_000_000_000

function makeViolation(over: Partial<Violation> = {}): Violation {
  return {
    id: 'v1',
    cameraId: 'cam_1',
    type: 'speeding',
    plate: 'А123ВС 96',
    lat: 56.84,
    lng: 60.6,
    district: 'Кировский',
    timestamp: NOW,
    ...over,
  }
}

const NO_FILTERS: ActiveFilters = { types: [], districts: [], window: 'all' }

describe('matchesActiveFilters', () => {
  it('пустые фильтры пропускают всё', () => {
    expect(matchesActiveFilters(makeViolation(), NO_FILTERS, NOW)).toBe(true)
  })

  it('фильтр по типу', () => {
    const f: ActiveFilters = { ...NO_FILTERS, types: ['red_light'] }
    expect(
      matchesActiveFilters(makeViolation({ type: 'speeding' }), f, NOW),
    ).toBe(false)
    expect(
      matchesActiveFilters(makeViolation({ type: 'red_light' }), f, NOW),
    ).toBe(true)
  })

  it('фильтр по району', () => {
    const f: ActiveFilters = { ...NO_FILTERS, districts: ['Ленинский'] }
    expect(
      matchesActiveFilters(makeViolation({ district: 'Кировский' }), f, NOW),
    ).toBe(false)
    expect(
      matchesActiveFilters(makeViolation({ district: 'Ленинский' }), f, NOW),
    ).toBe(true)
  })

  it('окно времени отсекает старые события', () => {
    const f: ActiveFilters = { ...NO_FILTERS, window: '15m' }
    const old = makeViolation({ timestamp: NOW - 20 * 60_000 })
    const fresh = makeViolation({ timestamp: NOW - 5 * 60_000 })
    expect(matchesActiveFilters(old, f, NOW)).toBe(false)
    expect(matchesActiveFilters(fresh, f, NOW)).toBe(true)
  })

  it('фильтры комбинируются по И', () => {
    const f: ActiveFilters = {
      types: ['speeding'],
      districts: ['Кировский'],
      window: '1h',
    }
    expect(matchesActiveFilters(makeViolation(), f, NOW)).toBe(true)
    expect(
      matchesActiveFilters(makeViolation({ district: 'Ленинский' }), f, NOW),
    ).toBe(false)
  })
})

describe('windowSince', () => {
  it('«all» → null', () => {
    expect(windowSince('all', NOW)).toBeNull()
  })
  it('«15m» → now минус 15 минут', () => {
    expect(windowSince('15m', NOW)).toBe(NOW - 15 * 60_000)
  })
})
