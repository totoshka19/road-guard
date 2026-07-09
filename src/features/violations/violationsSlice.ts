import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { api } from '../../app/api'
import type { Violation } from '../../data/types'

/** Размер кольцевого буфера: храним последние N событий, старые вытесняем. */
export const MAX_VIOLATIONS = 500

export interface ViolationsState {
  items: Violation[] // новейшие в начале
}

const initialState: ViolationsState = {
  items: [],
}

/** История с «сервера» → буфер: новейшие первыми, обрезано до MAX_VIOLATIONS. */
export function toBuffer(history: Violation[]): Violation[] {
  return [...history]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, MAX_VIOLATIONS)
}

const violationsSlice = createSlice({
  name: 'violations',
  initialState,
  reducers: {
    /** Новое событие из потока — в начало, с вытеснением старых. */
    addViolation(state, action: PayloadAction<Violation>) {
      state.items.unshift(action.payload)
      if (state.items.length > MAX_VIOLATIONS) {
        state.items.pop()
      }
    },
  },
  extraReducers: (builder) => {
    /**
     * Начальная история приезжает REST-запросом RTK Query — ею засеиваем
     * буфер. Дальше он живёт только от потока (addViolation).
     *
     * Матчер привязан к `getViolations`, поэтому ответ `getCameraViolations`
     * (страница камеры) сюда не попадёт и буфер не затрёт.
     */
    builder.addMatcher(
      api.endpoints.getViolations.matchFulfilled,
      (state, action) => {
        state.items = toBuffer(action.payload)
      },
    )
  },
})

export const { addViolation } = violationsSlice.actions
export default violationsSlice.reducer
