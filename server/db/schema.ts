import { pgTable, serial, varchar, timestamp, integer, text } from 'drizzle-orm/pg-core'

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
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
