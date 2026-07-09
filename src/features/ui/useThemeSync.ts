import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { applyTheme, storeTheme, watchSystemTheme } from '../../lib/theme'
import { selectResolvedTheme } from './selectors'
import { setSystemDark } from './uiSlice'

/**
 * Синхронизирует тему с документом и localStorage.
 *
 * Начальный `data-theme` ставит инлайн-скрипт в index.html — до первой
 * отрисовки, иначе при светлой системной теме мигнёт тёмная. Здесь мы лишь
 * поддерживаем атрибут в согласии со стором и слушаем системную настройку,
 * чтобы выбор `system` реагировал на неё без перезагрузки.
 */
export function useThemeSync(): void {
  const dispatch = useAppDispatch()
  const choice = useAppSelector((s) => s.ui.theme)
  const resolved = useAppSelector(selectResolvedTheme)

  useEffect(
    () => watchSystemTheme((dark) => dispatch(setSystemDark(dark))),
    [dispatch],
  )

  useEffect(() => {
    applyTheme(resolved)
  }, [resolved])

  useEffect(() => {
    storeTheme(choice)
  }, [choice])
}
