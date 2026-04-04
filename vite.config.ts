import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
  server: {
    port: 5175,
    proxy: {
      '/api': 'http://localhost:3000',
      '/auth': 'http://localhost:3000',
    },
  },
  resolve: {
    alias: {
      // Resolve @/ for @jarvis/ui internal imports (cn, utils, etc.)
      '@/': path.resolve(__dirname, '../packages/ui/src') + '/',
    },
  },
})
