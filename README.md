# 🚀 Nuxt 4 Boilerplate

A production-grade [Nuxt 4](https://nuxt.com) starter for SaaS — auth, database, billing, email, analytics, error monitoring, i18n, structured logging, and a `shadcn-vue` design system. **Every external integration is gated on env** so cloning gives you a working app *today*; configuring services flips them on. No accounts required to start.

🌟 **Live demo**: [nuxt-boilerplate-three.vercel.app](https://nuxt-boilerplate-three.vercel.app) — click *"Continue as demo user"* on `/login` to explore the protected app shell without signing up for anything.

```bash
git clone https://github.com/uday-a/nuxt-boilerplate my-app
cd my-app
npm install
echo "NUXT_SESSION_PASSWORD=$(openssl rand -base64 32)" > .env
npm run dev
# → http://localhost:3000
```

That's it. The boilerplate runs in **demo mode** with no DB, no OAuth app, no API keys. Swap env vars when you're ready to enable real services.

---

## 🚀 Features

### Developer experience

- ✅ **Nuxt 4** with the `app/` directory split and `compatibilityDate: 2025-07-15`
- ✅ **TypeScript** project references — root `tsconfig.json` composes four generated configs (app, server, shared, node)
- ✅ **Auto-imports** for components (`pathPrefix: false`), composables, Vue/Nuxt symbols
- ✅ **ESLint** flat config via `@nuxt/eslint` — 2-space indent, no semicolons, single quotes
- ✅ **Lefthook** git hooks — `eslint --fix` on staged files, `commitlint` (Conventional Commits)
- ✅ **`knip`** — dead-code / unused-export detection
- ✅ **`jscpd`** — copy-paste detection with 2.5% threshold
- ✅ **`zod`-validated env** at boot — partial configs fail loud with friendly errors

### Frontend

- ✅ **Tailwind v4** via the official `@tailwindcss/vite` plugin
- ✅ **[`@uipkge`](https://uipkge.dev) registry** — the entire shadcn-vue surface (primitives + blocks + charts) installable with one CLI command. See [§ UIPKGE](#-uipkge--ready-to-use-elements-blocks--charts) below.
- ✅ **Reka UI** — the headless layer shadcn-vue is built on
- ✅ **Three-state theme** (`light` / `dark` / `system`) — persisted to **cookie** (not localStorage) + SSR inline script. **Zero FOUC**.
- ✅ **TanStack Form** + **TanStack Table** + **vue-echarts** + **Tiptap** + **lucide-vue-next**
- ✅ Pre-built blocks: auth forms (sign-in, sign-up, magic-link, forgot-password), dashboard sidebar (collapsible), kanban board, command palette, pricing tables, hero / CTA / FAQ sections, settings shell, onboarding flow

### Backend (Nitro)

- ✅ **Typed API envelope** — every `server/api/**` route returns `{ ok: true, data }` or `{ ok: false, error: { code, message, details? } }` via `apiHandler()` + `ok()` / `apiError()`
- ✅ **Structured error codes** — `UNAUTHORIZED` / `FORBIDDEN` / `NOT_FOUND` / `VALIDATION_FAILED` / `RATE_LIMITED` / `INTERNAL` — HTTP status derived from code
- ✅ **H3-style flexible handlers** for routes that share heavy setup (auth + resource fetch)
- ✅ **`requireAuth()` / `requireRole()`** guards — role re-read from DB every call (session cookie role is **never** trusted for authorization)
- ✅ **Structured logger** — dot-namespaced events (`auth.github.signin`, `db.query.failed`), optional Axiom shipping
- ✅ **Webhook raw-body handling** — Polar signature verification with timing-safe comparison

### 🔐 Auth — 44 OAuth providers ready to swap

Powered by [`nuxt-auth-utils`](https://github.com/atinux/nuxt-auth-utils). Out of the box, it ships first-party handlers for **44 OAuth providers** — swap the active provider by adding one event-handler file + setting two env vars. No rewriting middleware, session APIs, or DB upserts.

<details>
<summary><b>Click to see all 44 providers</b></summary>

| | | | |
|---|---|---|---|
| Apple | Atlassian | Auth0 | AzureB2C |
| Battle.net | Bluesky | Bungie | Cognito |
| Discord | Dropbox | Facebook | GitHub ✓ |
| GitLab | Google | Hubspot | Instagram |
| Keycloak | LinkedIn | Live | Microsoft |
| Notion | Okta | OneLogin | Paypal |
| Pinterest | Roblox | Salesforce | Seznam |
| Slack | SoundCloud | Spotify | Steam |
| Strava | Stripe | TikTok | Tumblr |
| Twitch | Twitter (X) | Vimeo | VK |
| WorkOS | Yandex | Zalo | Zitadel |

</details>

This boilerplate wires **GitHub** by default. To switch to Google in 3 lines:

```ts
// server/routes/auth/google.get.ts
export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user }) {
    await setUserSession(event, { user: { /* shape your session */ } })
    return sendRedirect(event, '/dashboard')
  },
})
```

```bash
# .env
NUXT_OAUTH_GOOGLE_CLIENT_ID=...
NUXT_OAUTH_GOOGLE_CLIENT_SECRET=...
```

Done. Pages opt into auth with `definePageMeta({ middleware: 'auth' })`. Sessions are HMAC-encrypted cookies via `nuxt-auth-utils` — no Redis, no Postgres required just to keep a user logged in.

Additional auth modes already wired:

- ✅ **Magic-link** sign-in — SHA-256-hashed tokens, single-use, 15-min TTL, delivered via Resend
- ✅ **Demo mode** — public-preview safe, auto-activates in dev when OAuth isn't configured
- ✅ **Admin bootstrap** — `NUXT_INITIAL_ADMIN_LOGINS` env lists GitHub usernames that land as `role='admin'` on first sign-in

### 💾 Database

- ✅ **Drizzle ORM** + **`postgres-js`** with a lazy singleton (HMR-safe)
- ✅ Works against **Neon**, **Supabase pooler**, **Railway**, **RDS**, or local Postgres
- ✅ Schema in `server/db/schema.ts` — `users`, `projects`, `subscriptions`, `magic_link_tokens`
- ✅ Migrations versioned in `server/db/migrations/` (run via `drizzle-kit generate` + `drizzle-kit migrate`)
- ✅ OAuth handlers gracefully no-op DB writes when `DATABASE_URL` is unset — sessions still work

### 💰 Billing — Polar.sh

- ✅ **Checkout** — `/api/billing/checkout` mints a session, redirects to Polar
- ✅ **Customer portal** — self-service plan changes / cancellations
- ✅ **Signature-verified webhook** — `/api/webhooks/polar` is the *only* writer to the `subscriptions` table (Polar is the source of truth)
- ✅ Customers linked to internal users via `externalCustomerId = users.id`
- ✅ Sandbox / production toggle via `POLAR_SERVER`

### 📧 Email — Resend

- ✅ **Templates** — `welcomeEmail`, `magicLinkEmail`, `feedbackEmail`
- ✅ **Dev fallback** — without `RESEND_API_KEY`, emails consola-print to the dev server log (no signup needed to test flows)
- ✅ **Lazy-imported SDK** — adds zero weight when disabled

### 🌐 Internationalization

- ✅ **`@nuxtjs/i18n`** with local JSON locales (`en` + `es` seeded)
- ✅ Optional **`@i18now/nuxt`** CDN sync for translation management — only registered when `I18NOW_PROJECT_ID` is set
- ✅ `no_prefix` strategy by default — no `/en/` URL slugs

### 📊 Observability

- ✅ **Sentry** — error monitoring + session replay + tracing (conditionally registered module)
- ✅ **PostHog** — pageviews + autocapture (client plugin no-ops without key)
- ✅ **Axiom** — structured log shipping (SDK lazy-imported, never bundled when off)
- ✅ **consola** stdout fallback when nothing is configured

### 🔍 SEO

- ✅ **`@nuxtjs/seo`** umbrella — sitemap, robots, OG image generation (via `satori` + `@resvg/resvg-js`), schema.org, link checker
- ✅ Per-page `useHead` for title / description / OG meta
- ✅ `site.url` propagates from `NUXT_PUBLIC_SITE_URL`

### 🤖 AI / Claude Code integration

- ✅ **10 project-level skills** at `.claude/skills/` that enforce boilerplate conventions in real time — `response-envelope`, `auth-gating-check`, `secret-exposure-check`, `db-migration`, `i18n-keys`, `logger-conventions`, `shipping-check`, `add-page`, `error-handling`, `uipkge-first`
- ✅ **3 external skills** pinned via `skills-lock.json` — `nuxt`, `vue`, `reka-ui` (sourced from [skills.sh](https://skills.sh))
- ✅ Skills route Claude to the right primitives, prevent ad-hoc auth bypasses, enforce env-var safety, and verify migrations before commit

---

## 🎨 UIPKGE — ready-to-use elements, blocks & charts

This boilerplate is wired to the [**`@uipkge`**](https://uipkge.dev) registry — a curated shadcn-vue distribution that goes well beyond raw primitives. Everything is installable with the standard shadcn-vue CLI, drops directly into `app/components/ui/`, and is yours to edit (no runtime dependency, no lock-in).

```bash
npx shadcn-vue add @uipkge/<name>
```

### What's in it

| Category | Examples |
|---|---|
| **Elements** | `button`, `input`, `textarea`, `select`, `checkbox`, `radio-group`, `switch`, `slider`, `combobox`, `command`, `date-picker`, `dropdown-menu`, `popover`, `dialog`, `sheet`, `drawer`, `tooltip`, `toast`, `alert`, `badge`, `avatar`, `tabs`, `accordion`, `breadcrumb`, `pagination`, `progress`, `skeleton`, `separator`, ... |
| **Blocks** | Sign-in / sign-up cards, magic-link forms, dashboard sidebars (collapsible), kanban boards, command palettes, pricing tables, hero sections, CTA bands, feature grids, FAQ accordions, settings shells, onboarding stepper, team switcher, profile menus, breadcrumbs, ... |
| **Charts** | Area, bar (stacked + grouped), line, pie, donut, radial, radar, scatter, sparkline — themed for both light + dark, powered by `vue-echarts` |
| **Forms** | TanStack-Form-wrapped field components — validated, accessible, themed |
| **Tables** | TanStack-Table-powered data tables — sortable, filterable, paginated, virtualized variants |
| **Editor** | Tiptap-based rich-text editor (links, placeholders, task lists, text-align, underline) |

### Registry config

Already wired in [`components.json`](./components.json):

```json
{
  "registries": {
    "@uipkge": "https://uipkge.dev/r/{name}.json"
  }
}
```

This means `npx shadcn-vue add @uipkge/<name>` resolves to the UIPKGE distribution instead of (or alongside) the upstream shadcn-vue source. Each addition copies the source into your project — fully owned, fully editable.

### Why this matters

The shadcn-vue philosophy is *"copy the component, don't depend on a package."* UIPKGE extends that with curated, production-grade compositions on top of the primitives — so you get *blocks* (full UI sections like "sign-in card with magic-link fallback") *and* charts *and* tables *and* forms, all using the same design tokens, same theming, same Tailwind v4 setup. No multi-library Frankenstein.

The `.claude/skills/uipkge-first` skill routes Claude Code to `npx shadcn-vue add @uipkge/<name>` over hand-rolling a primitive — so when you ask for "a date picker", the agent installs the right component instead of inventing one from scratch.

> 🔗 Browse the full catalog at **[uipkge.dev](https://uipkge.dev)**

---

## 🛠 Built with

| Layer | Library |
|---|---|
| Framework | [Nuxt 4](https://nuxt.com) (Vue 3, TypeScript) |
| Auth | [`nuxt-auth-utils`](https://github.com/atinux/nuxt-auth-utils) — 44 OAuth providers |
| ORM / DB | [Drizzle ORM](https://orm.drizzle.team) + [postgres-js](https://github.com/porsager/postgres) |
| Styling | [Tailwind v4](https://tailwindcss.com) via `@tailwindcss/vite` |
| Primitives | [shadcn-vue](https://www.shadcn-vue.com) (`@uipkge` registry) on [Reka UI](https://reka-ui.com) |
| Forms / Tables | [TanStack Form](https://tanstack.com/form) + [TanStack Table](https://tanstack.com/table) |
| Editor | [Tiptap](https://tiptap.dev) |
| Charts | [vue-echarts](https://vue-echarts.dev) |
| Icons | [`lucide-vue-next`](https://lucide.dev) |
| Billing | [Polar.sh](https://polar.sh) |
| Email | [Resend](https://resend.com) |
| Errors | [Sentry](https://sentry.io) |
| Analytics | [PostHog](https://posthog.com) |
| Logs | [Axiom](https://axiom.co) + [consola](https://github.com/unjs/consola) |
| i18n | [`@nuxtjs/i18n`](https://i18n.nuxtjs.org) + optional [i18now](https://i18now.com) |
| SEO | [`@nuxtjs/seo`](https://nuxtseo.com) |
| Validation | [Zod](https://zod.dev) |

---

## 📋 Requirements

- **Node 22+** (developed on 24)
- **npm** (lockfile is `package-lock.json`)
- *Optional:* a Postgres URL (Neon free tier works) — required only when you want persistence

---

## 🚀 Getting started

### 1. Clone + install

```bash
git clone https://github.com/uday-a/nuxt-boilerplate my-app
cd my-app
npm install
```

The `postinstall` step runs `nuxt prepare` (generates `.nuxt/tsconfig.*.json`) and `lefthook install` (registers git hooks).

### 2. Environment

```bash
cp .env.example .env
echo "NUXT_SESSION_PASSWORD=$(openssl rand -base64 32)" >> .env
```

Only `NUXT_SESSION_PASSWORD` is *required* (32+ chars). Everything else is optional — see `.env.example` for the full surface with inline docs.

### 3. Database (optional, but recommended)

```bash
# Set DATABASE_URL in .env first (Neon, Supabase, local Postgres, ...)
npx drizzle-kit migrate
```

This applies migrations `0000` → `0003` in order. Without `DATABASE_URL`, auth flows still work — the upsert step silently no-ops, and `useDb()` throws only if called.

### 4. Run

```bash
npm run dev        # http://localhost:3000
npm run build      # production build
npm run preview    # preview production build
npm run generate   # static generate (if you want pre-rendered output)
```

---

## 📁 Project structure

```
.
├── app/                      # frontend (Vue 3)
│   ├── components/
│   │   ├── ui/               # shadcn-vue primitives from @uipkge
│   │   ├── blocks/           # composed page sections (auth, sidebar, kanban, ...)
│   │   └── kanban/           # kanban-specific pieces
│   ├── composables/          # useTheme, useKanban, ...
│   ├── layouts/              # dashboard (auth shell), default (public)
│   ├── middleware/           # auth (page-level, opt-in)
│   ├── pages/                # file-based routing
│   ├── plugins/              # posthog.client.ts, ...
│   └── lib/utils.ts          # cn() (clsx + tailwind-merge)
│
├── server/                   # backend (Nitro)
│   ├── api/                  # apiHandler-wrapped routes returning ApiResponse<T>
│   │   └── webhooks/         # Polar, ... (exempt from envelope)
│   ├── routes/               # OAuth + magic-link endpoints (not under /api)
│   │   └── auth/             # github.get.ts, magic-link.ts, demo.post.ts
│   ├── db/                   # drizzle schema, migrations, lazy singleton
│   ├── plugins/              # nitro plugins (theme cookie, logger flush, ...)
│   └── utils/                # env, guards, logger, mailer, response, polar
│
├── i18n/locales/             # en.json, es.json
├── shared/                   # types shared between app + server
├── public/                   # static assets
├── .claude/skills/           # project-level Claude Code skills
├── nuxt.config.ts
├── drizzle.config.ts
├── components.json           # shadcn-vue config
└── .env.example
```

Auto-imports use `pathPrefix: false` — `blocks/AuthSignIn.vue` is `<AuthSignIn />` (not `<BlocksAuthSignIn />`). Filename collisions across subfolders **will clash** — rename one.

---

## 🎚 Graceful degradation matrix

Every external integration is optional. Each one has three states:

| Env var(s) | Unset behavior | Set behavior |
|---|---|---|
| `NUXT_SESSION_PASSWORD` | **Boot fails** — required (32+ chars) | Sessions encrypted |
| `NUXT_OAUTH_GITHUB_CLIENT_ID` + `_SECRET` | Demo mode auto-on in dev | GitHub OAuth available |
| `NUXT_DEMO_MODE` | Auto (on in dev, off in prod) | `true` / `false` overrides |
| `DATABASE_URL` | OAuth handler skips DB upsert silently | Drizzle queries run; user upsert on signin |
| `RESEND_API_KEY` + `EMAIL_FROM` | Mailer prints to consola | Real delivery via Resend |
| `POLAR_ACCESS_TOKEN` + `POLAR_WEBHOOK_SECRET` | `/api/billing/*` returns INTERNAL with instructive message | Checkout + portal + webhooks |
| `AXIOM_TOKEN` + `AXIOM_DATASET` | Logger stdout only | Structured events shipped |
| `NUXT_PUBLIC_SENTRY_DSN` | `@sentry/nuxt` module not registered | Server + client init, replay + traces |
| `NUXT_PUBLIC_POSTHOG_KEY` | Client plugin no-ops; chunk never fetched | Pageviews + autocapture |
| `I18NOW_PROJECT_ID` (+ `_API_KEY`) | Local JSON only | CDN sync + dev-time auto-pull |
| `NUXT_PUBLIC_SITE_URL` | Defaults `http://localhost:3000` | SEO, sitemap, OAuth redirects use it |

**Rule when adding a new integration:** optional env, graceful no-op when absent, fail-loud when partially configured.

---

## ⚡ API conventions

Every `server/api/**` handler is wrapped:

```ts
// server/api/projects/index.ts
export default apiHandler(async (event) => {
  const user = await requireAuth(event)
  const data = await useDb().select().from(projects).where(eq(projects.ownerId, user.id))
  return ok(data)
})
```

Throw failures with `apiError`:

```ts
if (!project) throw apiError('NOT_FOUND', 'Project not found', { slug })
```

Response envelope:

```ts
// success
{ ok: true, data: T }
// failure
{ ok: false, error: { code, message, details? } }
```

Webhook receivers (`server/api/webhooks/**`) are intentionally exempt — they return bare status codes because the caller is the external service, not our client.

---

## 🧪 Quality gates

```bash
npm run lint          # ESLint flat config (0 errors)
npm run typecheck     # vue-tsc via nuxi
npm run knip          # unused files / exports / deps
npm run duplicates    # jscpd (threshold 2.5%)
```

Lefthook pre-commit runs `eslint --fix` on staged files. Commit-msg runs `commitlint` (Conventional Commits — `feat:`, `fix:`, `chore:`, ...).

If you use Claude Code, the `.claude/skills/` directory enforces conventions interactively during edits.

---

## 🚀 Deployment

Nitro is hosting-agnostic — anywhere Node, Edge, or Workers runs.

### Vercel *(recommended for fastest setup)*

**One-click deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/uday-a/nuxt-boilerplate&env=NUXT_SESSION_PASSWORD&envDescription=32%2B%20char%20random%20string%20for%20session%20cookie%20encryption.%20Generate%20with%20openssl%20rand%20-base64%2032&envLink=https://github.com/uday-a/nuxt-boilerplate%232-environment&project-name=nuxt-boilerplate&repository-name=nuxt-boilerplate)

Forks the repo into your GitHub, imports it as a Vercel project, prompts for `NUXT_SESSION_PASSWORD`, deploys. Every subsequent `git push` to `main` re-deploys automatically.

**Or via CLI:**

```bash
npm i -g vercel
vercel link
vercel env add NUXT_SESSION_PASSWORD production    # paste a 32+ char value
vercel --prod
```

Either path: zero config — Nitro auto-detects the `vercel` preset. Node runtime supports `postgres-js` TCP out of the box.

### Cloudflare Workers

Requires swapping the DB driver (Workers has no raw TCP). Two paths:

1. **Neon HTTP** — change `server/db/index.ts` to `drizzle-orm/neon-http` (~10 lines). `@neondatabase/serverless` is already in `package.json`.
2. **Hyperdrive** — keep `postgres-js`, bind Hyperdrive in `wrangler.toml`. No code changes.

Set `nitro.preset = 'cloudflare-module'` in `nuxt.config.ts`. Cold start ~5ms.

### Netlify / Bun / Node / self-host

`npm run build` → `node .output/server/index.mjs`. Same Node runtime; same Postgres path. Use the corresponding Nitro preset.

### Production checklist

- [ ] Generate a *fresh* `NUXT_SESSION_PASSWORD` (never reuse dev).
- [ ] Set `NUXT_PUBLIC_SITE_URL` to your real domain.
- [ ] Set `NUXT_DEMO_MODE=false` explicitly to harden the demo route.
- [ ] Register OAuth callback URL: `https://<host>/auth/<provider>`.
- [ ] Register Polar webhook: `https://<host>/api/webhooks/polar`.
- [ ] Apply migrations `0000` → `0003` against production `DATABASE_URL`.
- [ ] Verify `EMAIL_FROM` is a verified Resend sender.

---

## 🛠 Customization

### Add a UI primitive

```bash
npx shadcn-vue add @uipkge/button @uipkge/dialog @uipkge/command
```

Components land under `app/components/ui/<name>/`. The `@uipkge` registry is configured in `components.json`.

### Add a page

Drop a Vue file under `app/pages/`. For protected pages:

```vue
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'My page' })
</script>
```

### Add an API route

```ts
// server/api/widgets.get.ts
export default apiHandler(async (event) => {
  const user = await requireAuth(event)
  const widgets = await useDb().select().from(widgetsTable).where(eq(widgetsTable.ownerId, user.id))
  return ok(widgets)
})
```

### Change schema

```bash
# Edit server/db/schema.ts, then:
npx drizzle-kit generate    # emits SQL into server/db/migrations/
npx drizzle-kit migrate     # applies against DATABASE_URL
```

### Switch OAuth provider

See [§ Auth](#-auth--44-oauth-providers-ready-to-swap) — change one handler file + two env vars.

---

## 📝 Contributing

PRs welcome. Conventional Commits required (`commitlint` is in pre-commit). For non-trivial changes, open an issue first.

---

## 📄 License

MIT — see [LICENSE](./LICENSE).

---

## 💖 Acknowledgments

- [Nuxt](https://nuxt.com) team for the framework
- [`nuxt-auth-utils`](https://github.com/atinux/nuxt-auth-utils) by [@atinux](https://github.com/atinux) for the 44-provider auth layer
- [shadcn-vue](https://www.shadcn-vue.com) + [`@uipkge`](https://uipkge.dev) for the component system
- [Drizzle](https://orm.drizzle.team) for the ORM
- [ixartz/Next-js-Boilerplate](https://github.com/ixartz/Next-js-Boilerplate) for the format inspiration
