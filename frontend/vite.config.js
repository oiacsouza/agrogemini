import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  server: {
    host: 'agrogemini.com',
    port: 443,
    https: true
  },
  plugins: [react(), mkcert()],
})
