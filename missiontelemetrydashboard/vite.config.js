import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { compression } from 'vite-plugin-compression2'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    compression({ algorithm: 'gzip' })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          charts: ['recharts'],
          ui: ['framer-motion', 'lucide-react']
        }
      }
    },
    sourcemap: true,
    minify: 'terser',
    outDir: 'dist',
    chunkSizeWarningLimit: 1000
  },
  server: {
    allowedHosts: true,
    port: process.env.PORT || 3000,
    host: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'three']
  }
})
