import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Camera } from '../../data/types'

export interface CamerasState {
  items: Camera[]
  /** id выбранной на карте камеры (для попапа/подсветки) или null. */
  selectedId: string | null
  status: 'idle' | 'ready'
}

const initialState: CamerasState = {
  items: [],
  selectedId: null,
  status: 'idle',
}

const camerasSlice = createSlice({
  name: 'cameras',
  initialState,
  reducers: {
    setCameras(state, action: PayloadAction<Camera[]>) {
      state.items = action.payload
      state.status = 'ready'
    },
    selectCamera(state, action: PayloadAction<string | null>) {
      state.selectedId = action.payload
    },
  },
})

export const { setCameras, selectCamera } = camerasSlice.actions
export default camerasSlice.reducer
