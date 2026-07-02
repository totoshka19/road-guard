import { DISTRICTS, VIOLATION_TYPES } from '../data/city'
import type { Violation, ViolationType } from '../data/types'

/** Разбивка по типу нарушения (все типы, в порядке VIOLATION_TYPES). */
export interface TypeCount {
  type: ViolationType
  label: string
  color: string
  count: number
}

export function countByType(violations: Violation[]): TypeCount[] {
  const counts = new Map<ViolationType, number>()
  for (const v of violations) {
    counts.set(v.type, (counts.get(v.type) ?? 0) + 1)
  }
  return (Object.keys(VIOLATION_TYPES) as ViolationType[]).map((type) => ({
    type,
    label: VIOLATION_TYPES[type].label,
    color: VIOLATION_TYPES[type].color,
    count: counts.get(type) ?? 0,
  }))
}

/** Разбивка по району (все районы, в порядке DISTRICTS). */
export interface DistrictCount {
  district: string
  count: number
}

export function countByDistrict(violations: Violation[]): DistrictCount[] {
  const counts = new Map<string, number>()
  for (const v of violations) {
    counts.set(v.district, (counts.get(v.district) ?? 0) + 1)
  }
  return DISTRICTS.map((d) => ({
    district: d.name,
    count: counts.get(d.name) ?? 0,
  }))
}

/** Одна корзина временного ряда. */
export interface TimeBucket {
  from: number
  count: number
}

/**
 * Динамика нарушений: интервал [now - spanMs, now] нарезается на `bucketCount`
 * равных корзин, считаем попадания. События вне интервала игнорируются.
 */
export function violationsOverTime(
  violations: Violation[],
  now: number,
  spanMs: number,
  bucketCount: number,
): TimeBucket[] {
  const start = now - spanMs
  const width = spanMs / bucketCount
  const buckets: TimeBucket[] = Array.from({ length: bucketCount }, (_, i) => ({
    from: start + i * width,
    count: 0,
  }))
  for (const v of violations) {
    if (v.timestamp < start || v.timestamp > now) continue
    const idx = Math.min(
      bucketCount - 1,
      Math.floor((v.timestamp - start) / width),
    )
    if (idx >= 0) buckets[idx].count += 1
  }
  return buckets
}
