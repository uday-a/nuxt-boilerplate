import { eq } from 'drizzle-orm'
import { useDb, schema } from '~~/server/db'
import { apiError, apiHandler } from '~~/server/utils/response'
import { requireAuth } from '~~/server/utils/guards'
import { recordAudit } from '~~/server/utils/audit'
import { logger } from '~~/server/utils/logger'

// DELETE /api/keys/:id — revoke a key (sets revokedAt; the row stays for
// audit history). No body needed.
//
// Ownership is checked before existence is revealed: a key owned by
// someone else 404s exactly like a missing key, so ids can't be probed.
export default apiHandler(async (event) => {
  const session = await requireAuth(event)

  if (event.method !== 'DELETE') {
    throw apiError('NOT_FOUND', `Method ${event.method} not supported on /api/keys/:id`)
  }

  const rawId = getRouterParam(event, 'id')
  const id = Number(rawId)
  if (!rawId || !Number.isInteger(id) || id <= 0) {
    throw apiError('VALIDATION_FAILED', 'Invalid API key id', { field: 'id' })
  }

  // Demo sessions own no keys, so every id is a 404 by construction.
  if ((session as { demo?: boolean }).demo === true) {
    throw apiError('NOT_FOUND', `API key ${id} not found`)
  }

  const db = useDb()
  const rows = await db.select().from(schema.apiKeys).where(eq(schema.apiKeys.id, id)).limit(1)
  const row = rows[0]
  if (!row || row.userId !== session.user.id) {
    throw apiError('NOT_FOUND', `API key ${id} not found`)
  }

  await db.update(schema.apiKeys).set({ revokedAt: new Date() }).where(eq(schema.apiKeys.id, id))

  await recordAudit({
    userId: Number(session.user.id),
    action: 'api_keys.revoke',
    entity: 'api_key',
    entityId: id,
    metadata: { name: row.name, prefix: row.prefix },
  })
  logger.info('api_keys.revoked', { id, prefix: row.prefix })

  return { revoked: id }
})
