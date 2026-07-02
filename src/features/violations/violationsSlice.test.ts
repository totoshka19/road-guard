import { describe, expect, it } from 'vitest'
import reducer, {
  MAX_VIOLATIONS,
  addViolation,
  setViolations,
} from './violationsSlice'
import type { Violation } from '../../data/types'

function makeViolation(timestamp: number): Violation {
  return {
    id: `v${timestamp}`,
    cameraId: 'cam_1',
    type: 'speeding',
    plate: 'А123ВС 96',
    lat: 56.8,
    lng: 60.6,
    district: 'Кировский',
    timestamp,
  }
}

describe('violationsSlice', () => {
  it('добавляет новое событие в начало (новейшее первым)', () => {
    let state = reducer(undefined, addViolation(makeViolation(1)))
    state = reducer(state, addViolation(makeViolation(2)))
    expect(state.items.map((v) => v.timestamp)).toEqual([2, 1])
  })

  it('не превышает размер буфера и вытесняет старые события', () => {
    let state = reducer(undefined, setViolations([]))
    const total = MAX_VIOLATIONS + 50
    for (let i = 0; i < total; i += 1) {
      state = reducer(state, addViolation(makeViolation(i)))
    }
    expect(state.items).toHaveLength(MAX_VIOLATIONS)
    expect(state.items[0].timestamp).toBe(total - 1) // новейшее
    expect(state.items.at(-1)?.timestamp).toBe(total - MAX_VIOLATIONS) // старейшее из оставшихся
  })

  it('setViolations сортирует по времени и обрезает до буфера', () => {
    const many = Array.from({ length: MAX_VIOLATIONS + 20 }, (_, i) =>
      makeViolation(i),
    )
    const state = reducer(undefined, setViolations(many))
    expect(state.items).toHaveLength(MAX_VIOLATIONS)
    expect(state.items[0].timestamp).toBe(MAX_VIOLATIONS + 19)
  })
})
