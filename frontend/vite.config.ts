import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Tells Vite to use the official React plugin
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      // Forwards to `dotnet run` (see backend/GreenVendor.Api/Properties/launchSettings.json).
      // Override with VITE_API_PROXY_TARGET if your backend runs elsewhere (e.g. Docker on :5000).
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:5177',
        changeOrigin: true,
      },
      // Product photos are served from the API's wwwroot/images and proxied
      // the same way nginx does in prod — without this, <img src="/images/..."> 404s in dev.
      '/images': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:5177',
        changeOrigin: true,
      },
    },
  },
})