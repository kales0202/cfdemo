import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
// 开发环境
console.log('NODE_ENV', process.env.NODE_ENV)
const isDev = process.env.NODE_ENV === 'development'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  build: {
    sourcemap: isDev,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
