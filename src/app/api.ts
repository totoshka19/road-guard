import { createApi, type BaseQueryFn } from '@reduxjs/toolkit/query/react'
import { dataSource } from '../data'
import type { Camera, Violation, ViolationFilters } from '../data/types'

/**
 * Описание запроса к источнику данных — аналог пары «путь + query-параметры»
 * у REST. Именно это RTK Query передаст в baseQuery.
 */
export type DataSourceQuery =
  | { resource: 'cameras' }
  | { resource: 'violations'; filters?: ViolationFilters }

export interface DataSourceError {
  message: string
}

/**
 * baseQuery поверх интерфейса `DataSource`.
 *
 * RTK Query не привязан к fetch: baseQuery — это просто функция
 * «запрос → { data } | { error }». Поэтому кэш, хуки и состояния загрузки
 * достаются нам бесплатно, а транспорт остаётся за абстракцией: сегодня
 * это `MockDataSource`, завтра — `RealDataSource` поверх fetch. Ни один
 * эндпоинт и ни один компонент при такой подмене не меняется.
 */
const dataSourceBaseQuery: BaseQueryFn<
  DataSourceQuery,
  unknown,
  DataSourceError
> = async (query) => {
  try {
    const data =
      query.resource === 'cameras'
        ? await dataSource.getCameras()
        : await dataSource.getViolations(query.filters)
    return { data }
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error ? error.message : 'Не удалось получить данные',
      },
    }
  }
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: dataSourceBaseQuery,
  endpoints: (build) => ({
    /** Список камер: общий кэш для карты и страницы камеры. */
    getCameras: build.query<Camera[], void>({
      query: () => ({ resource: 'cameras' }),
    }),

    /**
     * Начальная история нарушений для дашборда. Её `matchFulfilled`
     * засеивает кольцевой буфер (см. violationsSlice).
     */
    getViolations: build.query<Violation[], void>({
      query: () => ({ resource: 'violations' }),
    }),

    /**
     * История одной камеры. Отдельный эндпоинт, а не аргумент к
     * `getViolations`, сознательно: у каждого своя запись кэша, и матчер
     * буфера физически не может поймать ответ по одной камере.
     */
    getCameraViolations: build.query<Violation[], string>({
      query: (cameraId) => ({ resource: 'violations', filters: { cameraId } }),
    }),
  }),
})

export const {
  useGetCamerasQuery,
  useGetViolationsQuery,
  useGetCameraViolationsQuery,
} = api
