import type { ViolationType } from './types'

/**
 * Гео-конфигурация города (Екатеринбург): границы, районы и метаданные
 * типов нарушений. Отсюда генератор берёт правдоподобные координаты.
 */

export const CITY = {
  name: 'Екатеринбург',
  center: { lat: 56.8389, lng: 60.6057 },
  bbox: { minLat: 56.74, maxLat: 56.93, minLng: 60.48, maxLng: 60.73 },
} as const

export interface District {
  id: string
  name: string
  center: { lat: number; lng: number }
  /** Радиус разброса точек внутри района, в градусах. */
  spread: number
}

/** 7 административных районов Екатеринбурга (приближённые центры). */
export const DISTRICTS: District[] = [
  {
    id: 'verkh-isetsky',
    name: 'Верх-Исетский',
    center: { lat: 56.852, lng: 60.552 },
    spread: 0.02,
  },
  {
    id: 'zheleznodorozhny',
    name: 'Железнодорожный',
    center: { lat: 56.872, lng: 60.601 },
    spread: 0.018,
  },
  {
    id: 'kirovsky',
    name: 'Кировский',
    center: { lat: 56.842, lng: 60.653 },
    spread: 0.02,
  },
  {
    id: 'leninsky',
    name: 'Ленинский',
    center: { lat: 56.818, lng: 60.578 },
    spread: 0.017,
  },
  {
    id: 'oktyabrsky',
    name: 'Октябрьский',
    center: { lat: 56.807, lng: 60.66 },
    spread: 0.022,
  },
  {
    id: 'ordzhonikidzevsky',
    name: 'Орджоникидзевский',
    center: { lat: 56.9, lng: 60.62 },
    spread: 0.025,
  },
  {
    id: 'chkalovsky',
    name: 'Чкаловский',
    center: { lat: 56.78, lng: 60.61 },
    spread: 0.028,
  },
]

export interface ViolationTypeMeta {
  label: string
  color: string
  /** Относительная частота появления в потоке. */
  weight: number
}

export const VIOLATION_TYPES: Record<ViolationType, ViolationTypeMeta> = {
  speeding: { label: 'Превышение скорости', color: '#f43f5e', weight: 40 },
  red_light: { label: 'Проезд на красный', color: '#f59e0b', weight: 18 },
  wrong_way: { label: 'Выезд на встречную', color: '#a855f7', weight: 8 },
  no_pedestrian: { label: 'Непропуск пешехода', color: '#38bdf8', weight: 14 },
  illegal_parking: {
    label: 'Парковка в неположенном месте',
    color: '#22c55e',
    weight: 15,
  },
  shoulder_driving: {
    label: 'Движение по обочине',
    color: '#eab308',
    weight: 5,
  },
}
