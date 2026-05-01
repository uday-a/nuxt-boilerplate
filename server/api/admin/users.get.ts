// Example: ADMIN-ONLY API route.
//
// `requireRole(event, 'admin')` throws 401 if not logged in,
// 403 if the user's role is not 'admin'.
//
// Try it (as user):  curl -i http://localhost:3000/api/admin/users
//   → HTTP/1.1 403 Forbidden
// Try it (as admin): → 200 + array of users
import { useDb, schema } from '~~/server/db'

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin')
  const db = useDb()
  return db.select().from(schema.users)
})
