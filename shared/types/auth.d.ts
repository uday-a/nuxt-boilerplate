// TypeScript augmentation for nuxt-auth-utils session.
// This tells useUserSession() / requireUserSession() that the user object
// always includes our custom fields (id, login, name, email, avatar, role).
//
// Lives under shared/ so it's picked up by both the app and server
// tsconfig includes (../shared/**/*.d.ts).
//
// Keep in sync with the shape passed to setUserSession() in
// server/routes/auth/github.get.ts
import type { Role } from '~~/server/db/schema'

declare module '#auth-utils' {
  interface User {
    id: number
    login: string
    name: string
    // GitHub allows private-email accounts; OAuth then returns null.
    // Don't pretend this is always a string — downstream callers must
    // handle the null case.
    email: string | null
    avatar: string | null
    role: Role
  }
}
