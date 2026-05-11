import { eq } from 'drizzle-orm'
import { useDb, schema } from '~~/server/db'
import { ROLES, type Role } from '~~/server/db/schema'
import { env } from '~~/server/utils/env'
import { logger } from '~~/server/utils/logger'
import { sendEmail, welcomeEmail } from '~~/server/utils/mailer'

// nuxt-auth-utils GitHub OAuth handler. The module exposes
// `defineOAuthGitHubEventHandler` which performs the full code-exchange
// dance — we just receive the user profile + tokens.
export default defineOAuthGitHubEventHandler({
  config: {
    emailRequired: true,
  },
  async onSuccess(event, { user }) {
    // Upsert the GitHub user into our local users table. Skips silently if
    // DATABASE_URL isn't configured yet so the OAuth flow still works in
    // a db-less dev setup.
    let role: Role = 'user'

    // Bootstrap admins: comma-separated list of GitHub logins that should
    // be created as 'admin' on FIRST sign-in. We deliberately do not touch
    // role on conflict — once the row exists the DB is the source of truth
    // (lets you demote without editing env, and prevents env drift across
    // environments from clobbering production roles).
    const bootstrapAdmins = (env.NUXT_INITIAL_ADMIN_LOGINS ?? '')
      .split(',').map((s: string) => s.trim()).filter(Boolean)
    const initialRole: Role = bootstrapAdmins.includes(user.login) ? 'admin' : 'user'

    // Track whether this signin is the user's first time so we can send
    // a welcome email exactly once. `xmax = '0'` is a Postgres-only
    // tell that the row was INSERTed (vs UPDATEd) by ON CONFLICT — see
    // https://www.postgresql.org/docs/current/ddl-system-columns.html.
    // We surface that as a system column via `.returning()`.
    let isFirstSignin = false

    try {
      const db = useDb()
      const returned = await db
        .insert(schema.users)
        .values({
          githubId: user.id,
          login: user.login,
          name: user.name ?? user.login,
          email: user.email,
          avatarUrl: user.avatar_url,
          role: initialRole,
        })
        .onConflictDoUpdate({
          target: schema.users.githubId,
          set: {
            login: user.login,
            name: user.name ?? user.login,
            email: user.email,
            avatarUrl: user.avatar_url,
            updatedAt: new Date(),
            // role intentionally omitted — see bootstrap comment above.
          },
        })
        .returning({ createdAt: schema.users.createdAt, updatedAt: schema.users.updatedAt })

      // Heuristic: createdAt within 5s of now AND equal to updatedAt
      // means we just INSERTed (not UPDATEd via onConflict). Approximate
      // but cheap and avoids a separate query or raw `xmax` access.
      const row = returned[0]
      if (row) {
        const now = Date.now()
        const created = row.createdAt.getTime()
        const updated = row.updatedAt.getTime()
        isFirstSignin = (now - created) < 5000 && Math.abs(created - updated) < 1000
      }

      // Fetch the user's role so the session reflects any DB-side changes.
      const dbUser = await db
        .select({ role: schema.users.role })
        .from(schema.users)
        .where(eq(schema.users.githubId, user.id))
        .limit(1)
      // Defensive: the DB enum and the TS Role union can drift if the
      // app code is redeployed before the migration that adds a new role.
      // Fall back to 'user' rather than trusting an unknown string.
      const dbRole = dbUser[0]?.role
      if (dbRole && (ROLES as readonly string[]).includes(dbRole)) {
        role = dbRole as Role
      }
    }
    catch (e) {
      logger.warn('auth.github.db_upsert_skipped', {
        login: user.login,
        error: (e as Error).message,
      })
    }

    // Welcome email — fire-and-forget so a mailer failure doesn't fail
    // the OAuth flow. The DB doesn't have to be available; if `isFirstSignin`
    // never flipped true (db-less mode), we skip the email entirely so users
    // don't get welcomed on every signin in that mode.
    if (isFirstSignin && user.email) {
      sendEmail(welcomeEmail({
        name: user.name ?? user.login,
        email: user.email,
        siteUrl: env.NUXT_PUBLIC_SITE_URL,
      })).catch((err) => {
        logger.warn('auth.github.welcome_send_failed', {
          login: user.login,
          error: (err as Error).message,
        })
      })
    }

    await setUserSession(event, {
      user: {
        id: user.id,
        login: user.login,
        name: user.name ?? user.login,
        email: user.email,
        avatar: user.avatar_url,
        role,
      },
      loggedInAt: Date.now(),
    })
    logger.info('auth.github.signin', { login: user.login, role })
    return sendRedirect(event, '/dashboard')
  },
  onError(event, error) {
    logger.error('auth.github.oauth_error', { error: String(error) })
    return sendRedirect(event, '/login?error=oauth')
  },
})
