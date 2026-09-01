import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'SoundScout - AI AV Event Logistics & Rentals',
        short_name: 'SoundScout',
        description: 'AI-powered event AV infrastructure planning, vendor bidding, and instant rental marketplace.',
        start_url: '/',
        scope: '/',
        id: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#f1f5f9',
        theme_color: '#0B0F13',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache only the built app shell (JS/CSS/HTML/icons); API calls to the backend/AI
        // service are never intercepted here, since caching event/bid/plan data would risk
        // serving stale results in an app whose whole point is live status.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallbackDenylist: [/^\/api\//],
      },
      devOptions: {
        enabled: false,
      },
      // The default injected registerSW.js just calls register() once and leans on the browser's
      // own (slow, inconsistent) background revalidation to ever notice a new deploy -- a tab
      // that already installed an older service worker can keep being served its stale precached
      // bundle indefinitely. Registering manually lets us poll for updates and apply them
      // immediately, so a deploy actually reaches already-open tabs instead of only new visitors.
      injectRegister: false,
    }),
  ],
  server: {
    proxy: {
      '/api/ai-voice': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ai-voice/, '/api/voice-intake')
      },
      '/api/ai-image': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ai-image/, '/api/venue-analysis')
      },
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      }
    }
  }
})
