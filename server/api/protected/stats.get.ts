// Example: MULTI-ROLE API route.
//
// Accepts users with role 'admin' OR 'editor'.
// Throws 401 if anonymous, 403 if role is not in the allow-list.
//
// Try it (as user):
//   → 403 { "ok": false, "error": { "code": "FORBIDDEN", ... } }
// Try it (as editor or admin):
//   → 200 { "ok": true, "data": { "totalUsers": 42, ... } }
export default apiHandler(async (event) => {
  await requireRole(event, 'admin', 'editor')
  return {
    totalUsers: 42,
    totalProjects: 7,
    lastUpdated: new Date().toISOString(),
  }
})
