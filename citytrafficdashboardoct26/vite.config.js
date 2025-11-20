import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          maps: ['leaflet', 'react-leaflet'],
          charts: ['recharts'],
          ui: ['framer-motion', '@headlessui/react']
        }
      }
    },
    sourcemap: true,
    minify: 'terser',
    outDir: 'dist'
  },
  server: {
    port: process.env.PORT || 3000,
    host: true
  }
})
