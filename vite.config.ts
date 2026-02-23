import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Uruti eRental - Universal Rental Platform',
        short_name: 'Uruti eRental',
        description: 'Rent anything from cameras to cars, tools to electronics. Africa\'s leading peer-to-peer rental marketplace with AI-powered matching and secure transactions.',
        theme_color: '#0b1220',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/assets/image/urutilogo2.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/assets/image/urutilogo2.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['shopping', 'business', 'lifestyle'],
        screenshots: [],
        shortcuts: [
          {
            name: 'Browse Items',
            short_name: 'Browse',
            description: 'Browse available rental items',
            url: '/items',
            icons: [{ src: '/assets/image/urutilogo2.png', sizes: '96x96' }]
          },
          {
            name: 'My Dashboard',
            short_name: 'Dashboard',
            description: 'View your dashboard',
            url: '/dashboard',
            icons: [{ src: '/assets/image/urutilogo2.png', sizes: '96x96' }]
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60 // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'framer-motion', '@headlessui/react'],
          'query-vendor': ['@tanstack/react-query', 'axios'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1MB for better chunking
  },
})
