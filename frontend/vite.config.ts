import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Tells Vite to use the official React plugin
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
})