import { eq } from 'drizzle-orm'
import { useDb, schema } from '~~/server/db'
import { ROLES, type Role } from '~~/server/db/schema'

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
    try {
      const db = useDb()
      await db
        .insert(schema.users)
        .values({
          githubId: user.id,
          login: user.login,
          name: user.name ?? user.login,
          email: user.email,
          avatarUrl: user.avatar_url,
        })
        .onConflictDoUpdate({
          target: schema.users.githubId,
          set: {
            login: user.login,
            name: user.name ?? user.login,
            email: user.email,
            avatarUrl: user.avatar_url,
            updatedAt: new Date(),
          },
        })

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
    } catch (e) {
      console.warn('[auth/github] DB upsert skipped:', (e as Error).message)
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
    return sendRedirect(event, '/dashboard')
  },
  onError(event, error) {
    console.error('GitHub OAuth error:', error)
    return sendRedirect(event, '/login?error=oauth')
  },
})
