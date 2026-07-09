/** Выбор пользователя. `system` — следовать настройке ОС. */
export type ThemeChoice = 'system' | 'light' | 'dark'
/** Тема, которая реально применена к документу. */
export type ResolvedTheme = 'light' | 'dark'

/**
 * Ключ должен совпадать с инлайн-скриптом в index.html: тот ставит
 * data-theme до первой отрисовки, чтобы не было вспышки чужой темы.
 */
export const THEME_STORAGE_KEY = 'roadguard:theme'

const DARK_QUERY = '(prefers-color-scheme: dark)'

/**
 * Чистое правило разрешения темы. Выбор `system` раскрывается в текущую
 * системную настройку; остальные значения говорят сами за себя.
 */
export function resolveTheme(
  choice: ThemeChoice,
  systemDark: boolean,
): ResolvedTheme {
  if (choice === 'system') return systemDark ? 'dark' : 'light'
  return choice
}

export function readStoredTheme(): ThemeChoice {
  if (typeof localStorage === 'undefined') return 'system'
  const raw = localStorage.getItem(THEME_STORAGE_KEY)
  return raw === 'light' || raw === 'dark' ? raw : 'system'
}

/** `system` не храним: отсутствие ключа и означает «как в системе». */
export function storeTheme(choice: ThemeChoice): void {
  if (typeof localStorage === 'undefined') return
  if (choice === 'system') localStorage.removeItem(THEME_STORAGE_KEY)
  else localStorage.setItem(THEME_STORAGE_KEY, choice)
}

export function systemPrefersDark(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia(DARK_QUERY).matches
}

/** Подписка на смену системной темы. Возвращает функцию отписки. */
export function watchSystemTheme(
  onChange: (dark: boolean) => void,
): () => void {
  if (typeof matchMedia === 'undefined') return () => {}
  const query = matchMedia(DARK_QUERY)
  const handler = (event: MediaQueryListEvent) => onChange(event.matches)
  query.addEventListener('change', handler)
  return () => query.removeEventListener('change', handler)
}

/** Вся тема переключается одним атрибутом на <html> — см. global.css. */
export function applyTheme(resolved: ResolvedTheme): void {
  document.documentElement.dataset.theme = resolved
}
