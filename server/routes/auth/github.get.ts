import { useDb, schema } from '~~/server/db'

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
