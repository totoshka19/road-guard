import { createSelector } from '@reduxjs/toolkit'
import { api } from '../../app/api'
import type { RootState } from '../../app/store'
import type { Camera } from '../../data/types'

/** Стабильная ссылка на «нет данных» — иначе селектор мемоизируется впустую. */
const EMPTY_CAMERAS: Camera[] = []

/** Запись кэша RTK Query для getCameras (мемоизирована самим RTK Query). */
const selectCamerasResult = api.endpoints.getCameras.select()

export const selectAllCameras = createSelector(
  [selectCamerasResult],
  (result) => result.data ?? EMPTY_CAMERAS,
)

export const selectCamerasReady = (state: RootState): boolean =>
  selectCamerasResult(state).isSuccess

export const selectSelectedCamera = createSelector(
  [selectAllCameras, (state: RootState) => state.cameras.selectedId],
  (cameras, selectedId) =>
    cameras.find((camera) => camera.id === selectedId) ?? null,
)
