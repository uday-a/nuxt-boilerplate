import { Axiom } from '@axiomhq/js'
import { consola } from 'consola'
import { env, hasAxiom } from './env'

// Structured server-side logger. Off by default.
//
// In dev / when AXIOM_TOKEN is unset:
//   - logs go to stdout via consola (pretty-printed)
//   - nothing is shipped anywhere
//
// In prod / when AXIOM_TOKEN + AXIOM_DATASET are set:
//   - logs still go to stdout (so the platform's own log capture works)
//   - AND a structured event is queued to Axiom (batched, flushed async)
//
// Usage:
//   import { logger } from '~~/server/utils/logger'
//   logger.info('user.signin', { userId, login })
//   logger.error('db.query.failed', { table: 'users', err: e.message })

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

// Single lazy instance — we don't want to construct a client on every
// request, and HMR-safe (Nitro re-imports modules but the module-level
// variable persists across hot reloads).
const axiom = hasAxiom ? new Axiom({ token: env.AXIOM_TOKEN! }) : null

function ship(level: LogLevel, event: string, context: Record<string, unknown>) {
  // consola first — visible immediately, doesn't depend on Axiom.
  consola[level === 'debug' ? 'debug' : level](`[${event}]`, context)

  if (!axiom || !env.AXIOM_DATASET) return

  // ingest() is fire-and-forget; the SDK batches and flushes on its own
  // interval. We attach _time so Axiom uses our timestamp rather than
  // ingestion time (matters for retry-buffered events).
  axiom.ingest(env.AXIOM_DATASET, [{
    _time: new Date().toISOString(),
    level,
    event,
    ...context,
  }])
}

export const logger = {
  debug: (event: string, context: Record<string, unknown> = {}) => ship('debug', event, context),
  info: (event: string, context: Record<string, unknown> = {}) => ship('info', event, context),
  warn: (event: string, context: Record<string, unknown> = {}) => ship('warn', event, context),
  error: (event: string, context: Record<string, unknown> = {}) => ship('error', event, context),

  // Call on graceful shutdown so the last batch isn't lost. The Nitro
  // plugin at server/plugins/logger.ts wires this to the `close` hook.
  flush: async () => {
    if (axiom) await axiom.flush()
  },
}
