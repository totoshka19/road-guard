import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import { selectAllCameras } from '../cameras/selectors'
import { matchesActiveFilters } from '../../lib/filters'
import {
  countByDistrict,
  countByType,
  violationsOverTime,
  type TypeCount,
} from '../../lib/stats'

/** Динамика: последние 30 минут, 15 корзин по 2 минуты. */
export const TIMELINE_SPAN_MS = 30 * 60_000
export const TIMELINE_BUCKETS = 15

const selectItems = (s: RootState) => s.violations.items
const selectFilters = (s: RootState) => s.filters
const selectNow = (s: RootState) => s.ui.now

/**
 * Нарушения, прошедшие активные фильтры. Базовый селектор для всей аналитики:
 * все производные (KPI, графики) компонуются поверх него, а `now` берётся из
 * стора — поэтому селекторы принимают только state и мемоизируются как надо.
 */
export const selectFilteredViolations = createSelector(
  [selectItems, selectFilters, selectNow],
  (items, filters, now) =>
    items.filter((v) => matchesActiveFilters(v, filters, now)),
)

export const selectCountByType = createSelector(
  [selectFilteredViolations],
  countByType,
)

export const selectCountByDistrict = createSelector(
  [selectFilteredViolations],
  countByDistrict,
)

export const selectTimeSeries = createSelector(
  [selectFilteredViolations, selectNow],
  (filtered, now) =>
    violationsOverTime(filtered, now, TIMELINE_SPAN_MS, TIMELINE_BUCKETS),
)

export interface DashboardKpis {
  total: number
  activeCameras: number
  totalCameras: number
  topType: TypeCount | null
}

export const selectKpis = createSelector(
  [selectFilteredViolations, selectCountByType, selectAllCameras],
  (filtered, byType, cameras): DashboardKpis => ({
    total: filtered.length,
    activeCameras: new Set(filtered.map((v) => v.cameraId)).size,
    totalCameras: cameras.length,
    topType: filtered.length
      ? byType.reduce((max, cur) => (cur.count > max.count ? cur : max))
      : null,
  }),
)
