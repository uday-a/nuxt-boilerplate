// Example: AUTH-ONLY API route.
//
// `requireAuth(event)` (alias for requireUserSession) throws a 401 if the
// session cookie is missing or invalid, so anything below the call is
// guaranteed to run for an authenticated user. Copy this shape for any
// endpoint that must be logged-in-only.
//
// Try it (logged out):  curl -i http://localhost:3000/api/me
//   → HTTP/1.1 401 Unauthorized
// Try it (logged in):   browser visits while session cookie is set
//   → { user: { id, login, name, email, avatar, role }, loggedInAt }
export default defineEventHandler(async (event) => {
  const { user, loggedInAt } = await requireAuth(event)
  return {
    user,
    loggedInAt,
  }
})
