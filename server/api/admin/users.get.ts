// Example: ADMIN-ONLY API route.
//
// `requireRole(event, 'admin')` throws 401 UNAUTHORIZED if no session,
// 401 SESSION_INVALID if the user row was deleted, 403 FORBIDDEN if the
// live DB role isn't 'admin'. apiHandler envelopes all three.
//
// Try it (anonymous): curl -i http://localhost:3000/api/admin/users
//   → 401 { "ok": false, "error": { "code": "UNAUTHORIZED", ... } }
// Try it (as user):
//   → 403 { "ok": false, "error": { "code": "FORBIDDEN", "message": "role 'user' is not permitted" } }
// Try it (as admin):
//   → 200 { "ok": true, "data": [ { id, login, role, ... }, ... ] }
//
// NOTE: in real apps, whitelist the columns you return. db.select() with
// no shape leaks email + createdAt + every future column you add.
import { useDb, schema } from '~~/server/db'

export default apiHandler(async (event) => {
  await requireRole(event, 'admin')
  const db = useDb()
  return db
    .select({
      id: schema.users.id,
      login: schema.users.login,
      name: schema.users.name,
      role: schema.users.role,
      createdAt: schema.users.createdAt,
    })
    .from(schema.users)
})
