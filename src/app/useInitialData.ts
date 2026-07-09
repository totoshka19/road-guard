import { useCallback } from 'react'
import { useGetCamerasQuery, useGetViolationsQuery } from './api'

/** Ошибки baseQuery приходят как { message }, но RTK Query типизирует их шире. */
function errorMessage(error: unknown): string | null {
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message
  }
  return null
}

export interface InitialDataStatus {
  isLoading: boolean
  isError: boolean
  errorMessage: string | null
  retry: () => void
}

/**
 * Статус двух начальных REST-запросов (камеры + история) как одного целого:
 * панель не может показать ни KPI, ни графики, пока не приехало и то и другое.
 *
 * Хук можно звать из нескольких компонентов — RTK Query отдаёт им одну и ту же
 * запись кэша, лишнего запроса не будет.
 */
export function useInitialData(): InitialDataStatus {
  const cameras = useGetCamerasQuery()
  const violations = useGetViolationsQuery()

  const retry = useCallback(() => {
    void cameras.refetch()
    void violations.refetch()
  }, [cameras, violations])

  return {
    isLoading: cameras.isLoading || violations.isLoading,
    isError: cameras.isError || violations.isError,
    errorMessage: errorMessage(cameras.error) ?? errorMessage(violations.error),
    retry,
  }
}
