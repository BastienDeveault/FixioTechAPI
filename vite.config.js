import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ['fixiotech.onrender.com'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./frontend/src/setupTests.js'],
  },
})
