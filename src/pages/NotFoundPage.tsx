import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <main className="page page--center">
      <p className="page__code">404</p>
      <p className="page__empty">Такой страницы нет</p>
      <Link to="/" className="page__back">
        ← Вернуться к карте
      </Link>
    </main>
  )
}
