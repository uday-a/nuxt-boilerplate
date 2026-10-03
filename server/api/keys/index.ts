import { desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDb, schema } from '~~/server/db'
import { apiError, apiHandler } from '~~/server/utils/response'
import { requireAuth } from '~~/server/utils/guards'
import { recordAudit } from '~~/server/utils/audit'
import { logger } from '~~/server/utils/logger'
import { requireRateLimit } from '~~/server/utils/rate-limit'
import { mintApiKey } from '~~/server/utils/api-keys'

// H3-style flexible handler: one file, multiple HTTP methods. Nitro
// routes any method to this file because the filename has no `.get` /
// `.post` suffix. See server/api/projects/index.ts for the rationale.

const CreateKey = z.object({
  name: z.string().trim().min(1, 'Name is required').max(64, 'Name must be 64 characters or fewer'),
  scopes: z.array(z.enum(['read', 'write'])).min(1).max(4).default(['read']),
  expiresInDays: z.number().int().positive().max(365).optional(),
})

export default apiHandler(async (event) => {
  const session = await requireAuth(event)
  const method = event.method

  // Demo session has no DB row; surface a deterministic empty list / fake
  // success so the UI is clickable without polluting real data.
  const isDemo = (session as { demo?: boolean }).demo === true

  // ─── GET /api/keys ───────────────────────────────────────────────
  if (method === 'GET') {
    if (isDemo) return { keys: [] }
    const db = useDb()
    // Explicit column list — keyHash is selected nowhere, so it can
    // never leak into the list response.
    const keys = await db
      .select({
        id: schema.apiKeys.id,
        name: schema.apiKeys.name,
        prefix: schema.apiKeys.prefix,
        scopes: schema.apiKeys.scopes,
        lastUsedAt: schema.apiKeys.lastUsedAt,
        expiresAt: schema.apiKeys.expiresAt,
        revokedAt: schema.apiKeys.revokedAt,
        createdAt: schema.apiKeys.createdAt,
      })
      .from(schema.apiKeys)
      .where(eq(schema.apiKeys.userId, session.user.id))
      .orderBy(desc(schema.apiKeys.createdAt))
    return { keys }
  }

  // ─── POST /api/keys ──────────────────────────────────────────────
  if (method === 'POST') {
    // Key minting is cheap — throttle per IP so a loop can't flood the table.
    requireRateLimit(event, { key: 'api:keys' })
    const body = await readBody(event)
    const parsed = CreateKey.safeParse(body)
    if (!parsed.success) {
      throw apiError('VALIDATION_FAILED', 'Invalid API key payload', {
        issues: parsed.error.issues,
      })
    }

    const minted = mintApiKey()
    const scopes = [...new Set(parsed.data.scopes)].join(' ')
    const expiresAt = parsed.data.expiresInDays ? new Date(Date.now() + parsed.data.expiresInDays * 86400000) : null

    if (isDemo) {
      // Demo: echo back without persisting.
      return {
        key: {
          id: 0,
          name: parsed.data.name,
          prefix: minted.prefix,
          scopes,
          lastUsedAt: null,
          expiresAt,
          revokedAt: null,
          createdAt: new Date(),
        },
        rawKey: minted.raw,
      }
    }

    const db = useDb()
    const [row] = await db
      .insert(schema.apiKeys)
      .values({
        userId: session.user.id,
        name: parsed.data.name,
        keyHash: minted.hash,
        prefix: minted.prefix,
        scopes,
        expiresAt,
      })
      .returning()
    if (!row) throw apiError('INTERNAL', 'Could not create API key')

    // Never log the raw key — prefix is enough for support lookups.
    logger.info('api_keys.created', { userId: session.user.id, prefix: minted.prefix })
    await recordAudit({
      userId: Number(session.user.id),
      action: 'api_keys.create',
      entity: 'api_key',
      entityId: row.id,
      metadata: { name: row.name, prefix: minted.prefix },
    })

    // Rebuild the row without keyHash rather than destructuring it away
    // (avoids an unused-var lint trip on the omitted field).
    const { id, name, prefix, createdAt, lastUsedAt, revokedAt } = row
    return {
      key: { id, name, prefix, scopes: row.scopes, lastUsedAt, expiresAt: row.expiresAt, revokedAt, createdAt },
      rawKey: minted.raw,
    }
  }

  throw apiError('NOT_FOUND', `Method ${method} not supported on /api/keys`)
})
