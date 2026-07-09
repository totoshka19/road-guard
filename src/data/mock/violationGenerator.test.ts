import { describe, expect, it } from 'vitest'
import {
  createViolation,
  generateCameras,
  randomPlate,
} from './violationGenerator'
import { cameraSchema, violationSchema } from '../types'

describe('violationGenerator', () => {
  it('генерирует камеры, проходящие Zod-схему', () => {
    const cameras = generateCameras(14)
    expect(cameras).toHaveLength(14)
    for (const camera of cameras) {
      expect(() => cameraSchema.parse(camera)).not.toThrow()
    }
  })

  it('id камер детерминированы — ссылка /camera/:id переживает перезагрузку', () => {
    expect(generateCameras(3).map((c) => c.id)).toEqual([
      'cam_1',
      'cam_2',
      'cam_3',
    ])
    // Повторная генерация (новая загрузка страницы) даёт те же id.
    expect(generateCameras(3).map((c) => c.id)).toEqual(
      generateCameras(3).map((c) => c.id),
    )
  })

  it('создаёт нарушение с существующей камеры, проходящее Zod-схему', () => {
    const cameras = generateCameras(5)
    const violation = createViolation(cameras)
    expect(() => violationSchema.parse(violation)).not.toThrow()
    expect(cameras.some((c) => c.id === violation.cameraId)).toBe(true)
  })

  it('госномер в российском формате', () => {
    const plateRe = /^[АВЕКМНОРСТУХ]\d{3}[АВЕКМНОРСТУХ]{2} (66|96|196)$/
    for (let i = 0; i < 100; i += 1) {
      expect(randomPlate()).toMatch(plateRe)
    }
  })
})
