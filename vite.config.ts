import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
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
        manualChunks(id) {
          // Vendor chunks - split large dependencies
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@headlessui') || id.includes('lucide-react') || id.includes('react-feather')) {
              return 'ui-vendor';
            }
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'form-vendor';
            }
            if (id.includes('recharts')) {
              return 'chart-vendor';
            }
            if (id.includes('i18next')) {
              return 'i18n-vendor';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            if (id.includes('socket.io-client')) {
              return 'socket-vendor';
            }
            if (id.includes('axios') || id.includes('date-fns') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'utils-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'motion-vendor';
            }
            if (id.includes('tesseract.js')) {
              return 'ocr-vendor';
            }
            if (id.includes('@terraformer/wkt')) {
              return 'geo-vendor';
            }
            // Other node_modules go into a common vendor chunk
            return 'vendor';
          }
          
          // Admin components chunk - split large admin components
          if (id.includes('/pages/admin/components/')) {
            return 'admin-components';
          }
          
          // Admin pages chunk
          if (id.includes('/pages/admin/') && !id.includes('/components/')) {
            return 'admin-pages';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1MB for better chunking
  },
})
