import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  server: {
    host: 'agrogemini.com',
    port: 8443,
    strictPort: true,
    https: true
  },
  plugins: [react(), mkcert(), tailwindcss()],
})
