import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

/**
 * Клиентское состояние камер — только выбор на карте.
 * Сам список камер серверный и живёт в кэше RTK Query (`api.getCameras`),
 * поэтому дублировать его в слайсе не нужно.
 */
export interface CamerasState {
  /** id выбранной на карте камеры (для попапа/подсветки) или null. */
  selectedId: string | null
}

const initialState: CamerasState = {
  selectedId: null,
}

const camerasSlice = createSlice({
  name: 'cameras',
  initialState,
  reducers: {
    selectCamera(state, action: PayloadAction<string | null>) {
      state.selectedId = action.payload
    },
  },
})

export const { selectCamera } = camerasSlice.actions
export default camerasSlice.reducer
