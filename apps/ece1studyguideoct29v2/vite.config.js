import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { compression } from 'vite-plugin-compression2'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: 'gzip' }),
    visualizer({ open: false })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@headlessui/react', 'framer-motion'],
          math: ['mathjs', 'katex', 'react-katex'],
          charts: ['recharts', 'plotly.js', 'react-plotly.js']
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
    include: ['react', 'react-dom', 'react-router-dom', 'mathjs']
  }
})
