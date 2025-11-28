import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression2';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  base: './',
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
          charts: ['recharts'],
          ui: ['@headlessui/react', 'framer-motion', '@heroicons/react', 'lucide-react']
        }
      }
    },
    sourcemap: true,
    minify: 'terser',
    outDir: 'dist',
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: process.env.PORT || 3000,
    host: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'recharts']
  }
});
