import { defineConfig } from 'vite'
import react       from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'favicon.svg'],
      manifest: {
        name: 'AguiLang',
        short_name: 'AguiLang',
        description: 'Türkçe konuşan çocuklar için dil öğrenme uygulaması',
        theme_color: '#085041',
        background_color: '#085041',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        lang: 'tr',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Tüm statik varlıkları önbelleğe al
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json,woff2}'],
        // Google Fonts önbelleğe al (Fredoka One + Nunito)
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      // Geliştirme ortamında SW kayıt etme
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
