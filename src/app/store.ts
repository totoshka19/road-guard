import { configureStore } from '@reduxjs/toolkit'
import { api } from './api'
import camerasReducer from '../features/cameras/camerasSlice'
import violationsReducer from '../features/violations/violationsSlice'
import playbackReducer from '../features/playback/playbackSlice'
import filtersReducer from '../features/filters/filtersSlice'
import uiReducer from '../features/ui/uiSlice'

/**
 * Разделение ответственности в сторе:
 * — RTK Query (`api`) держит серверные данные: камеры и историю нарушений;
 * — слайсы держат клиентское состояние (выбор камеры, фильтры, плейбек)
 *   и кольцевой буфер живого потока, который приходит не по REST.
 */
export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    cameras: camerasReducer,
    violations: violationsReducer,
    playback: playbackReducer,
    filters: filtersReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
})

export type AppStore = typeof store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
