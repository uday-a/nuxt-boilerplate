import { env, hasPolar } from './env'

// Polar SDK client. Lazy-imported per the boilerplate's gating
// convention (CLAUDE.md → "Gating modules and plugins on env"): the
// @polar-sh/sdk module never enters V8 unless POLAR_ACCESS_TOKEN is
// set.
//
// Use via `await getPolar()` from any server route. Returns `null`
// when Polar isn't configured — callers should surface a friendly
// "billing not configured" message rather than crashing.

type PolarClient = {
  checkouts: {
    create(input: {
      products: string[]
      successUrl?: string
      externalCustomerId?: string
      customerEmail?: string
      metadata?: Record<string, string | number | boolean>
    }): Promise<{ id: string, url: string }>
  }
  customerSessions: {
    create(input: { externalCustomerId: string }): Promise<{ customerPortalUrl: string }>
  }
}

let polarPromise: Promise<PolarClient | null> | null = null

export function getPolar(): Promise<PolarClient | null> {
  if (!hasPolar) return Promise.resolve(null)
  if (!polarPromise) {
    polarPromise = import('@polar-sh/sdk').then(({ Polar }) =>
      new Polar({
        accessToken: env.POLAR_ACCESS_TOKEN!,
        server: env.POLAR_SERVER,
      }) as unknown as PolarClient,
    )
  }
  return polarPromise
}

// Map our internal plan keys to Polar product IDs. Edit this when
// adding plans — slot env vars then `productIdForPlan('foo')` lights
// it up everywhere (checkout, webhook routing, UI).
export type Plan = 'pro' | 'team' | 'enterprise'

export function productIdForPlan(plan: Plan): string | null {
  switch (plan) {
    case 'pro': return env.POLAR_PRO_PRODUCT_ID ?? null
    case 'team': return env.POLAR_TEAM_PRODUCT_ID ?? null
    case 'enterprise': return env.POLAR_ENTERPRISE_PRODUCT_ID ?? null
  }
}

// Inverse: given a product ID from a webhook, figure out which plan
// it represents. Returns null for unknown products (e.g. one-off line
// items that aren't on the subscription tier ladder).
export function planForProductId(productId: string): Plan | null {
  if (productId === env.POLAR_PRO_PRODUCT_ID) return 'pro'
  if (productId === env.POLAR_TEAM_PRODUCT_ID) return 'team'
  if (productId === env.POLAR_ENTERPRISE_PRODUCT_ID) return 'enterprise'
  return null
}
