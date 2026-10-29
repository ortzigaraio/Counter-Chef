/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Rutas relativas: funciona igual en GitHub Pages (/Counter-Chef/) que en local.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Counter-Chef',
        short_name: 'Counter-Chef',
        description: 'Recetas, dosis, masas y vaciles entre amigos que cocinan regular.',
        lang: 'es',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#FFF7EA',
        theme_color: '#1A1512',
        categories: ['food', 'lifestyle', 'utilities'],
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        // Android: aparece en "Compartir" de TikTok, Instagram, Chrome, Notas...
        share_target: {
          action: './',
          method: 'GET',
          params: { title: 'share_title', text: 'share_text', url: 'share_url' },
        },
        shortcuts: [
          { name: 'Importar receta', url: './#/importar', icons: [{ src: 'icon-192.png', sizes: '192x192' }] },
          { name: 'Calculadora de masa', url: './#/herramientas/masa', icons: [{ src: 'icon-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Solo latín: el resto de alfabetos de las fuentes se bajan si alguna vez hacen falta.
        globIgnores: ['**/*-{cyrillic,cyrillic-ext,greek,math,vietnamese}-*.woff2', '**/sdk-*.js', 'catalog/**'],
        // El catálogo (JSON + fotos) se cachea al usarse, no en la instalación.
        runtimeCaching: [
          { urlPattern: /\/catalog\/recipes\.json$/, handler: 'StaleWhileRevalidate', options: { cacheName: 'cc-catalog' } },
          { urlPattern: /\/catalog\/img\//, handler: 'CacheFirst', options: { cacheName: 'cc-catalog-img', expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 365 } } },
        ],
        navigateFallback: 'index.html',
      },
    }),
  ],
  test: { environment: 'node' },
})
