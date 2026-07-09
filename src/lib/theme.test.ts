import { describe, expect, it } from 'vitest'
import indexHtml from '../../index.html?raw'
import {
  THEME_STORAGE_KEY,
  resolveTheme,
  type ResolvedTheme,
  type ThemeChoice,
} from './theme'

describe('resolveTheme', () => {
  it('явный выбор игнорирует системную настройку', () => {
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })

  it('system следует за системной настройкой', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
  })
})

/**
 * Инлайн-скрипт из index.html повторяет логику theme.ts — иначе тема мигала бы
 * до загрузки бандла. Дублирование вынужденное, поэтому его согласованность
 * (и ключ хранилища, и правило разрешения) закреплена тестом: скрипт достаётся
 * из настоящего index.html и исполняется с подставными localStorage/matchMedia.
 */
function runInlineThemeScript(
  stored: string | null,
  systemDark: boolean,
): string | undefined {
  const script = indexHtml.match(/<script>([\s\S]*?)<\/script>/)
  if (!script) throw new Error('Инлайн-скрипт темы не найден в index.html')

  const documentElement = { dataset: {} as Record<string, string> }
  const run = new Function('localStorage', 'matchMedia', 'document', script[1])
  run(
    { getItem: (key: string) => (key === THEME_STORAGE_KEY ? stored : null) },
    (query: string) => ({
      matches: query.includes('dark') ? systemDark : false,
    }),
    { documentElement },
  )
  return documentElement.dataset.theme
}

describe('инлайн-скрипт темы в index.html', () => {
  const cases: { stored: string | null; choice: ThemeChoice }[] = [
    { stored: null, choice: 'system' },
    { stored: 'мусор', choice: 'system' },
    { stored: 'light', choice: 'light' },
    { stored: 'dark', choice: 'dark' },
  ]

  for (const { stored, choice } of cases) {
    for (const systemDark of [true, false]) {
      it(`stored=${stored ?? 'нет'}, системная тёмная=${systemDark} — как resolveTheme`, () => {
        const expected: ResolvedTheme = resolveTheme(choice, systemDark)
        expect(runInlineThemeScript(stored, systemDark)).toBe(expected)
      })
    }
  }
})
