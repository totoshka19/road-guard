import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/ + https://vitest.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Молча подменять версию под работающим дашбордом не хочется:
      // спрашиваем пользователя (см. components/PwaUpdatePrompt).
      registerType: 'prompt',
      // Иконки манифеста и так подпадают под globPatterns ниже; без этого
      // плагин добавил бы их в precache вторично.
      includeManifestIcons: false,
      manifest: {
        name: 'RoadGuard — мониторинг дорожных нарушений',
        short_name: 'RoadGuard',
        description:
          'Real-time дашборд: камеры фотовидеофиксации на карте города и «прилетающие» с них нарушения ПДД.',
        lang: 'ru',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#0b0f17',
        theme_color: '#0b0f17',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Иконки и favicon уже подпадают под png/svg, а manifest.webmanifest
        // плагин добавляет сам — расширять глоб или дублировать через
        // includeAssets не нужно, иначе записи в precache задваиваются.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        // Офлайновый аналог not_found_handling у воркера: без этого прямая
        // ссылка /camera/:id без сети упрётся в отсутствующий документ,
        // потому что service worker не знает, что это SPA-маршрут.
        navigateFallback: 'index.html',
        // Precache покрывает только файлы сборки. Тайлы приезжают со стороннего
        // хоста, поэтому кэшируем их отдельно — иначе офлайн покажет пустую карту.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/tiles\.openfreemap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'openfreemap',
              expiration: {
                maxEntries: 600,
                maxAgeSeconds: 60 * 60 * 24 * 30, // месяц
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
