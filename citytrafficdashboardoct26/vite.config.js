import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { compression } from 'vite-plugin-compression2'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  // Set base URL to root for preview mode to avoid path duplication
  base: '/',
  plugins: [
    react(),
    compression({ algorithm: 'gzip' }),
    visualizer({ open: false, filename: 'dist/stats.html' })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@headlessui/react', 'framer-motion', '@heroicons/react'],
          maps: ['leaflet', 'react-leaflet', 'leaflet.heat'],
          charts: ['recharts'],
          utils: ['date-fns', 'clsx', 'zod']
        }
      }
    },
    sourcemap: true,
    minify: 'terser',
    target: 'es2015',
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: process.env.PORT || 3000,
    host: true,
    strictPort: false,
    hmr: {
      // Disable HMR for preview mode to avoid WebSocket issues
      host: 'localhost'
    }
  },
  preview: {
    port: process.env.PORT || 3000,
    host: true,
    strictPort: false
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'leaflet', 'recharts']
  }
})
