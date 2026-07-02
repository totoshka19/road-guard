import { DISTRICTS, VIOLATION_TYPES } from '../city'
import type { Camera, Violation, ViolationType } from '../types'

/**
 * Чистые функции генерации правдоподобных данных: камеры, госномера,
 * нарушения. Без таймеров — тайминг потока живёт в MockDataSource.
 */

// Буквы, разрешённые в госномерах РФ (визуально совпадают с латиницей).
const PLATE_LETTERS = 'АВЕКМНОРСТУХ'.split('')
// Коды региона: Свердловская область.
const REGION_CODES = ['66', '96', '196']

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

/** Госномер вида «А123ВС 196». */
export function randomPlate(): string {
  const letter = () => pick(PLATE_LETTERS)
  const digits = String(Math.floor(randomInRange(1, 1000))).padStart(3, '0')
  return `${letter()}${digits}${letter()}${letter()} ${pick(REGION_CODES)}`
}

// Пул типов, развёрнутый по весам: чаще встречаются частые нарушения.
const WEIGHTED_TYPES: ViolationType[] = Object.entries(VIOLATION_TYPES).flatMap(
  ([type, meta]) =>
    Array<ViolationType>(meta.weight).fill(type as ViolationType),
)

export function randomViolationType(): ViolationType {
  return pick(WEIGHTED_TYPES)
}

let seq = 0
function nextId(prefix: string): string {
  seq += 1
  return `${prefix}_${seq.toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`
}

/** Камеры, равномерно распределённые по районам города. */
export function generateCameras(count: number): Camera[] {
  return Array.from({ length: count }, (_, i) => {
    const district = DISTRICTS[i % DISTRICTS.length]
    return {
      id: nextId('cam'),
      name: `Камера №${i + 1}`,
      lat:
        district.center.lat + randomInRange(-district.spread, district.spread),
      lng:
        district.center.lng + randomInRange(-district.spread, district.spread),
      district: district.name,
    }
  })
}

/** Нарушение «с» случайной камеры (точка чуть рядом с камерой). */
export function createViolation(
  cameras: Camera[],
  timestamp: number = Date.now(),
): Violation {
  const camera = pick(cameras)
  return {
    id: nextId('viol'),
    cameraId: camera.id,
    type: randomViolationType(),
    plate: randomPlate(),
    lat: camera.lat + randomInRange(-0.0008, 0.0008),
    lng: camera.lng + randomInRange(-0.0008, 0.0008),
    district: camera.district,
    timestamp,
  }
}
