import { consola } from 'consola'
import { env, hasAxiom } from './env'

// Structured server-side logger. Off by default.
//
// In dev / when AXIOM_TOKEN is unset:
//   - logs go to stdout via consola (pretty-printed)
//   - nothing is shipped anywhere
//   - the @axiomhq/js SDK is NEVER imported, so it doesn't ship in the
//     server bundle. This matters for cold-start latency on serverless
//     platforms — every kB counts.
//
// In prod / when AXIOM_TOKEN + AXIOM_DATASET are set:
//   - logs still go to stdout (so the platform's own log capture works)
//   - AND a structured event is queued to Axiom (batched, flushed async)
//   - the SDK is dynamically imported on first use
//
// Usage:
//   import { logger } from '~~/server/utils/logger'
//   logger.info('user.signin', { userId, login })
//   logger.error('db.query.failed', { table: 'users', err: e.message })

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

// Loose type so the rest of the file doesn't pull in @axiomhq types
// when Axiom isn't configured.
type AxiomClient = {
  ingest(dataset: string, events: object[]): void
  flush(): Promise<void>
}

// Lazy: only resolved on the first log call when hasAxiom is true.
// Subsequent calls reuse the cached promise. HMR-safe because the
// module-level variable persists across hot reloads.
let axiomPromise: Promise<AxiomClient | null> | null = null

function getAxiom(): Promise<AxiomClient | null> {
  if (!hasAxiom) return Promise.resolve(null)
  if (!axiomPromise) {
    axiomPromise = import('@axiomhq/js').then(({ Axiom }) =>
      new Axiom({ token: env.AXIOM_TOKEN! }) as unknown as AxiomClient,
    )
  }
  return axiomPromise
}

function ship(level: LogLevel, event: string, context: Record<string, unknown>) {
  // consola first — visible immediately, doesn't depend on Axiom.
  consola[level === 'debug' ? 'debug' : level](`[${event}]`, context)

  if (!hasAxiom || !env.AXIOM_DATASET) return

  // Fire-and-forget. The SDK batches internally and flushes on its own
  // interval; we attach _time so Axiom uses our timestamp rather than
  // ingestion time (matters for retry-buffered events).
  void getAxiom().then((axiom) => {
    axiom?.ingest(env.AXIOM_DATASET!, [{
      _time: new Date().toISOString(),
      level,
      event,
      ...context,
    }])
  })
}

export const logger = {
  debug: (event: string, context: Record<string, unknown> = {}) => ship('debug', event, context),
  info: (event: string, context: Record<string, unknown> = {}) => ship('info', event, context),
  warn: (event: string, context: Record<string, unknown> = {}) => ship('warn', event, context),
  error: (event: string, context: Record<string, unknown> = {}) => ship('error', event, context),

  // Call on graceful shutdown so the last batch isn't lost. The Nitro
  // plugin at server/plugins/logger.ts wires this to the `close` hook
  // — and only when hasAxiom is true.
  flush: async () => {
    if (!hasAxiom) return
    const axiom = await getAxiom()
    if (axiom) await axiom.flush()
  },
}
