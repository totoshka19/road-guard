import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { DISTRICTS, VIOLATION_TYPES } from '../../data/city'
import { TIME_WINDOWS } from '../../lib/filters'
import type { ViolationType } from '../../data/types'
import {
  resetFilters,
  setWindow,
  toggleDistrict,
  toggleType,
} from './filtersSlice'

const VIOLATION_TYPE_KEYS = Object.keys(VIOLATION_TYPES) as ViolationType[]

export function FilterControls() {
  const dispatch = useAppDispatch()
  const filters = useAppSelector((s) => s.filters)
  const hasActive =
    filters.types.length > 0 ||
    filters.districts.length > 0 ||
    filters.window !== 'all'

  return (
    <div className="filters">
      <div className="filters__head">
        <h3 className="filters__title">Фильтры</h3>
        {hasActive && (
          <button
            type="button"
            className="filters__reset"
            onClick={() => dispatch(resetFilters())}
          >
            Сбросить
          </button>
        )}
      </div>

      <p className="filters__label">Тип нарушения</p>
      <div className="chips">
        {VIOLATION_TYPE_KEYS.map((type) => {
          const active = filters.types.includes(type)
          return (
            <button
              key={type}
              type="button"
              className={active ? 'chip chip--active' : 'chip'}
              style={
                active
                  ? { borderColor: VIOLATION_TYPES[type].color }
                  : undefined
              }
              onClick={() => dispatch(toggleType(type))}
              aria-pressed={active}
            >
              <span
                className="chip__dot"
                style={{ background: VIOLATION_TYPES[type].color }}
                aria-hidden
              />
              {VIOLATION_TYPES[type].label}
            </button>
          )
        })}
      </div>

      <p className="filters__label">Район</p>
      <div className="chips">
        {DISTRICTS.map((district) => {
          const active = filters.districts.includes(district.name)
          return (
            <button
              key={district.id}
              type="button"
              className={active ? 'chip chip--active' : 'chip'}
              onClick={() => dispatch(toggleDistrict(district.name))}
              aria-pressed={active}
            >
              {district.name}
            </button>
          )
        })}
      </div>

      <p className="filters__label">Период</p>
      <div className="segmented">
        {TIME_WINDOWS.map((w) => (
          <button
            key={w.key}
            type="button"
            className={
              filters.window === w.key
                ? 'segmented__btn segmented__btn--active'
                : 'segmented__btn'
            }
            onClick={() => dispatch(setWindow(w.key))}
            aria-pressed={filters.window === w.key}
          >
            {w.label}
          </button>
        ))}
      </div>
    </div>
  )
}
