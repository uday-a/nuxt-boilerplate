import { useDb, schema } from '~~/server/db'
import { logger } from '~~/server/utils/logger'

// Durable twin of logger.info for user-visible history.
//
// The structured logger ships to Axiom for ops; recordAudit() persists
// the same event into `audit_logs` so the product can show it back
// (settings/activity page). It never throws — audit must not break the
// product write it describes — and it no-ops without DATABASE_URL
// (useDb throws; demo sessions have no rows to attribute).
export async function recordAudit(input: {
  userId?: number | null
  action: string
  entity?: string
  entityId?: string | number
  metadata?: Record<string, unknown>
}): Promise<void> {
  try {
    const db = useDb()
    await db.insert(schema.auditLogs).values({
      userId: input.userId ?? null,
      action: input.action,
      entity: input.entity ?? null,
      entityId: input.entityId === undefined ? null : String(input.entityId),
      metadata: input.metadata ?? null,
    })
  }
  catch (err) {
    logger.warn('audit.write.failed', { action: input.action })
  }
}
