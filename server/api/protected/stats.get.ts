// Example: MULTI-ROLE API route.
//
// Accepts users with role 'admin' OR 'editor'.
// Throws 401 if anonymous, 403 if role is not in the allow-list.
//
// Try it (as user):   curl -i http://localhost:3000/api/protected/stats
//   → HTTP/1.1 403 Forbidden
// Try it (as editor): → 200 + stats payload
export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin', 'editor')
  return {
    totalUsers: 42,
    totalProjects: 7,
    lastUpdated: new Date().toISOString(),
  }
})
