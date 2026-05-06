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
      // Mirrors `isDemoMode` from server/utils/env.ts so the client UI
      // (e.g. /login's "Continue as demo" button) can decide whether to
      // surface demo affordances without an extra round-trip.
      demoMode: process.env.NUXT_DEMO_MODE === 'true'
        || (process.env.NUXT_DEMO_MODE !== 'false'
          && !process.env.NUXT_OAUTH_GITHUB_CLIENT_ID
          && process.env.NODE_ENV !== 'production'),
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
  // The `i18now` key is augmented onto the Nuxt config only when the
  // @i18now/nuxt module is registered (which we do conditionally above).
  // Cast so TypeScript stops complaining when the module isn't loaded.
  ...(process.env.I18NOW_PROJECT_ID
    ? {
        i18now: {
          projectId: process.env.I18NOW_PROJECT_ID,
          apiKey: process.env.I18NOW_API_KEY,
          mode: 'local' as const,
        },
      }
    : {}),
})
