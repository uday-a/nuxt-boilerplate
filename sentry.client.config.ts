// Sentry client-side init. Loaded by @sentry/nuxt/module ONLY when the
// module is registered (NUXT_PUBLIC_SENTRY_DSN set — see nuxt.config.ts).
// The defensive `if (dsn)` makes Sentry.init() a no-op if this file is
// evaluated without a DSN, instead of crashing the SPA boot.
import * as Sentry from '@sentry/nuxt'

const dsn = useRuntimeConfig().public.sentry.dsn

if (dsn) {
  Sentry.init({
    dsn,

    // Default: collect request headers + IP. Acceptable for B2B SaaS;
    // flip to false if you have GDPR-tight requirements before launch.
    sendDefaultPii: true,

    // 10% performance sampling; matches the server config.
    tracesSampleRate: 0.1,

    // Session Replay: capture 10% of all sessions, plus 100% of sessions
    // that hit an error. Cheap insurance for reproducing bugs from real
    // user reports.
    integrations: [
      Sentry.replayIntegration(),
    ],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Mirror server logs to Sentry's Logs product. Off by default if you
    // already pay for Axiom — flip to false to avoid double-billing.
    enableLogs: true,
  })
}
