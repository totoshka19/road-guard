import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './styles/global.css'
import App from './App.tsx'
import { store } from './app/store'
import { bootstrap } from './app/bootstrap'

// Начальная загрузка данных в стор (камеры + история нарушений).
void bootstrap(store)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
