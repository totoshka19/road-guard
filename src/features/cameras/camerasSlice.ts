import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Camera } from '../../data/types'

export interface CamerasState {
  items: Camera[]
  status: 'idle' | 'ready'
}

const initialState: CamerasState = {
  items: [],
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
  },
})

export const { setCameras } = camerasSlice.actions
export default camerasSlice.reducer
