import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuration Vite : React + build optimisé (découpage des vendors)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Sépare les grosses librairies pour améliorer la mise en cache
        manualChunks: {
          react: ['react', 'react-dom'],
          motion: ['framer-motion'],
        },
      },
    },
  },
})
