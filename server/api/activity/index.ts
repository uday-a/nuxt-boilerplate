import { and, desc, eq, ilike } from 'drizzle-orm'
import { useDb, schema } from '~~/server/db'
import { apiError, apiHandler } from '~~/server/utils/response'
import { requireAuth } from '~~/server/utils/guards'
import { env } from '~~/server/utils/env'
import { logger } from '~~/server/utils/logger'

// GET /api/activity — the caller's own audit trail, newest first.
//
// H3-style flexible handler (mirrors server/api/projects/index.ts): the
// filename has no `.get` suffix so Nitro routes every method here and we
// dispatch on `event.method`. Only GET is served today.
//
// Scope note: this returns caller-only rows. An admin-wide view (all rows,
// or rows per workspace member) is a deliberate future step — it needs a
// membership model to scope correctly, so we don't guess at one here.
//
// Resolution note: the session id is the OAuth provider id, not the serial
// `users.id` PK (see team/invites for the same dance), so we resolve the
// numeric id via the session email before filtering audit_logs.
//
// Without a DB (or for demo sessions, which have no rows to attribute)
// this returns an empty list — the client renders its mock fallback and a
// note that live events appear once a database is connected.
export default apiHandler(async (event) => {
  if (event.method !== 'GET') {
    throw apiError('NOT_FOUND', `Method ${event.method} not supported on /api/activity`)
  }

  const session = await requireAuth(event)

  if ((session as { demo?: boolean }).demo === true) {
    return { items: [], total: 0 }
  }
  if (!env.DATABASE_URL) {
    return { items: [], total: 0 }
  }

  const rawAction = getQuery(event).action
  const actionFilter = typeof rawAction === 'string' && rawAction.trim()
    ? rawAction.trim().replace(/[%_\\]/g, '').slice(0, 64)
    : null

  try {
    const db = useDb()

    let callerId: number | null = null
    const sessionEmail = (session.user.email ?? '').toLowerCase()
    if (sessionEmail) {
      const me = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.email, sessionEmail))
        .limit(1)
      callerId = me[0]?.id ?? null
    }
    if (callerId === null) {
      return { items: [], total: 0 }
    }

    const scope = actionFilter
      ? and(eq(schema.auditLogs.userId, callerId), ilike(schema.auditLogs.action, `%${actionFilter}%`))
      : eq(schema.auditLogs.userId, callerId)

    const items = await db
      .select({
        id: schema.auditLogs.id,
        userId: schema.auditLogs.userId,
        action: schema.auditLogs.action,
        entity: schema.auditLogs.entity,
        entityId: schema.auditLogs.entityId,
        metadata: schema.auditLogs.metadata,
        createdAt: schema.auditLogs.createdAt,
        actorEmail: schema.users.email,
      })
      .from(schema.auditLogs)
      .leftJoin(schema.users, eq(schema.auditLogs.userId, schema.users.id))
      .where(scope)
      .orderBy(desc(schema.auditLogs.createdAt))
      .limit(50)

    return { items, total: items.length }
  }
  catch (e) {
    // Table missing or DB unreachable — surface empty rather than 500 so
    // the activity surfaces degrade to their mock fallback.
    logger.warn('activity.list_failed', { error: (e as Error).message })
    return { items: [], total: 0 }
  }
})
