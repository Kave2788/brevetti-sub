import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Se un giorno pubblichi in una sottocartella (es. GitHub Pages), imposta
// qui il percorso base: '/nome-repo/'.
const BASE = '/'

// https://vite.dev/config/
export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png'],
      workbox: {
        // L'app deve aprirsi anche completamente offline.
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        navigateFallback: `${BASE}index.html`,
      },
      manifest: {
        name: 'Brevetti Sub',
        short_name: 'Brevetti',
        description:
          'I tuoi brevetti subacquei e l’assicurazione DAN, sempre con te e anche offline.',
        lang: 'it',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
