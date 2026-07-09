import { createBrowserRouter } from 'react-router'
import { RootLayout } from '../components/RootLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { CameraDetailPage } from '../pages/CameraDetailPage'
import { NotFoundPage } from '../pages/NotFoundPage'

/**
 * Роутинг в data-режиме. Глубокие ссылки (/camera/:cameraId) работают и на
 * проде: воркер отдаёт index.html на неизвестный путь — см. wrangler.jsonc,
 * `not_found_handling: "single-page-application"`.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: DashboardPage },
      { path: 'camera/:cameraId', Component: CameraDetailPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
])
