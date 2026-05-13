# nuxt-boilerplate

A production-leaning Nuxt 4 starter for SaaS apps. Auth, database, billing, email, analytics, error monitoring, i18n, and a shadcn-vue component layer — all wired but each gated on env so a fresh clone runs without configuring anything.

```bash
git clone <this-repo> my-app
cd my-app
npm install
npm run dev
```

Visit `http://localhost:3000` → click "Continue as demo user" → every protected page is reachable. Then start swapping the env keys you want to enable real services.

## What you get

| Concern | Library | Off by default | Enable |
|---|---|---|---|
| Framework | Nuxt 4 (`app/` dir, project-reference tsconfigs) | n/a | n/a |
| UI primitives | shadcn-vue (`new-york` / `neutral`) via the `@uipkge` registry | n/a | `npx shadcn-vue add @uipkge/<name>` |
| Auth — OAuth | `nuxt-auth-utils` + GitHub | demo session in dev | `NUXT_OAUTH_GITHUB_CLIENT_ID` + `_SECRET` |
| Auth — magic link | Resend-delivered, SHA-256 hashed, single-use, 15-min TTL | yes | `RESEND_API_KEY` |
| Database | Drizzle + `postgres-js`, lazy singleton | yes | `DATABASE_URL` |
| Billing | Polar.sh — checkout, customer portal, signature-verified webhooks | yes | `POLAR_ACCESS_TOKEN` + `POLAR_WEBHOOK_SECRET` |
| Email | Resend, lazy-imported SDK | consola fallback | `RESEND_API_KEY` |
| Translations | `@nuxtjs/i18n` + optional `@i18now/nuxt` CDN sync | local JSON only | `I18NOW_PROJECT_ID` |
| Logging | consola + optional Axiom shipping | stdout only | `AXIOM_TOKEN` + `AXIOM_DATASET` |
| Errors | optional `@sentry/nuxt` (module conditionally registered) | yes | `NUXT_PUBLIC_SENTRY_DSN` |
| Analytics | optional `posthog-js` (dynamic-imported when key set) | yes | `NUXT_PUBLIC_POSTHOG_KEY` |
| SEO | `@nuxtjs/seo` — sitemap, robots, OG image, schema | active | `NUXT_PUBLIC_SITE_URL` |
| Theming | Three-state (`light` / `dark` / `system`) via cookie + SSR inline script (no FOUC) | active | n/a |

Every external integration follows the same rule: optional env, graceful no-op when absent, fail-loud when partially configured. Env is zod-validated at boot via `server/utils/env.ts`.

## Stack

