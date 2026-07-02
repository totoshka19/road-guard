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
