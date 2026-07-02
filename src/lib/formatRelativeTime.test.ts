import { describe, expect, it } from 'vitest'
import { formatRelativeTime } from './formatRelativeTime'

const NOW = 1_700_000_000_000

describe('formatRelativeTime', () => {
  it('«сейчас» для событий свежее 5 секунд', () => {
    expect(formatRelativeTime(NOW - 2_000, NOW)).toBe('сейчас')
  })

  it('секунды', () => {
    expect(formatRelativeTime(NOW - 30_000, NOW)).toBe('30 с')
  })

  it('минуты', () => {
    expect(formatRelativeTime(NOW - 5 * 60_000, NOW)).toBe('5 мин')
  })

  it('часы', () => {
    expect(formatRelativeTime(NOW - 3 * 3_600_000, NOW)).toBe('3 ч')
  })

  it('время из будущего не даёт отрицательных значений', () => {
    expect(formatRelativeTime(NOW + 10_000, NOW)).toBe('сейчас')
  })
})
