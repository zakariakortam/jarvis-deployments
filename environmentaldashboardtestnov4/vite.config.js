import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          ui: ['framer-motion', '@headlessui/react']
        }
      }
    },
    sourcemap: true,
    minify: 'terser'
  },
  server: {
    port: process.env.PORT || 3000,
    host: true
  }
})
