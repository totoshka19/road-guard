import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it } from 'vitest'
import reducer, {
  MAX_VIOLATIONS,
  addViolation,
  toBuffer,
} from './violationsSlice'
import { api } from '../../app/api'
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

/** Стор, повторяющий боевую сборку в части «RTK Query + буфер». */
function makeStore() {
  return configureStore({
    reducer: { violations: reducer, [api.reducerPath]: api.reducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
  })
}

describe('violationsSlice', () => {
  it('добавляет новое событие в начало (новейшее первым)', () => {
    let state = reducer(undefined, addViolation(makeViolation(1)))
    state = reducer(state, addViolation(makeViolation(2)))
    expect(state.items.map((v) => v.timestamp)).toEqual([2, 1])
  })

  it('не превышает размер буфера и вытесняет старые события', () => {
    let state = reducer(undefined, addViolation(makeViolation(0)))
    const total = MAX_VIOLATIONS + 50
    for (let i = 1; i < total; i += 1) {
      state = reducer(state, addViolation(makeViolation(i)))
    }
    expect(state.items).toHaveLength(MAX_VIOLATIONS)
    expect(state.items[0].timestamp).toBe(total - 1) // новейшее
    expect(state.items.at(-1)?.timestamp).toBe(total - MAX_VIOLATIONS) // старейшее из оставшихся
  })
})

describe('toBuffer', () => {
  it('сортирует по времени (новейшие первыми) и обрезает до буфера', () => {
    const many = Array.from({ length: MAX_VIOLATIONS + 20 }, (_, i) =>
      makeViolation(i),
    )
    const buffer = toBuffer(many)
    expect(buffer).toHaveLength(MAX_VIOLATIONS)
    expect(buffer[0].timestamp).toBe(MAX_VIOLATIONS + 19)
  })
})

describe('засев буфера из RTK Query', () => {
  it('getViolations наполняет буфер историей', async () => {
    const store = makeStore()
    await store.dispatch(api.endpoints.getViolations.initiate())

    const { items } = store.getState().violations
    expect(items).toHaveLength(MAX_VIOLATIONS)
    expect(items[0].timestamp).toBeGreaterThanOrEqual(items[1].timestamp)
  })

  it('getCameraViolations не затирает буфер', async () => {
    const store = makeStore()
    await store.dispatch(api.endpoints.getViolations.initiate())
    const before = store.getState().violations.items

    const cameraId = before[0].cameraId
    const result = await store.dispatch(
      api.endpoints.getCameraViolations.initiate(cameraId),
    )

    // Запрос отработал и вернул события только этой камеры…
    expect(result.data?.length).toBeGreaterThan(0)
    expect(result.data?.every((v) => v.cameraId === cameraId)).toBe(true)
    // …а общий буфер остался нетронутым.
    expect(store.getState().violations.items).toBe(before)
  })
})
