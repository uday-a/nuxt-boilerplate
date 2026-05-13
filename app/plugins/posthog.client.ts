// PostHog product analytics — client-only plugin.
//
// Gating per CLAUDE.md → "Gating modules and plugins on env":
//   1. Plugin filename is `*.client.ts` so it never runs server-side.
//   2. Early-return when the public key is empty.
//   3. `posthog-js` is imported via dynamic import() so the SDK is only
//      pulled into the client bundle when the key is set at build time.
//      With the key empty, Vite tree-shakes the import away entirely.
//
// Auto-captures page views by hooking the Nuxt router. Provides
// `$posthog` for explicit `track()` / `identify()` from any component:
//   const { $posthog } = useNuxtApp()
//   $posthog?.capture('user.upgraded', { plan: 'pro' })

import type { PostHog } from 'posthog-js'

export default defineNuxtPlugin(async () => {
  const { key, host } = useRuntimeConfig().public.posthog as { key: string, host: string }

  if (!key) {
    // No-op when PostHog isn't configured. Expose `$posthog` as undefined
    // so call sites can use `$posthog?.capture(...)` without checking
    // for the plugin's existence.
    return { provide: { posthog: undefined as PostHog | undefined } }
  }

  const { default: posthog } = await import('posthog-js')

  posthog.init(key, {
    api_host: host,
    // Track page views via router instead of PostHog's autocapture so SPA
    // navigations are counted correctly.
    capture_pageview: false,
    // Use the `web_vitals` integration only when sampling >0 — off for now.
    capture_pageleave: true,
    // Avoid collecting input values by default; opt-in per-form via
    // `data-attr-record` if you need it. Sensible privacy floor.
    autocapture: {
      dom_event_allowlist: ['click', 'submit', 'change'],
      element_attribute_ignorelist: ['data-private'],
    },
  })

  // SPA page view tracking. `router.afterEach` fires after navigation
  // completes; manual capture gives us full control over what counts.
  const router = useRouter()
  router.afterEach((to) => {
    posthog.capture('$pageview', { $current_url: to.fullPath })
  })

  return { provide: { posthog: posthog as PostHog | undefined } }
})
