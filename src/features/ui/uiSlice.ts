import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import {
  readStoredTheme,
  systemPrefersDark,
  type ThemeChoice,
} from '../../lib/theme'

export interface UiState {
  /** Показывать тепловую карту нарушений вместо точек. */
  heatmap: boolean
  /**
   * Общие «сейчас» для фильтров по времени и динамики. Тикают из одного
   * места (RootLayout) — так селекторы reselect считаются один раз на тик.
   */
  now: number
  /** Выбор пользователя, а не применённая тема: результат — производная. */
  theme: ThemeChoice
  /** Текущая системная настройка; обновляется подпиской на matchMedia. */
  systemDark: boolean
}

const initialState: UiState = {
  heatmap: false,
  now: Date.now(),
  theme: readStoredTheme(),
  systemDark: systemPrefersDark(),
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
    setTheme(state, action: PayloadAction<ThemeChoice>) {
      state.theme = action.payload
    },
    setSystemDark(state, action: PayloadAction<boolean>) {
      state.systemDark = action.payload
    },
  },
})

export const { toggleHeatmap, tick, setTheme, setSystemDark } = uiSlice.actions
export default uiSlice.reducer
