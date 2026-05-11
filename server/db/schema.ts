import { boolean, integer, pgEnum, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'

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
//
// Profile fields (bio, timezone, locale, notification prefs) live here
// rather than in a separate `user_preferences` table to keep the common
// "load the signed-in user" query a single SELECT. Split into a child
// table only if preferences grow past ~15 columns.
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  githubId: integer('github_id').notNull().unique(),
  login: varchar('login', { length: 64 }).notNull(),
  name: varchar('name', { length: 128 }),
  email: varchar('email', { length: 256 }),
  avatarUrl: text('avatar_url'),
  role: userRole('role').notNull().default('user'),
  // Profile.
  bio: varchar('bio', { length: 500 }),
  timezone: varchar('timezone', { length: 64 }).notNull().default('UTC'),
  locale: varchar('locale', { length: 8 }).notNull().default('en'),
  // Notification prefs. Booleans rather than a JSON blob so they're
  // queryable (e.g. "who opted in to weekly digest?") without parsing.
  notifyEmail: boolean('notify_email').notNull().default(true),
  notifyInApp: boolean('notify_in_app').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

// Projects — the canonical "user-owned resource" entity used by the
// /projects routes. Copy this shape when adding a second product entity:
// id + slug + ownerId + audit timestamps, with the slug doubling as the
// URL segment so links read better than /projects/42.
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 64 }).notNull().unique(),
  name: varchar('name', { length: 128 }).notNull(),
  description: text('description'),
  // Cascade delete: removing a user removes their projects. Swap to
  // 'set null' + a `deletedOwnerLabel` if you need to keep orphan rows
  // for audit purposes.
  ownerId: integer('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
