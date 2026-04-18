import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  server: {
    host: 'agrogemini.com',
    port: 8443,
    strictPort: true,
    https: true,
  },
  plugins: [react(), mkcert(), tailwindcss(), visualizer({ open: false, filename: 'stats.html' })],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
        },
      },
    },
  },
})