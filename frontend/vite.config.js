import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  server: {
    host: 'agrogemini.com',
    port: 443,
    strictPort: true,
    https: true
  },
  plugins: [react(), mkcert()],
})
