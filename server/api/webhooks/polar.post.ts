import { useDb, schema } from '~~/server/db'
import { env, hasPolar } from '~~/server/utils/env'
import { logger } from '~~/server/utils/logger'

// Polar webhook receiver. Hosts the source of truth for subscription
// state — we never write to subscriptions table from anywhere else.
//
// Key decisions:
//
// 1. Raw body. Signature verification hashes the exact bytes Polar
//    sent. h3's readBody() parses JSON; readRawBody() returns the
//    untouched buffer.
//
// 2. No envelope. Webhooks aren't called by our client — they're
//    called by Polar. Polar wants HTTP 2xx on success, 4xx on signature
//    failure, 5xx on anything else (it'll retry). Returning the
//    `{ ok, data }` envelope would be wasted bytes; bare status codes
//    are the contract.
//
// 3. Idempotent. Polar retries on 5xx. Every event we handle uses
//    upsert / onConflictDoUpdate so re-delivery is safe.
//
// 4. We resolve user-from-event via `externalCustomerId` set at
//    checkout time. New event types added later need to match that
//    same convention (or fall back to looking up by customer.email).

export default defineEventHandler(async (event) => {
  if (!hasPolar) {
    // No secret configured = no way to verify; refuse rather than
    // accept unsigned traffic.
    setResponseStatus(event, 503)
    return 'Polar webhook secret not configured'
  }

  const rawBody = await readRawBody(event)
  if (!rawBody) {
    setResponseStatus(event, 400)
    return 'Missing body'
  }

  // The webhook SDK helpers live behind a dynamic import so the SDK
  // stays unbundled when hasPolar is false at build time. See
  // server/utils/polar.ts for the matching pattern on the API client.
  const { validateEvent, WebhookVerificationError } = await import('@polar-sh/sdk/webhooks')

  let polarEvent: { type: string, data: any }
  try {
    polarEvent = validateEvent(
      rawBody,
      getRequestHeaders(event) as Record<string, string>,
      env.POLAR_WEBHOOK_SECRET!,
    ) as { type: string, data: any }
  }
  catch (e) {
    if (e instanceof WebhookVerificationError) {
      logger.warn('billing.webhook.invalid_signature')
      setResponseStatus(event, 403)
      return 'Invalid signature'
    }
    throw e
  }

  // Resolve our user from the event. Polar attaches our externalCustomerId
  // (set at checkout) to the customer record; it's the same on every event
  // for the customer's lifetime.
  const data = polarEvent.data
  const externalCustomerId = data?.customer?.externalId ?? data?.customerExternalId ?? null
  const userId = externalCustomerId ? Number.parseInt(String(externalCustomerId), 10) : null

  // Subscription events: upsert our row.
  if (polarEvent.type.startsWith('subscription.')) {
    if (!userId || Number.isNaN(userId)) {
      // No mapping → log + 202 (we accept the event but can't act).
      // Returning a 5xx would make Polar retry forever.
      logger.warn('billing.webhook.no_external_customer_id', { type: polarEvent.type })
      setResponseStatus(event, 202)
      return ''
    }

    try {
      const db = useDb()
      await db
        .insert(schema.subscriptions)
        .values({
          userId,
          polarCustomerId: data.customerId,
          polarSubscriptionId: data.id,
          productId: data.productId,
          status: data.status,
          currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : null,
          cancelAtPeriodEnd: Boolean(data.cancelAtPeriodEnd),
          canceledAt: data.canceledAt ? new Date(data.canceledAt) : null,
        })
        .onConflictDoUpdate({
          target: schema.subscriptions.userId,
          set: {
            polarCustomerId: data.customerId,
            polarSubscriptionId: data.id,
            productId: data.productId,
            status: data.status,
            currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : null,
            cancelAtPeriodEnd: Boolean(data.cancelAtPeriodEnd),
            canceledAt: data.canceledAt ? new Date(data.canceledAt) : null,
            updatedAt: new Date(),
          },
        })

      logger.info('billing.webhook.subscription_upserted', {
        type: polarEvent.type,
        userId,
        status: data.status,
        productId: data.productId,
      })
    }
    catch (e) {
      // 5xx → Polar retries with exponential backoff. Most retry storms
      // come from a missing migrations table; the operator sees the
      // error and runs `drizzle-kit migrate`.
      logger.error('billing.webhook.db_upsert_failed', {
        type: polarEvent.type,
        userId,
        error: (e as Error).message,
      })
      setResponseStatus(event, 500)
      return 'DB error'
    }
  }
  else {
    // Other event types (order.*, customer.*, etc.) — log but don't act.
    // Add a case here when you need to react to one of them.
    logger.info('billing.webhook.ignored', { type: polarEvent.type })
  }

  setResponseStatus(event, 202)
  return ''
})
