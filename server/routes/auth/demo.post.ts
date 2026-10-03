import { isDemoMode } from '~~/server/utils/env'
import { requireRateLimit } from '~~/server/utils/rate-limit'
import { recordAudit } from '~~/server/utils/audit'
import { logger } from '~~/server/utils/logger'

// Demo sign-in: mints a session for a deterministic fake user so a fresh
// fork is fully clickable without configuring GitHub OAuth or a DB. The
// route 404s when demo mode is off (see server/utils/env.ts → isDemoMode).
//
// Production note: leaving this enabled in prod is intentional only when
// you want a public preview. Set NUXT_DEMO_MODE=false to hard-disable.
export default defineEventHandler(async (event) => {
  // Minting sessions is free — throttle per IP so a loop can't hammer it.
  requireRateLimit(event, { key: 'auth:demo' })
  if (!isDemoMode) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  await setUserSession(event, {
    user: {
      id: 0,
      login: 'john.doe',
      name: 'John Doe',
      email: 'john.doe@example.com',
      avatar: 'https://uday.cc/avatar-twitter.png',
      role: 'admin' as const,
    },
    loggedInAt: Date.now(),
    demo: true,
  })

  logger.info('auth.demo.signin', { ip: getRequestIP(event, { xForwardedFor: true }) })
  // Demo sessions have no DB row — recordAudit no-ops without DATABASE_URL.
  await recordAudit({ userId: null, action: 'auth.signin', metadata: { provider: 'demo' } })
  return { ok: true }
})
