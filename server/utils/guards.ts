import { H3Event, createError } from 'h3'
import { eq } from 'drizzle-orm'
import { useDb, schema } from '~~/server/db'
import { ROLES, type Role } from '~~/server/db/schema'

/**
 * Require an authenticated session. Thin wrapper around requireUserSession
 * that exists so every protected route uses the same guard name.
 */
export async function requireAuth(event: H3Event) {
  return requireUserSession(event)
}

/**
 * Require an authenticated session whose user has one of the allowed roles.
 *
 * Re-reads the role from the database on every call instead of trusting
 * the session cookie. Why: the session cookie has a multi-day TTL, so a
 * cached role would mean demoting an admin doesn't actually take effect
 * until they log out. One indexed lookup on users.id is cheap; trade the
 * round-trip for correctness.
 *
 * If the database is unavailable (boilerplate dev mode without
 * DATABASE_URL), falls back to the session role and logs a warning so the
 * stale-cookie risk is visible.
 *
 * Throws 401 if not logged in, 403 if the role is not allowed.
 *
 * Accepts a single role, a rest list, or an array:
 *   requireRole(event, 'admin')
 *   requireRole(event, 'admin', 'editor')
 *   requireRole(event, ['admin', 'editor'])
 */
export async function requireRole(
  event: H3Event,
  ...allowedInput: (Role | Role[])[]
) {
  const allowed = allowedInput.flat()
  const session = await requireUserSession(event)

  const liveRole = await readLiveRole(session.user.id)
  const role = liveRole ?? session.user.role

  if (!allowed.includes(role)) {
    throw createError({
      statusCode: 403,
      statusMessage: `Forbidden: role '${role}' is not permitted`,
    })
  }
  // Patch the in-memory session so downstream handlers see the fresh role.
  // We don't rewrite the cookie — that would extend its TTL on every
  // request. Callers who want to persist a fresh role to the cookie
  // should call replaceUserSession() explicitly.
  if (liveRole && liveRole !== session.user.role) {
    session.user.role = liveRole
  }
  return session
}

/**
 * Explicit no-op guard for public routes.
 * Use it at the top of a handler to signal "this endpoint is intentionally public".
 */
export function requirePublic(_event: H3Event) {
  // no-op
}

async function readLiveRole(userGithubId: number | string): Promise<Role | null> {
  try {
    const db = useDb()
    const row = await db
      .select({ role: schema.users.role })
      .from(schema.users)
      .where(eq(schema.users.githubId, Number(userGithubId)))
      .limit(1)
    const r = row[0]?.role
    if (r && (ROLES as readonly string[]).includes(r)) return r as Role
    return null
  } catch (e) {
    // DB-less dev mode (no DATABASE_URL) — fall back to cookie role and
    // surface the staleness risk in logs so adopters notice.
    console.warn('[guards] live role lookup failed, using session role:', (e as Error).message)
    return null
  }
}
