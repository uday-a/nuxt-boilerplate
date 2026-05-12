import { apiError, apiHandler } from '~~/server/utils/response'
import { requireAuth } from '~~/server/utils/guards'
import { getPolar } from '~~/server/utils/polar'
import { logger } from '~~/server/utils/logger'

// Create a Polar customer-portal session for the signed-in user.
// Returns the portal URL — the client should redirect to it.
//
// The portal lets the customer change/cancel their plan and manage
// payment methods. Polar identifies the customer by our user.id via
// `externalCustomerId` (set at checkout time).

export default apiHandler(async (event) => {
  const session = await requireAuth(event)

  if (session.demo === true) {
    throw apiError('FORBIDDEN', 'Demo sessions don\'t have a billing portal.')
  }

  const polar = await getPolar()
  if (!polar) {
    throw apiError('INTERNAL', 'Billing is not configured. Set POLAR_ACCESS_TOKEN + POLAR_WEBHOOK_SECRET.')
  }

  try {
    const portal = await polar.customerSessions.create({
      externalCustomerId: String(session.user.id),
    })
    logger.info('billing.portal.created', { userId: session.user.id })
    return { url: portal.customerPortalUrl }
  }
  catch (e) {
    // 404 from Polar means the user has never checked out — no
    // customer record exists. Surface that as a 404 in our envelope
    // so the client can offer a checkout CTA instead.
    const message = (e as { message?: string }).message ?? ''
    if (message.toLowerCase().includes('not found') || message.includes('404')) {
      throw apiError('NOT_FOUND', 'No active subscription. Start one from the pricing page first.')
    }
    logger.error('billing.portal.failed', {
      userId: session.user.id,
      error: (e as Error).message,
    })
    throw apiError('INTERNAL', 'Could not open the billing portal. Try again later.')
  }
})
