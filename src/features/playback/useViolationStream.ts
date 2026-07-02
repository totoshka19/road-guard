import { useEffect } from 'react'
import { dataSource } from '../../data'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { addViolation } from '../violations/violationsSlice'

/**
 * Подключает «живой» поток нарушений к стору (аналог WebSocket-подписки).
 *
 * Подписка активна только пока `playing`. Смена `speed` пересоздаёт подписку
 * с новым темпом — это и есть управление потоком с «пульта» плейбека, при
 * этом остальной UI по-прежнему знает лишь интерфейс DataSource.
 */
export function useViolationStream(): void {
  const dispatch = useAppDispatch()
  const playing = useAppSelector((s) => s.playback.playing)
  const speed = useAppSelector((s) => s.playback.speed)

  useEffect(() => {
    if (!playing) return
    const unsubscribe = dataSource.subscribe(
      (violation) => dispatch(addViolation(violation)),
      { speed },
    )
    return unsubscribe
  }, [dispatch, playing, speed])
}
