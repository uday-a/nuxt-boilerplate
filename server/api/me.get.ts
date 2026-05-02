// Example: AUTH-ONLY API route.
//
// `requireAuth(event)` throws 401 if the session cookie is missing or
// invalid; apiHandler envelopes it as { ok: false, error: { code:
// 'UNAUTHORIZED', ... } }. Anything below requireAuth is guaranteed to
// run for an authenticated user.
//
// Try it (logged out):  curl -i http://localhost:3000/api/me
//   → 401 { "ok": false, "error": { "code": "UNAUTHORIZED", "message": "..." } }
// Try it (logged in):
//   → 200 { "ok": true, "data": { "user": { id, login, name, email, avatar, role }, "loggedInAt": ... } }
export default apiHandler(async (event) => {
  const { user, loggedInAt } = await requireAuth(event)
  return { user, loggedInAt }
})
