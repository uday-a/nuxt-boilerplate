import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Lazy singleton so dev HMR doesn't open new pools on every reload.
let _db: ReturnType<typeof drizzle> | null = null

export function useDb() {
  if (_db) return _db
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  const client = postgres(url, { prepare: false })
  _db = drizzle(client, { schema })
  return _db
}

export { schema }
