import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router/dom'
import './styles/global.css'
import './lib/chartSetup'
import { store } from './app/store'
import { router } from './app/router'

// Начальные данные грузит RTK Query из RootLayout — отдельный bootstrap не нужен.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)
