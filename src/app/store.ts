import { configureStore } from '@reduxjs/toolkit'
import camerasReducer from '../features/cameras/camerasSlice'
import violationsReducer from '../features/violations/violationsSlice'

export const store = configureStore({
  reducer: {
    cameras: camerasReducer,
    violations: violationsReducer,
  },
})

export type AppStore = typeof store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
