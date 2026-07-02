import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface UiState {
  /** Показывать тепловую карту нарушений вместо точек. */
  heatmap: boolean
  /**
   * Общие «сейчас» для фильтров по времени и динамики. Тикают из одного
   * места (DashboardPage) — так селекторы reselect считаются один раз на тик.
   */
  now: number
}

const initialState: UiState = {
  heatmap: false,
  now: Date.now(),
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleHeatmap(state) {
      state.heatmap = !state.heatmap
    },
    tick(state, action: PayloadAction<number>) {
      state.now = action.payload
    },
  },
})

export const { toggleHeatmap, tick } = uiSlice.actions
export default uiSlice.reducer
