import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { compression } from 'vite-plugin-compression2'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: 'gzip' }),
    visualizer({
      open: false,
      filename: 'dist/stats.html'
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          ui: ['@headlessui/react', 'framer-motion', 'lucide-react'],
          state: ['zustand', '@tanstack/react-query'],
          utils: ['axios', 'date-fns', 'zod', 'papaparse']
        }
      }
    },
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: process.env.PORT || 3000,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true
      },
      '/socket.io': {
        target: process.env.VITE_WS_URL || 'http://localhost:5000',
        changeOrigin: true,
        ws: true
      }
    }
  },
  preview: {
    port: process.env.PORT || 3000,
    host: true
  }
})
