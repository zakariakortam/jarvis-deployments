import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three', '@react-three/fiber', '@react-three/drei']
        }
      }
    }
  },
  server: {
    port: parseInt(process.env.PORT) || 3000,
    host: true,
      allowedHosts: true
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei', 'simplex-noise']
  }
})
