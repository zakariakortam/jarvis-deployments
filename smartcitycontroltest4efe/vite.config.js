import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { compression } from 'vite-plugin-compression2'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
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
          charts: ['recharts', 'd3'],
          maps: ['leaflet', 'react-leaflet'],
          ui: ['@headlessui/react', 'framer-motion']
        }
      }
    },
    sourcemap: true,
    minify: 'terser',
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: process.env.PORT || 3000,
    host: true
  },
  preview: {
    port: process.env.PORT || 3000,
    host: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'recharts', 'leaflet']
  }
})
