import { isDemoMode } from '~~/server/utils/env'
import { logger } from '~~/server/utils/logger'

// Demo sign-in: mints a session for a deterministic fake user so a fresh
// fork is fully clickable without configuring GitHub OAuth or a DB. The
// route 404s when demo mode is off (see server/utils/env.ts → isDemoMode).
//
// Production note: leaving this enabled in prod is intentional only when
// you want a public preview. Set NUXT_DEMO_MODE=false to hard-disable.
export default defineEventHandler(async (event) => {
  if (!isDemoMode) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  await setUserSession(event, {
    user: {
      id: 0,
      login: 'demo',
      name: 'Demo User',
      email: 'demo@example.com',
      avatar: null,
      role: 'admin' as const,
    },
    loggedInAt: Date.now(),
    demo: true,
  })

  logger.info('auth.demo.signin', { ip: getRequestIP(event, { xForwardedFor: true }) })
  return { ok: true }
})
