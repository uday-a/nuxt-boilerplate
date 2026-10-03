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
// Demo sessions and DB-less boots get a fixed sample list (same people
// as the /api/team/members demo roster). Demo users have no `users` row,
// so the role check uses the session cookie role instead of requireRole.
//
// NOTE: in real apps, whitelist the columns you return. db.select() with
// no shape leaks email + createdAt + every future column you add.
import { useDb, schema } from '~~/server/db'
import { env } from '~~/server/utils/env'

const DEMO_USERS = [
  { id: 1, login: 'olivia.bennett', name: 'Olivia Bennett', role: 'admin', createdAt: '2025-11-04T09:12:00Z' },
  { id: 2, login: 'james.carter', name: 'James Carter', role: 'admin', createdAt: '2025-11-18T14:30:00Z' },
  { id: 3, login: 'sophie.turner', name: 'Sophie Turner', role: 'editor', createdAt: '2026-01-09T10:05:00Z' },
  { id: 4, login: 'daniel.hughes', name: 'Daniel Hughes', role: 'editor', createdAt: '2026-02-23T16:40:00Z' },
  { id: 5, login: 'emma.collins', name: 'Emma Collins', role: 'user', createdAt: '2026-04-02T08:55:00Z' },
  { id: 6, login: 'lucas.meyer', name: 'Lucas Meyer', role: 'user', createdAt: '2026-05-14T11:20:00Z' },
  { id: 7, login: 'grace.walker', name: 'Grace Walker', role: 'user', createdAt: '2026-07-21T13:15:00Z' },
  { id: 8, login: 'henry.foster', name: 'Henry Foster', role: 'user', createdAt: '2026-09-08T09:45:00Z' },
]

export default apiHandler(async (event) => {
  const authed = await requireAuth(event)
  if ((authed as { demo?: boolean }).demo === true || !env.DATABASE_URL) {
    if (authed.user.role !== 'admin') {
      throw apiError('FORBIDDEN', `role '${authed.user.role}' is not permitted`)
    }
    return DEMO_USERS
  }

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
