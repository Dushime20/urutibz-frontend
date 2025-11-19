import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
