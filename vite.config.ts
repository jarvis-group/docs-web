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
  build: {
    // R29 prod hardening: see user-web/vite.config.ts for rationale.
    sourcemap: process.env.VITE_SOURCEMAP === 'true',
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: true, drop_debugger: true, passes: 2 },
      mangle: { toplevel: true },
      format: { comments: false },
    },
  },
})
