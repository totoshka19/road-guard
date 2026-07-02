import type { DataSource } from '../DataSource'
import type { Camera, Violation, ViolationFilters } from '../types'
import { createViolation, generateCameras } from './violationGenerator'

const CAMERA_COUNT = 60
const SEED_HISTORY = 120
const SEED_WINDOW_MS = 2 * 60 * 60 * 1000 // события за последние 2 часа

// Параметры «живости» потока.
const BASE_INTERVAL_MS = 1500
const JITTER = 0.6 // ±60% к интервалу
const BURST_CHANCE = 0.15 // шанс всплеска
const BURST_SIZE = 4

function matchesFilters(v: Violation, f: ViolationFilters): boolean {
  return (
    (!f.types || f.types.includes(v.type)) &&
    (!f.districts || f.districts.includes(v.district)) &&
    (f.since === undefined || v.timestamp >= f.since) &&
    (f.until === undefined || v.timestamp <= f.until)
  )
}

/**
 * Симуляция источника данных. Имитирует поведение REST + WebSocket:
 * камеры и история отдаются как «запрос», subscribe эмитит поток
 * событий с джиттером и всплесками — как настоящий WS-клиент.
 * Код обработки real-time пишется ровно такой же, как для сервера.
 */
export class MockDataSource implements DataSource {
  private readonly cameras: Camera[]
  private readonly history: Violation[]

  constructor() {
    this.cameras = generateCameras(CAMERA_COUNT)
    const now = Date.now()
    this.history = Array.from({ length: SEED_HISTORY }, () =>
      createViolation(
        this.cameras,
        now - Math.floor(Math.random() * SEED_WINDOW_MS),
      ),
    ).sort((a, b) => a.timestamp - b.timestamp)
  }

  getCameras(): Promise<Camera[]> {
    return Promise.resolve(this.cameras)
  }

  getViolations(filters: ViolationFilters = {}): Promise<Violation[]> {
    return Promise.resolve(
      this.history.filter((v) => matchesFilters(v, filters)),
    )
  }

  subscribe(onViolation: (violation: Violation) => void): () => void {
    let stopped = false
    let timer: ReturnType<typeof setTimeout>

    const tick = () => {
      if (stopped) return
      const burst = Math.random() < BURST_CHANCE ? BURST_SIZE : 1
      for (let i = 0; i < burst; i += 1) {
        onViolation(createViolation(this.cameras))
      }
      const delay = BASE_INTERVAL_MS * (1 + (Math.random() * 2 - 1) * JITTER)
      timer = setTimeout(tick, delay)
    }

    timer = setTimeout(tick, BASE_INTERVAL_MS)

    return () => {
      stopped = true
      clearTimeout(timer)
    }
  }
}
