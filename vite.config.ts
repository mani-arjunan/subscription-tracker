import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192x192.png', 'icon-512x512.png', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Subscription Tracker',
        short_name: 'Subscriptions',
        description: 'Track and manage all your subscriptions in one place',
        theme_color: '#0f1115',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/apple-touch-icon-180x180.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any',
          },
        ],
        screenshots: [
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'wide',
          },
        ],
        categories: ['productivity', 'utilities'],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,woff,woff2,ttf,eot}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'offlineCache',
              expiration: {
                maxEntries: 200,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
})
