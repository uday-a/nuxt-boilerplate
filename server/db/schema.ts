import { pgEnum, pgTable, serial, varchar, timestamp, integer, text } from 'drizzle-orm/pg-core'

// Application roles. Backed by a Postgres ENUM so the DB rejects unknown
// values — a free-text varchar would let a typo like 'admin ' silently
// bypass requireRole(). Add new roles here AND regenerate migrations:
//   npx drizzle-kit generate
export const userRole = pgEnum('user_role', ['user', 'admin', 'editor'])
export type Role = (typeof userRole.enumValues)[number]
export const ROLES: readonly Role[] = userRole.enumValues

// Authoritative app-side mirror of the OAuth user. nuxt-auth-utils stores
// the session client-side (encrypted cookie); this row is where you hang
// app-owned data (preferences, ownership of records, etc.) keyed off
// GitHub's stable user id.
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  githubId: integer('github_id').notNull().unique(),
  login: varchar('login', { length: 64 }).notNull(),
  name: varchar('name', { length: 128 }),
  email: varchar('email', { length: 256 }),
  avatarUrl: text('avatar_url'),
  role: userRole('role').notNull().default('user'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
