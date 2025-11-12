import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz'
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts', 'd3'],
          ui: ['@headlessui/react', '@heroicons/react', 'framer-motion'],
          utils: ['axios', 'date-fns', 'mathjs']
        }
      }
    },
    sourcemap: true,
    minify: 'terser',
    outDir: 'dist',
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 3000,
    host: true,
    strictPort: false
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'socket.io-client']
  }
})
