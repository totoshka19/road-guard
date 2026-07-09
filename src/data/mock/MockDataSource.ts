import type { DataSource, StreamOptions } from '../DataSource'
import type { Camera, Violation, ViolationFilters } from '../types'
import { createViolation, generateCameras } from './violationGenerator'

const CAMERA_COUNT = 60
const SEED_HISTORY = 1800
const SEED_WINDOW_MS = 6 * 60 * 60 * 1000 // события за последние 6 часов
/** Потолок «серверной» истории: за долгую сессию она не должна расти вечно. */
const HISTORY_CAP = 5000

// Параметры «живости» потока.
const BASE_INTERVAL_MS = 1500
const JITTER = 0.6 // ±60% к интервалу
const BURST_CHANCE = 0.15 // шанс всплеска
const BURST_SIZE = 4

function matchesFilters(v: Violation, f: ViolationFilters): boolean {
  return (
    (f.cameraId === undefined || v.cameraId === f.cameraId) &&
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

  /**
   * «Сервер» сохраняет отданное в поток событие: иначе REST-запрос истории
   * (например, по одной камере) не увидел бы того, что уже показала лента.
   */
  private record(violation: Violation): void {
    this.history.push(violation)
    if (this.history.length > HISTORY_CAP) {
      this.history.splice(0, this.history.length - HISTORY_CAP)
    }
  }

  subscribe(
    onViolation: (violation: Violation) => void,
    options: StreamOptions = {},
  ): () => void {
    const speed = options.speed && options.speed > 0 ? options.speed : 1
    let stopped = false
    let timer: ReturnType<typeof setTimeout>

    const tick = () => {
      if (stopped) return
      const burst = Math.random() < BURST_CHANCE ? BURST_SIZE : 1
      for (let i = 0; i < burst; i += 1) {
        const violation = createViolation(this.cameras)
        this.record(violation)
        onViolation(violation)
      }
      // Быстрее поток — короче интервал между событиями.
      const delay =
        (BASE_INTERVAL_MS * (1 + (Math.random() * 2 - 1) * JITTER)) / speed
      timer = setTimeout(tick, delay)
    }

    timer = setTimeout(tick, BASE_INTERVAL_MS / speed)

    return () => {
      stopped = true
      clearTimeout(timer)
    }
  }
}
