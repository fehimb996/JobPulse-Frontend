import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor libraries that don't change often
          vendor: ['react', 'react-dom', 'react-router-dom'],

          // Google Maps related code
          googleMaps: ['@react-google-maps/api'],

          // Charting libraries
          charts: ['chart.js', 'react-chartjs-2'],
        }
      }
    }
  }
})
