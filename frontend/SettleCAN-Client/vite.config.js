import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
  },
  server: {
    host: '127.0.0.1',
    port: 3000,
    // Proxy /api requests to the Express backend so there are no CORS issues in dev.
    // Production should use the real backend URL via VITE_API_URL env var.
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  legacy: {
    inconsistentCjsInterop: true,
  },
})
