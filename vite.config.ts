import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const { VITE_API_URL } = loadEnv(mode, process.cwd(), 'VITE_')
  const target = (VITE_API_URL || 'http://127.0.0.1:8787').replace(/\/+$/, '')
  const apiProxy = { target, changeOrigin: true, secure: target.startsWith('https://') }

  return {
    plugins: [react()],
    server: {
      allowedHosts: true,
      proxy: { '/api': apiProxy },
    },
    preview: {
      proxy: { '/api': apiProxy },
    },
  }
})
