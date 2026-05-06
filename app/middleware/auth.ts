// Page-level middleware. Attach via `definePageMeta({ middleware: 'auth' })`
// on any page that needs a logged-in user. Redirects to /login when missing.
//
// There's no bypass flag here anymore. Fresh forks without GitHub OAuth
// configured still get a clickable app via demo mode — /login shows a
// "Continue as demo user" button that mints a real session. See
// server/utils/env.ts → isDemoMode and server/routes/auth/demo.post.ts.

export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn } = useUserSession()
  if (!loggedIn.value) {
    return navigateTo(`/login?next=${encodeURIComponent(to.fullPath)}`)
  }
})
