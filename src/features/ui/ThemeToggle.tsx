import { useAppDispatch, useAppSelector } from '../../app/hooks'
import type { ThemeChoice } from '../../lib/theme'
import { setTheme } from './uiSlice'

/** Кнопка перебирает три состояния по кругу. */
const NEXT_CHOICE: Record<ThemeChoice, ThemeChoice> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
}

const CHOICE_META: Record<ThemeChoice, { icon: string; label: string }> = {
  system: { icon: '◐', label: 'как в системе' },
  light: { icon: '☀', label: 'светлая' },
  dark: { icon: '☾', label: 'тёмная' },
}

export function ThemeToggle() {
  const dispatch = useAppDispatch()
  const choice = useAppSelector((s) => s.ui.theme)
  const meta = CHOICE_META[choice]
  const next = CHOICE_META[NEXT_CHOICE[choice]]

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => dispatch(setTheme(NEXT_CHOICE[choice]))}
      title={`Тема: ${meta.label}. Переключить на: ${next.label}`}
      aria-label={`Тема: ${meta.label}. Переключить на: ${next.label}`}
    >
      <span aria-hidden>{meta.icon}</span>
    </button>
  )
}
