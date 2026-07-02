import type { Camera, Violation, ViolationFilters } from './types'

/**
 * Единый интерфейс источника данных. Весь UI работает через него и
 * не знает, откуда приходят данные (мок сейчас / реальный бэкенд позже).
 * Чтобы подключить сервер — достаточно реализовать этот интерфейс
 * (fetch для REST + WebSocket для потока) и подменить в одной точке.
 */
export interface DataSource {
  /** Список камер (REST-запрос). */
  getCameras(): Promise<Camera[]>
  /** История нарушений с фильтрами (REST-запрос). */
  getViolations(filters?: ViolationFilters): Promise<Violation[]>
  /**
   * Подписка на поток новых нарушений (аналог WebSocket).
   * Возвращает функцию отписки.
   */
  subscribe(onViolation: (violation: Violation) => void): () => void
}