- **Nuxt 4** (`compatibilityDate: 2025-07-15`), Vue 3, TypeScript
- **Drizzle ORM** + Postgres (Neon / Supabase / local)
- **Tailwind v4** via `@tailwindcss/vite`
- **shadcn-vue** primitives via the [`@uipkge`](https://uipkge.com) registry
- **Reka UI** (the headless layer shadcn-vue is built on)
- **TanStack Form**, **TanStack Table**, **vue-echarts**, **Tiptap**, **lucide-vue-next**
- **Polar.sh** for billing
- **Resend** for transactional email
- **Sentry**, **PostHog**, **Axiom** as optional observability layers

## Prerequisites

- Node 22+ (developed on 24)
- npm (lockfile is `package-lock.json`)
- A Postgres URL if you want persistence — Neon's free tier works out of the box

## Quick start

```bash
npm install                          # installs deps + runs nuxt prepare + lefthook install
cp .env.example .env                 # fill in only what you want enabled
openssl rand -base64 32 >> .env      # paste as NUXT_SESSION_PASSWORD (required, 32+ chars)
npm run dev
```

Without OAuth + DB configured, the app boots in **demo mode**: `/login` shows a "Continue as demo user" button that mints a session with `role: 'admin'`. Auto-disables in production.

## Database

Schema lives in `server/db/schema.ts`. Four tables: `users`, `projects`, `subscriptions`, `magic_link_tokens`.

```bash
# After editing schema.ts:
npx drizzle-kit generate    # emits SQL into server/db/migrations/
npx drizzle-kit migrate     # applies against DATABASE_URL
npx drizzle-kit studio      # local schema browser
```

Apply all four migrations (`0000` → `0003`) in order against a fresh database before serving traffic.

## Project layout

```
app/
├── components/
│   ├── ui/          # shadcn-vue primitives from @uipkge
│   ├── blocks/      # composed page sections (auth, dashboard, sidebar, etc.)
│   └── kanban/      # kanban-specific pieces
├── composables/     # useTheme, useKanban, ...
├── layouts/         # dashboard (auth shell), default (public)
├── middleware/      # auth (page-level, opt-in via definePageMeta)
├── pages/           # file-based routing
└── plugins/         # posthog.client.ts, ...

server/
├── api/             # apiHandler-wrapped routes returning ApiResponse<T>
├── routes/          # OAuth + magic-link endpoints (not under /api)
├── db/              # drizzle schema, migrations, lazy singleton
├── plugins/         # nitro plugins (theme cookie, logger flush, ...)
└── utils/           # env, guards, logger, mailer, response envelope, polar
```

Auto-imports are enabled with `pathPrefix: false`, so `blocks/AuthSignIn.vue` is referenced as `<AuthSignIn />` (not `<BlocksAuthSignIn />`). Filename collisions across subfolders will clash — rename one.

## API conventions

Every `server/api/**` handler is wrapped with `apiHandler()` and returns a typed envelope:

```ts
// success
{ ok: true, data: T }
// failure
{ ok: false, error: { code, message, details? } }
```

Throw failures with `apiError(code, message, details?)` where `code` is a member of the `ErrorCode` union (`UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_FAILED`, `RATE_LIMITED`, `INTERNAL`, ...). HTTP status is derived from the code.

Webhook receivers under `server/api/webhooks/**` are intentionally exempt — they return bare status codes because the caller is the external service.

## Auth

Three sign-in paths converge on `setUserSession()`:

1. **GitHub OAuth** — `server/routes/auth/github.get.ts`. Upserts into `users` keyed on `githubId`. Sends welcome email on first sign-in.
2. **Magic link** — `server/routes/auth/magic-link.ts` (H3-style flexible-method). POST emails the link; GET verifies + signs in. Single-use, 15-min TTL, raw token never persisted.
3. **Demo** — `server/routes/auth/demo.post.ts`. 404s outside demo mode.

Logout is `POST /auth/logout` (`clearUserSession`).

Page-level guard: opt in via `definePageMeta({ middleware: 'auth' })`. Server guard: `requireAuth(event)` / `requireRole(event, 'admin')`. Role is re-read from DB on every `requireRole` call — the session cookie's role is **not** trusted for authorization.

## Quality gates

The project ships with the same checks CI runs, plus hooks that run on every commit.

```bash
npm run lint           # ESLint flat config (warnings allowed, 0 errors)
npm run typecheck      # vue-tsc via nuxi
npm run knip           # unused files / exports / deps
npm run duplicates     # jscpd (threshold 2.5%)
```

Lefthook runs `eslint --fix` on staged files (pre-commit) and commitlint (commit-msg, Conventional Commits).

If you use Claude Code, the repo includes agent skills under `.claude/skills/` that enforce conventions in real time: response-envelope, auth-gating-check, secret-exposure-check, db-migration, i18n-keys, logger-conventions, shipping-check, and more. See `.claude/skills/README.md`.

## Deployment

The boilerplate is hosting-agnostic. Anywhere Nitro runs — Node, Vercel, Cloudflare, Netlify, Bun — works.

Pre-deploy checklist:

- [ ] Generate a fresh `NUXT_SESSION_PASSWORD` for production (never reuse dev).
- [ ] Set `NUXT_PUBLIC_SITE_URL` to your real domain (used by OAuth redirects, emails, sitemap).
- [ ] Set `NUXT_DEMO_MODE=false` explicitly to harden the demo route.
- [ ] Register the OAuth callback URL on GitHub: `https://<your-host>/auth/github`.
- [ ] Register the Polar webhook in the Polar dashboard: `https://<your-host>/api/webhooks/polar`.
- [ ] Apply migrations `0000` → `0003` against the production `DATABASE_URL`.
- [ ] Verify `EMAIL_FROM` is a verified domain on Resend (defaults to `onboarding@resend.dev`).

See `.env.example` for the complete env surface and `CLAUDE.md` for the graceful-degradation matrix that documents each integration's behavior when its env is unset.

## License

Not yet specified — add a `LICENSE` file before publishing if you want explicit terms.
