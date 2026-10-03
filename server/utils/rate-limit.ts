import { type H3Event, getRequestIP } from 'h3'
import { apiError } from './response'
import { logger } from './logger'

// Tiny in-memory sliding-window limiter for low-cost abuse targets
// (demo sign-in, magic-link, team invites, API-key minting). Why in-memory:
// these routes are human-paced — 30 req/min/IP is generous for clicks but
// stops credential-stuffing loops and invite spam. Buckets live in the
// worker's memory, so counters reset on redeploy; acceptable for a throttle
// (not a quota). Fails open: when the client IP can't be determined we allow
// the request rather than 500ing legitimate traffic behind exotic proxies.

interface LimitOptions {
  /** Bucket name — one per route group, so abuse on one never throttles another. */
  key: string
  /** Max hits per window per IP. Default 30 — plenty for humans. */
  limit?: number
  /** Window length in ms. Default 60_000. */
  windowMs?: number
}

const hits = new Map<string, number[]>()

export function requireRateLimit(event: H3Event, opts: LimitOptions): void {
  const limit = opts.limit ?? 30
  const windowMs = opts.windowMs ?? 60_000
  let ip: string | undefined
  try {
    ip = getRequestIP(event, { xForwardedFor: true }) ?? undefined
  }
  catch {
    // Proxy headers unreadable — fail open (see above).
    return
  }
  if (!ip) return

  const bucket = `${opts.key}:${ip}`
  const now = Date.now()
  const windowStart = now - windowMs
  const recent = (hits.get(bucket) ?? []).filter(t => t > windowStart)
  if (recent.length >= limit) {
    logger.warn('rate_limit.exceeded', { key: opts.key, ip })
    throw apiError('RATE_LIMITED', 'Too many requests. Please try again shortly.')
  }
  recent.push(now)
  hits.set(bucket, recent)
}
