// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  // @i18now/nuxt only loads when a project id is configured. Without env
  // vars, @nuxtjs/i18n alone serves translations from i18n/locales/*.json
  // — so dev / CI / fork users get real strings with zero i18now signup.
  modules: [
    '@nuxt/eslint',
    '@nuxtjs/seo',
    'nuxt-auth-utils',
    '@nuxtjs/i18n',
    ...(process.env.I18NOW_PROJECT_ID ? ['@i18now/nuxt'] : []),
  ],
  components: [
    { path: '~/components', pathPrefix: false, extensions: ['.vue'] },
  ],
  devtools: { enabled: true },
  css: ['~/assets/css/tailwind.css'],
  // @nuxtjs/seo is an umbrella module — it composes nuxt-sitemap,
  // nuxt-robots, nuxt-og-image, nuxt-schema-org, nuxt-link-checker, and
  // nuxt-seo-utils. `site.url` here flows through to all of them.
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    name: 'Acme',
    description: 'A Nuxt 4 boilerplate with shadcn-vue, auth, i18n, and SEO baked in.',
    defaultLocale: 'en',
  },
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    },
  },
  compatibilityDate: '2025-07-15',
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
      ],
    },
  },
  // @nuxt/eslint generates a flat config in .nuxt/eslint.config.mjs that the
  // root eslint.config.mjs extends. Stylistic rules match our 2-space / no
  // semicolons / single-quote convention.
  eslint: {
    config: {
      stylistic: {
        indent: 2,
        semi: false,
        quotes: 'single',
      },
    },
  },
  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', file: 'en.json', name: 'English' },
      { code: 'es', file: 'es.json', name: 'Español' },
    ],
    strategy: 'no_prefix',
  },
  i18now: {
    projectId: process.env.I18NOW_PROJECT_ID!,
    apiKey: process.env.I18NOW_API_KEY,
    mode: 'local',
  },
})
