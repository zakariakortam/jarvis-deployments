import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { compression } from 'vite-plugin-compression2'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    compression({ algorithm: 'gzip' }),
    visualizer({ open: false })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          animations: ['framer-motion']
        }
      }
    },
    sourcemap: true,
    minify: 'terser'
  },
  server: {
    port: process.env.PORT || 3000,
    host: true
  },
  preview: {
    port: process.env.PORT || 3000,
    host: true
  }
})
