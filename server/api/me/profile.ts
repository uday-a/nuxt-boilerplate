import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb, schema } from '~~/server/db'
import { apiError, apiHandler } from '~~/server/utils/response'
import { requireAuth } from '~~/server/utils/guards'
import { logger } from '~~/server/utils/logger'

// H3-style flexible handler: GET returns current profile, PUT updates.
// One file, method-branched. See server/api/projects/index.ts for the
// convention.

const UpdateProfile = z.object({
  name: z.string().trim().min(1).max(128).optional(),
  bio: z.string().trim().max(500).nullable().optional(),
  // IANA tz name. We don't enforce the full list — Postgres `varchar(64)`
  // is the storage bound; clients should pick from a curated dropdown.
  timezone: z.string().trim().min(1).max(64).optional(),
  // BCP-47-ish. Same reasoning: enforce shape, let UI pick valid values.
  locale: z.string().trim().min(2).max(8).optional(),
  notifyEmail: z.boolean().optional(),
  notifyInApp: z.boolean().optional(),
})

export default apiHandler(async (event) => {
  const session = await requireAuth(event)
  const isDemo = session.demo === true
  const method = event.method

  // ─── GET /api/me/profile ───────────────────────────────────────────
  if (method === 'GET') {
    if (isDemo) {
      return {
        profile: {
          name: session.user.name,
          bio: 'Demo account — changes here aren’t persisted.',
          timezone: 'UTC',
          locale: 'en',
          notifyEmail: true,
          notifyInApp: true,
        },
      }
    }
    const db = useDb()
    const [row] = await db
      .select({
        name: schema.users.name,
        bio: schema.users.bio,
        timezone: schema.users.timezone,
        locale: schema.users.locale,
        notifyEmail: schema.users.notifyEmail,
        notifyInApp: schema.users.notifyInApp,
      })
      .from(schema.users)
      .where(eq(schema.users.id, session.user.id))
      .limit(1)
    if (!row) throw apiError('SESSION_INVALID', 'Account no longer exists')
    return { profile: row }
  }

  // ─── PUT /api/me/profile ───────────────────────────────────────────
  if (method === 'PUT') {
    const body = await readBody(event)
    const parsed = UpdateProfile.safeParse(body)
    if (!parsed.success) {
      throw apiError('VALIDATION_FAILED', 'Invalid profile payload', {
        issues: parsed.error.issues,
      })
    }

    if (isDemo) {
      // Demo: return success but don't persist; let the UI surface it.
      return { profile: parsed.data, demo: true }
    }

    const db = useDb()
    const [updated] = await db
      .update(schema.users)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(schema.users.id, session.user.id))
      .returning({
        name: schema.users.name,
        bio: schema.users.bio,
        timezone: schema.users.timezone,
        locale: schema.users.locale,
        notifyEmail: schema.users.notifyEmail,
        notifyInApp: schema.users.notifyInApp,
      })
    if (!updated) throw apiError('SESSION_INVALID', 'Account no longer exists')
    logger.info('me.profile.updated', { userId: session.user.id, fields: Object.keys(parsed.data) })
    return { profile: updated }
  }

  throw apiError('NOT_FOUND', `Method ${method} not supported on /api/me/profile`)
})
