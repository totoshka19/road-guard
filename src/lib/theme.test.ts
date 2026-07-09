import { describe, expect, it } from 'vitest'
import indexHtml from '../../index.html?raw'
import {
  THEME_COLORS,
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

interface InlineResult {
  theme: string | undefined
  themeColor: string | undefined
}

/**
 * Инлайн-скрипт из index.html повторяет логику theme.ts — иначе тема мигала бы,
 * а хром браузера красился не в тот цвет, пока грузится бандл. Дублирование
 * вынужденное, поэтому его согласованность закреплена тестом: скрипт достаётся
 * из настоящего index.html и исполняется с подставными зависимостями.
 *
 * `new Function` здесь сознателен. Вход — файл самого проекта, а не внешние
 * данные, и код не попадает в прод. Альтернатива (вынести логику в общую чистую
 * функцию) убрала бы динамический вызов, но и смысл теста: он проверяет ровно
 * тот текст, который уедет в браузер, и ловит его дрейф.
 *
 * Заглушка `document` намеренно полная. Скрипт обёрнут в try/catch, так что
 * отсутствующий querySelector он проглотил бы молча — и проверка meta никогда
 * бы не сработала.
 */
function runInlineThemeScript(
  stored: string | null,
  systemDark: boolean,
): InlineResult {
  const script = indexHtml.match(/<script>([\s\S]*?)<\/script>/)
  if (!script) throw new Error('Инлайн-скрипт темы не найден в index.html')

  const documentElement = { dataset: {} as Record<string, string> }
  const meta = {
    content: undefined as string | undefined,
    setAttribute(name: string, value: string) {
      if (name === 'content') meta.content = value
    },
  }

  const run = new Function('localStorage', 'matchMedia', 'document', script[1])
  run(
    { getItem: (key: string) => (key === THEME_STORAGE_KEY ? stored : null) },
    (query: string) => ({
      matches: query.includes('dark') ? systemDark : false,
    }),
    {
      documentElement,
      querySelector: (selector: string) =>
        selector === 'meta[name="theme-color"]' ? meta : null,
    },
  )

  return { theme: documentElement.dataset.theme, themeColor: meta.content }
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
      it(`stored=${stored ?? 'нет'}, системная тёмная=${systemDark} — тема и theme-color как в theme.ts`, () => {
        const expected: ResolvedTheme = resolveTheme(choice, systemDark)
        const result = runInlineThemeScript(stored, systemDark)

        expect(result.theme).toBe(expected)
        expect(result.themeColor).toBe(THEME_COLORS[expected])
      })
    }
  }
})
