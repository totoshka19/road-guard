import { useCallback, useEffect, useRef, useState } from 'react'
import { Marker } from 'react-map-gl/maplibre'
import gsap from 'gsap'
import { useAppSelector } from '../../app/hooks'
import { VIOLATION_TYPES } from '../../data/city'
import { selectFilteredViolations } from '../../features/stats/selectors'
import type { Violation } from '../../data/types'

/** Событие считается «новым» (достойным пульса), если моложе этого возраста. */
const PULSE_MAX_AGE_MS = 4000
/** Потолок одновременных пульсов — защита от всплесков на 5× скорости. */
const MAX_ACTIVE = 24

/** Один расходящийся круг GSAP на месте нарушения; сам себя убирает. */
function PulseMarker({
  violation,
  onDone,
}: {
  violation: Violation
  onDone: () => void
}) {
  const ringRef = useRef<HTMLDivElement>(null)
  const color = VIOLATION_TYPES[violation.type].color

  useEffect(() => {
    const el = ringRef.current
    if (!el) return
    const tween = gsap.fromTo(
      el,
      { scale: 0, opacity: 0.9 },
      {
        scale: 4,
        opacity: 0,
        duration: 1.1,
        ease: 'power2.out',
        onComplete: onDone,
      },
    )
    return () => {
      tween.kill()
    }
  }, [onDone])

  return (
    <Marker longitude={violation.lng} latitude={violation.lat}>
      <div
        ref={ringRef}
        className="violation-pulse"
        style={{ borderColor: color }}
      />
    </Marker>
  )
}

/**
 * Пульс на каждое новое нарушение из потока. «Новизна» определяется по
 * возрасту события (а не по факту первого рендера), поэтому начальная
 * история из 120 seed-событий не вызывает залп пульсов на старте.
 */
export function ViolationPulses() {
  const items = useAppSelector(selectFilteredViolations)
  const pulsedRef = useRef<Set<string>>(new Set())
  const [active, setActive] = useState<Violation[]>([])

  useEffect(() => {
    const now = Date.now()
    const fresh = items.filter(
      (v) =>
        now - v.timestamp < PULSE_MAX_AGE_MS && !pulsedRef.current.has(v.id),
    )
    if (fresh.length === 0) return
    fresh.forEach((v) => pulsedRef.current.add(v.id))
    // Множество виденных id не должно расти бесконечно за долгую сессию.
    if (pulsedRef.current.size > 2000) {
      pulsedRef.current = new Set(items.map((v) => v.id))
    }
    setActive((prev) => [...prev, ...fresh].slice(-MAX_ACTIVE))
  }, [items])

  const remove = useCallback((id: string) => {
    setActive((prev) => prev.filter((v) => v.id !== id))
  }, [])

  return (
    <>
      {active.map((violation) => (
        <PulseMarker
          key={violation.id}
          violation={violation}
          onDone={() => remove(violation.id)}
        />
      ))}
    </>
  )
}
