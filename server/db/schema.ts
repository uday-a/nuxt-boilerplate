import { boolean, integer, pgEnum, pgTable, serial, text, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core'

// Application roles. Backed by a Postgres ENUM so the DB rejects unknown
// values — a free-text varchar would let a typo like 'admin ' silently
// bypass requireRole(). Add new roles here AND regenerate migrations:
//   npx drizzle-kit generate
export const userRole = pgEnum('user_role', ['user', 'admin', 'editor'])
export type Role = (typeof userRole.enumValues)[number]
export const ROLES: readonly Role[] = userRole.enumValues

// Authoritative app-side mirror of every signed-in account.
//
// Email is the user's identity (UNIQUE, NOT NULL). `githubId` is now
// nullable — present for GitHub OAuth signins, NULL for magic-link
// signins. Add other provider columns (googleId, etc.) the same way.
//
// Profile fields (bio, timezone, locale, notification prefs) live here
// rather than in a separate `user_preferences` table to keep the common
// "load the signed-in user" query a single SELECT. Split into a child
// table only if preferences grow past ~15 columns.
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 256 }).notNull(),
  // OAuth provider IDs. Nullable so users can exist without OAuth
  // (magic-link only). Unique when present so collisions can't dedupe
  // separate accounts.
  githubId: integer('github_id').unique(),
  login: varchar('login', { length: 64 }).notNull(),
  name: varchar('name', { length: 128 }),
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
}, t => [uniqueIndex('users_email_unique').on(t.email)])

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

// Subscription / plan status mirrored from Polar.
//
// Polar is the source of truth — we never compute a plan locally. The
// webhook handler updates this row on subscription.* events; the app
// reads it to gate features. There's a 1:1 between users and
// subscriptions (one active sub per user); we upsert by userId.
//
// `status` mirrors Polar's union — keep it loose-string here rather
// than a pgEnum so a new Polar status doesn't require a migration.
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  // Polar customer + subscription identifiers — opaque strings.
  polarCustomerId: varchar('polar_customer_id', { length: 64 }).notNull(),
  polarSubscriptionId: varchar('polar_subscription_id', { length: 64 }).notNull().unique(),
  // The Polar product ID this subscription was created against. Maps
  // to one of POLAR_*_PRODUCT_ID env vars.
  productId: varchar('product_id', { length: 64 }).notNull(),
  // 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing' …
  status: varchar('status', { length: 32 }).notNull(),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
  canceledAt: timestamp('canceled_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Subscription = typeof subscriptions.$inferSelect
export type NewSubscription = typeof subscriptions.$inferInsert

// One-time-use tokens for the magic-link sign-in flow.
//
// We store the SHA-256 hash of the token, never the raw value, so a DB
// snapshot leak can't be used to sign in. The raw token is emitted into
// the email link and discarded server-side immediately.
//
// `usedAt` enforces single-use: a valid token transitions usedAt from
// null to a timestamp on first verify, and subsequent verifies fail
// (`token already used`). `expiresAt` enforces TTL (15 minutes by
// convention; see the magic-link handler).
//
// `email` carries the requested identity. The verify path either
// updates an existing users row (matched by email) or inserts a fresh
// one. This is the data path that doesn't require GitHub OAuth.
export const magicLinkTokens = pgTable('magic_link_tokens', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 256 }).notNull(),
  tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
