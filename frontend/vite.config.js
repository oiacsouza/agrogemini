import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    // mkcert só no dev local, não no build da Vercel
    visualizer({ open: false, filename: 'stats.html' }),
  ],
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
  // server só usado localmente, Vercel ignora
  server: {
    host: 'agrogemini.com',
    port: 8443,
    strictPort: true,
    https: true,
  },
}))