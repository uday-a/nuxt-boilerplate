import { desc, eq, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { useDb, schema } from '~~/server/db'
import { ROLES, type Role } from '~~/server/db/schema'
import { apiError, apiHandler } from '~~/server/utils/response'
import { requireAuth, requireRole } from '~~/server/utils/guards'
import { env } from '~~/server/utils/env'
import { logger } from '~~/server/utils/logger'
import { requireRateLimit } from '~~/server/utils/rate-limit'
import { recordAudit } from '~~/server/utils/audit'
import { sendEmail, inviteEmail } from '~~/server/utils/mailer'
import { generateToken, hashToken } from '~~/server/utils/tokens'

// Team invites: one file, H3-style method-branched (mirrors
// server/api/projects/index.ts).
//
//   GET  /api/team/invites → pending invites (admin/editor)
//   POST /api/team/invites → create invite + email link (admin/editor)
//
// Token discipline mirrors the magic-link flow: SHA-256 hash persisted,
// raw token only in the emailed /invite/<raw> link, 7-day TTL,
// single-use via acceptedAt.

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000

// Sample pending invites for demo sessions and DB-less boots. Emails
// match the roster domain served by /api/team/members in the same mode.
const DEMO_INVITES = [
  { id: 101, email: 'chloe.morgan@acme.com', role: 'editor', invitedBy: 1, expiresAt: '2026-10-05T10:00:00Z', createdAt: '2026-09-28T10:00:00Z' },
  { id: 102, email: 'ryan.brooks@acme.com', role: 'user', invitedBy: 2, expiresAt: '2026-10-03T15:30:00Z', createdAt: '2026-09-26T15:30:00Z' },
]

const InviteBody = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  role: z.enum(ROLES as unknown as [string, ...string[]]),
})

export default apiHandler(async (event) => {
  const method = event.method

  // Demo sessions have no `users` row, so requireRole's live lookup would
  // reject them once a DB is reachable. Gate on the cookie role instead,
  // serve sample data for GET, and keep writes disabled.
  const authed = await requireAuth(event)
  if ((authed as { demo?: boolean }).demo === true) {
    if (!['admin', 'editor'].includes(authed.user.role)) {
      throw apiError('FORBIDDEN', `role '${authed.user.role}' is not permitted`)
    }
    if (method === 'GET') return { invites: DEMO_INVITES }
    throw apiError('FORBIDDEN', 'Invites are disabled in demo mode.')
  }

  const session = await requireRole(event, 'admin', 'editor')

  // ─── GET /api/team/invites ───────────────────────────────────────
  if (method === 'GET') {
    if (!env.DATABASE_URL) return { invites: DEMO_INVITES }
    try {
      const db = useDb()
      const rows = await db
        .select({
          id: schema.invites.id,
          email: schema.invites.email,
          role: schema.invites.role,
          invitedBy: schema.invites.invitedBy,
          expiresAt: schema.invites.expiresAt,
          createdAt: schema.invites.createdAt,
        })
        .from(schema.invites)
        .where(isNull(schema.invites.acceptedAt))
        .orderBy(desc(schema.invites.createdAt))
      return { invites: rows }
    }
    catch (e) {
      logger.error('team.invites.list_failed', { error: (e as Error).message })
      throw apiError('INTERNAL', 'Could not list invites. The invites table may be missing — run `npx drizzle-kit migrate` against DATABASE_URL.')
    }
  }

  // ─── POST /api/team/invites ──────────────────────────────────────
  if (method === 'POST') {
    // Invites send email — throttle per IP so a loop can't spam inboxes.
    requireRateLimit(event, { key: 'team:invites' })
    const body = await readBody(event)
    const parsed = InviteBody.safeParse(body)
    if (!parsed.success) {
      throw apiError('VALIDATION_FAILED', 'Invalid invite payload', {
        issues: parsed.error.issues,
      })
    }

    if (!env.DATABASE_URL) {
      throw apiError('INTERNAL', 'Team invites require a database. Configure DATABASE_URL to send invites.')
    }

    const token = generateToken()
    const tokenHash = hashToken(token)
    const expiresAt = new Date(Date.now() + INVITE_TTL_MS)

    try {
      const db = useDb()

      // Resolve the numeric users.id for invitedBy attribution. The
      // session id is the OAuth provider id, not the serial PK — and
      // demo id 0 has no row. Nullable column, so null is safe.
      let invitedBy: number | null = null
      const sessionEmail = (session.user.email ?? '').toLowerCase()
      if (sessionEmail) {
        const rows = await db
          .select({ id: schema.users.id })
          .from(schema.users)
          .where(eq(schema.users.email, sessionEmail))
          .limit(1)
        invitedBy = rows[0]?.id ?? null
      }

      const [invite] = await db
        .insert(schema.invites)
        .values({
          email: parsed.data.email,
          role: parsed.data.role as Role,
          tokenHash,
          invitedBy,
          expiresAt,
        })
        .returning({
          id: schema.invites.id,
          email: schema.invites.email,
          role: schema.invites.role,
          expiresAt: schema.invites.expiresAt,
          createdAt: schema.invites.createdAt,
        })

      const link = `${env.NUXT_PUBLIC_SITE_URL}/invite/${token}`
      const inviterLabel = session.user.name ?? session.user.login ?? undefined
      try {
        await sendEmail(inviteEmail({ email: parsed.data.email, link, role: parsed.data.role, inviter: inviterLabel }))
      }
      catch (e) {
        // Invite row already exists — a mailer outage shouldn't roll it
        // back. Surface the invite so the UI can offer a resend.
        logger.error('team.invite.send_failed', { email: parsed.data.email, error: (e as Error).message })
      }

      await recordAudit({
        userId: invitedBy,
        action: 'team.invite',
        entity: 'invite',
        entityId: invite?.id,
        metadata: { email: parsed.data.email, role: parsed.data.role },
      })
      logger.info('team.invite.created', { email: parsed.data.email, role: parsed.data.role })

      return { invite }
    }
    catch (e) {
      if ((e as { code?: string }).code === '23505') {
        throw apiError('VALIDATION_FAILED', 'An invite is already pending for this email', { field: 'email' })
      }
      // apiError instances pass through untouched.
      if ((e as { statusCode?: number }).statusCode) throw e
      logger.error('team.invite.create_failed', { email: parsed.data.email, error: (e as Error).message })
      throw apiError('INTERNAL', 'Could not create invite. The invites table may be missing — run `npx drizzle-kit migrate` against DATABASE_URL.')
    }
  }

  throw apiError('NOT_FOUND', `Method ${method} not supported on /api/team/invites`)
})
