import { configureStore } from '@reduxjs/toolkit'
import camerasReducer from '../features/cameras/camerasSlice'
import violationsReducer from '../features/violations/violationsSlice'
import playbackReducer from '../features/playback/playbackSlice'
import filtersReducer from '../features/filters/filtersSlice'
import uiReducer from '../features/ui/uiSlice'

export const store = configureStore({
  reducer: {
    cameras: camerasReducer,
    violations: violationsReducer,
    playback: playbackReducer,
    filters: filtersReducer,
    ui: uiReducer,
  },
})

export type AppStore = typeof store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
