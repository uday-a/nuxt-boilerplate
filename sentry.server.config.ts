// Sentry server-side init. Loaded by @sentry/nuxt/module ONLY when the
// module is registered (which happens only when NUXT_PUBLIC_SENTRY_DSN
// is set — see nuxt.config.ts). The defensive check below is belt +
// suspenders: if for any reason this file is evaluated without a DSN,
// Sentry.init() is a no-op rather than a noisy crash.
import * as Sentry from '@sentry/nuxt'

const dsn = process.env.NUXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,

    // Performance: 10% sampling is the recommended starting point — high
    // enough to catch trends, low enough that costs don't surprise you.
    // Bump to 1.0 for the first week after launch if you want to baseline.
    tracesSampleRate: 0.1,

    // Send logs to Sentry's Logs product (separate from issue events).
    enableLogs: true,

    // Tag every event with the deployment environment. `NODE_ENV` is set
    // by Nuxt/Nitro at build/run time.
    environment: process.env.NODE_ENV ?? 'development',
  })
}
