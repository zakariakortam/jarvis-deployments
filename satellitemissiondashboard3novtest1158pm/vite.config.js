import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          charts: ['recharts'],
          utils: ['date-fns', 'zustand', 'clsx']
        }
      }
    },
    sourcemap: true,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: process.env.PORT || 3000,
    host: true
  },
  worker: {
    format: 'es'
  }
})
