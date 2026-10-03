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
    // server/utils/env.ts validates at import; server tests need a throwaway
    // session secret (same idea as the CI build env).
    env: { NUXT_SESSION_PASSWORD: 'test-only-throwaway-32-character-secret' },
    include: ['app/**/*.{test,spec}.{ts,js}', 'shared/**/*.{test,spec}.{ts,js}', 'server/**/*.{test,spec}.{ts,js}', '!**/e2e/**'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './app'),
      '~': resolve(__dirname, './app'),
    },
  },
})
