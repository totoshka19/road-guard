import type { Violation, ViolationType } from '../data/types'

/** Окно времени для фильтра ленты/статистики. */
export type TimeWindow = 'all' | '15m' | '1h'

export const TIME_WINDOWS: readonly { key: TimeWindow; label: string }[] = [
  { key: 'all', label: 'Всё время' },
  { key: '15m', label: '15 мин' },
  { key: '1h', label: '1 час' },
]

/** Активные фильтры. Пустой массив типов/районов означает «все». */
export interface ActiveFilters {
  types: ViolationType[]
  districts: string[]
  window: TimeWindow
}

const WINDOW_MS: Record<Exclude<TimeWindow, 'all'>, number> = {
  '15m': 15 * 60_000,
  '1h': 60 * 60_000,
}

/** Нижняя граница окна (epoch ms) или null для «всё время». */
export function windowSince(window: TimeWindow, now: number): number | null {
  return window === 'all' ? null : now - WINDOW_MS[window]
}

/** Проходит ли нарушение активные фильтры (тип, район, окно времени). */
export function matchesActiveFilters(
  violation: Violation,
  filters: ActiveFilters,
  now: number,
): boolean {
  if (filters.types.length > 0 && !filters.types.includes(violation.type)) {
    return false
  }
  if (
    filters.districts.length > 0 &&
    !filters.districts.includes(violation.district)
  ) {
    return false
  }
  const since = windowSince(filters.window, now)
  return since === null || violation.timestamp >= since
}
