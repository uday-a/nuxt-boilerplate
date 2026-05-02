import type { Role } from '~~/server/db/schema'

// Page-level middleware for role-based route guards.
//
// Attach via:
//   definePageMeta({ middleware: 'role', requiredRole: 'admin' })
//   definePageMeta({ middleware: 'role', requiredRole: ['admin', 'editor'] })
//
// UX-only: this stops a flash of forbidden content before the page
// resolves and gives users a clean redirect. The real enforcement lives
// in server-side guards (requireRole) — never trust client-side checks
// for authorisation, only for navigation polish.
//
// Like the server guards this reads role off the session cookie, so a
// fresh demotion won't take effect until the next sign-in. The server
// guards re-check the DB, so a stale-cookie admin still hits 403 the
// moment they try to mutate.
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, user } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo(`/login?next=${encodeURIComponent(to.fullPath)}`)
  }

  const required = to.meta.requiredRole
  if (!required) return

  const allowed = Array.isArray(required) ? required : [required]
  const role = user.value?.role
  if (!role || !allowed.includes(role)) {
    return navigateTo('/dashboard?error=forbidden')
  }
})

declare module '#app' {
  interface PageMeta {
    requiredRole?: Role | Role[]
  }
}
export {}
