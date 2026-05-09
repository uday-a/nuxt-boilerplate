import { z } from 'zod'

// Centralized, zod-validated server-side env access. Import `env` from here
// instead of reading `process.env` directly so we get:
//   1. a single source of truth for which vars exist
//   2. fail-fast on boot if a required var is missing or malformed
//   3. typed access (no `string | undefined` noise at call sites)
//
// Optional vars stay optional — we still want the boilerplate to boot in
// "preview mode" without OAuth or a real database.

const Env = z.object({
  // Required: session cookie crypto. nuxt-auth-utils enforces this too, but
  // we surface a friendlier message at boot.
  NUXT_SESSION_PASSWORD: z
    .string()
    .min(32, 'NUXT_SESSION_PASSWORD must be at least 32 characters (e.g. `openssl rand -base64 32`)'),

  // GitHub OAuth — both keys must be set together, or neither.
  NUXT_OAUTH_GITHUB_CLIENT_ID: z.string().min(1).optional(),
  NUXT_OAUTH_GITHUB_CLIENT_SECRET: z.string().min(1).optional(),

  // Postgres — optional. Without it the OAuth handler skips the user
  // upsert and the DB singleton stays uninitialized.
  DATABASE_URL: z.string().url().optional(),

  // Public site URL — used by emails, OAuth redirects, and the SEO module.
  NUXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),

  // Comma-separated GitHub logins bootstrapped as admins on first sign-in.
  NUXT_INITIAL_ADMIN_LOGINS: z.string().optional(),

  // i18now — translations CDN.
  I18NOW_PROJECT_ID: z.string().optional(),
  I18NOW_API_KEY: z.string().optional(),

  // Axiom — optional structured log shipping. Without a token, the logger
  // util prints to consola only and ships nothing.
  AXIOM_TOKEN: z.string().optional(),
  AXIOM_DATASET: z.string().optional(),
  AXIOM_ORG_ID: z.string().optional(),

  // PostHog — optional product analytics. Both env values are public by
  // design (PostHog's client SDK reads them in the browser). When the
  // key is unset, the client plugin no-ops and posthog-js is never
  // imported into the bundle (see app/plugins/posthog.client.ts).
  NUXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NUXT_PUBLIC_POSTHOG_HOST: z.string().url().default('https://us.i.posthog.com'),

  // Demo mode: lets the /login page mint a session for a fake user so a
  // fresh fork is fully clickable without a GitHub OAuth app or DB.
  //   - 'true'  → always on (even in prod — useful for public previews)
  //   - 'false' → always off (recommended for real production)
  //   - unset   → auto: on when OAuth isn't configured and we're not in
  //               production. See `isDemoMode` below.
  NUXT_DEMO_MODE: z.enum(['true', 'false']).optional(),

  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

const parsed = Env.safeParse(process.env)
if (!parsed.success) {
  // Stderr + throw — Nitro logs the throw on startup and exits.
  console.error('\n❌ Invalid environment variables:\n')
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`)
  }
  console.error()
  throw new Error('Invalid environment. Fix the values above (see .env.example) and restart.')
}

export const env = parsed.data

// Convenience flag: paired OAuth credentials present?
export const hasGithubOAuth = Boolean(
  env.NUXT_OAUTH_GITHUB_CLIENT_ID && env.NUXT_OAUTH_GITHUB_CLIENT_SECRET,
)

// Convenience flag: Axiom shipping requires both a token AND a dataset.
// Either alone is a misconfiguration we'd rather fail loudly on.
export const hasAxiom = Boolean(env.AXIOM_TOKEN && env.AXIOM_DATASET)
if (env.AXIOM_TOKEN && !env.AXIOM_DATASET) {
  throw new Error('AXIOM_TOKEN is set but AXIOM_DATASET is not. Set both, or unset both.')
}
if (env.AXIOM_DATASET && !env.AXIOM_TOKEN) {
  throw new Error('AXIOM_DATASET is set but AXIOM_TOKEN is not. Set both, or unset both.')
}

// Convenience flag: PostHog is on when a project key is set.
export const hasPostHog = Boolean(env.NUXT_PUBLIC_POSTHOG_KEY)

// Demo mode resolves to:
//   - explicit 'true'/'false' if set
//   - otherwise: ON when OAuth isn't configured AND we're not in production.
// The intent: a fresh `git clone` + `npm run dev` should let you click
// through every protected page without signing up for anything.
export const isDemoMode = env.NUXT_DEMO_MODE === 'true'
  || (env.NUXT_DEMO_MODE !== 'false' && !hasGithubOAuth && env.NODE_ENV !== 'production')
