/**
 * Короткое относительное время на русском для ленты: «сейчас», «5 с»,
 * «3 мин», «2 ч». `now` вынесен в аргумент — так функция чистая и легко
 * тестируется без подмены таймеров.
 */
export function formatRelativeTime(
  timestamp: number,
  now: number = Date.now(),
): string {
  const diffSec = Math.max(0, Math.round((now - timestamp) / 1000))
  if (diffSec < 5) return 'сейчас'
  if (diffSec < 60) return `${diffSec} с`

  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} мин`

  const diffHour = Math.floor(diffMin / 60)
  return `${diffHour} ч`
}
