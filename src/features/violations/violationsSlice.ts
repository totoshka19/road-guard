import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Violation } from '../../data/types'

/** Размер кольцевого буфера: храним последние N событий, старые вытесняем. */
export const MAX_VIOLATIONS = 500

export interface ViolationsState {
  items: Violation[] // новейшие в начале
}

const initialState: ViolationsState = {
  items: [],
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
    /** Начальная история: сортируем (новейшие первыми) и обрезаем до буфера. */
    setViolations(state, action: PayloadAction<Violation[]>) {
      state.items = [...action.payload]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, MAX_VIOLATIONS)
    },
    clearViolations(state) {
      state.items = []
    },
  },
})

export const { addViolation, setViolations, clearViolations } =
  violationsSlice.actions
export default violationsSlice.reducer
