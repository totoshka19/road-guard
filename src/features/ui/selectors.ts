import type { RootState } from '../../app/store'
import { resolveTheme, type ResolvedTheme } from '../../lib/theme'

/**
 * Применённая тема — производная от выбора и системной настройки.
 * Возвращает строку, поэтому мемоизация не нужна.
 */
export const selectResolvedTheme = (state: RootState): ResolvedTheme =>
  resolveTheme(state.ui.theme, state.ui.systemDark)
