// Page-level middleware. Attach via `definePageMeta({ middleware: 'auth' })`
// on any page that needs a logged-in user. Redirects to /login when missing.
//
// TEMPORARY BYPASS — set BYPASS=true to preview /admin without logging in.
// Flip back to false once GitHub OAuth is wired so middleware enforces auth.
const BYPASS = true

export default defineNuxtRouteMiddleware(async (to) => {
  if (BYPASS) return
  const { loggedIn } = useUserSession()
  if (!loggedIn.value) {
    return navigateTo(`/login?next=${encodeURIComponent(to.fullPath)}`)
  }
})
