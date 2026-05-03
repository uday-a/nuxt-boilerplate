// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // @i18now/nuxt only loads when a project id is configured. Without env
  // vars, @nuxtjs/i18n alone serves translations from i18n/locales/*.json
  // — so dev / CI / fork users get real strings with zero i18now signup.
  modules: [
    'nuxt-auth-utils',
    '@nuxtjs/i18n',
    ...(process.env.I18NOW_PROJECT_ID ? ['@i18now/nuxt'] : []),
  ],
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    },
  },
  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', file: 'en.json' },
      { code: 'es', file: 'es.json' },
    ],
    strategy: 'no_prefix',
  },
  i18now: {
    projectId: process.env.I18NOW_PROJECT_ID!,
    apiKey: process.env.I18NOW_API_KEY,
    mode: 'local',
  },
  css: ['~/assets/css/tailwind.css'],
  components: [
    { path: '~/components', pathPrefix: false, extensions: ['.vue'] },
  ],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
      ],
    },
  },
})
