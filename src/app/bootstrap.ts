import { dataSource } from '../data'
import { setCameras } from '../features/cameras/camerasSlice'
import { setViolations } from '../features/violations/violationsSlice'
import type { AppStore } from './store'

/**
 * Начальная загрузка данных (аналог REST-запросов при старте):
 * камеры + история нарушений. Живой поток новых событий подключается
 * отдельно — хук useViolationStream (features/playback).
 */
export async function bootstrap(store: AppStore): Promise<void> {
  const [cameras, violations] = await Promise.all([
    dataSource.getCameras(),
    dataSource.getViolations(),
  ])
  store.dispatch(setCameras(cameras))
  store.dispatch(setViolations(violations))
}
