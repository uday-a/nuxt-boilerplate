import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['app/**/*.{test,spec}.{ts,js}', '!**/e2e/**'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './app'),
      '~': resolve(__dirname, './app'),
    },
  },
})
