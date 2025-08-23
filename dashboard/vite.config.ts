import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174
  },
  base: process.env.NODE_ENV === 'production' ? '/chat-assistant-plugin/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
