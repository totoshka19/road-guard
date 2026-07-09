import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * Плашка жизненного цикла service worker'а.
 *
 * `registerType: 'prompt'` означает, что новый воркер встаёт в состояние
 * waiting и ждёт решения пользователя. Молча активировать его под открытым
 * дашбордом нельзя: перезагрузка оборвала бы живой поток и обнулила буфер.
 * `updateServiceWorker(true)` шлёт waiting-воркеру skipWaiting и перезагружает
 * страницу — уже по явному согласию.
 */
export function PwaUpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!offlineReady && !needRefresh) return null

  const dismiss = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div className="pwa-toast" role="status" aria-live="polite">
      <p className="pwa-toast__text">
        {needRefresh
          ? 'Доступна новая версия дашборда'
          : 'Готово к работе офлайн'}
      </p>
      <div className="pwa-toast__actions">
        {needRefresh && (
          <button
            type="button"
            className="pwa-toast__btn pwa-toast__btn--primary"
            onClick={() => void updateServiceWorker(true)}
          >
            Обновить
          </button>
        )}
        <button type="button" className="pwa-toast__btn" onClick={dismiss}>
          {needRefresh ? 'Позже' : 'Закрыть'}
        </button>
      </div>
    </div>
  )
}
