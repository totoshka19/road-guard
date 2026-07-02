import { z } from 'zod'

/**
 * Доменная модель RoadGuard.
 * Zod-схемы — единственный источник истины: TS-типы выводятся из них
 * через z.infer, поэтому валидация и статические типы не расходятся.
 */

export const violationTypeSchema = z.enum([
  'speeding', // превышение скорости
  'red_light', // проезд на красный
  'wrong_way', // выезд на встречную
  'no_pedestrian', // непропуск пешехода
  'illegal_parking', // парковка в неположенном месте
  'shoulder_driving', // движение по обочине
])
export type ViolationType = z.infer<typeof violationTypeSchema>

export const cameraSchema = z.object({
  id: z.string(),
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  district: z.string(),
})
export type Camera = z.infer<typeof cameraSchema>

export const violationSchema = z.object({
  id: z.string(),
  cameraId: z.string(),
  type: violationTypeSchema,
  plate: z.string(), // госномер
  lat: z.number(),
  lng: z.number(),
  district: z.string(),
  timestamp: z.number(), // epoch ms
})
export type Violation = z.infer<typeof violationSchema>

/** Фильтры выборки нарушений (используются на этапе фильтров). */
export interface ViolationFilters {
  types?: ViolationType[]
  districts?: string[]
  since?: number // epoch ms, включительно
  until?: number // epoch ms, включительно
}
