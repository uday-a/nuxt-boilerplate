# Nuxt 4 SaaS Boilerplate — Starter Kit with Vue 3, TypeScript, Tailwind CSS 4 & shadcn-vue

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Nuxt 4](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt&logoColor=white)](https://nuxt.com)
[![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

A production-grade **Nuxt 4 SaaS boilerplate and starter kit** built with **Vue 3, TypeScript, Tailwind CSS 4 and shadcn-vue** (via the [`@uipkge`](https://uipkge.dev) registry). It ships authentication (GitHub OAuth, magic link, 45+ swappable OAuth providers), role-based access control, team invites, API keys, Polar billing, Drizzle ORM + Postgres, Resend email, i18n, Sentry, PostHog, Axiom logging and a full admin dashboard. **Every external integration is gated on env**, so a fresh clone runs today in demo mode; adding credentials switches each service on. No accounts needed to start.

- 🌟 **Live demo:** [nuxt-boilerplate.uipkge.dev](https://nuxt-boilerplate.uipkge.dev) — click *"Continue as demo user"* on `/login`
- 🎨 **UI registry:** [uipkge.dev](https://uipkge.dev) — the components and blocks this app is built from
- ⚛️ **Prefer React?** The sibling [Next.js boilerplate](https://github.com/uday-a/next-boilerplate) uses the same registry

![Nuxt 4 SaaS boilerplate dashboard preview](./.github/assets/dashboard.png)

<details>
<summary><b>📸 More screenshots — 5 pages</b></summary>

### Kanban board (`/dashboard/kanban`)

![Kanban board](./.github/assets/kanban.png)

### Data table (`/dashboard/data-table`)

![Data table](./.github/assets/data-table.png)

### Calendar (`/dashboard/calendar`)

![Calendar](./.github/assets/calendar.png)

### Public landing (`/`)

![Landing page](./.github/assets/landing.png)

### Sign-in (`/login` — demo mode active)

![Login page](./.github/assets/login.png)

</details>

### At a glance

- 🔐 **Authentication** — GitHub OAuth, passwordless magic link, demo mode, encrypted cookie sessions, 45+ OAuth providers one file away
- 🛡 **Admin & RBAC** — `user` / `admin` / `editor` roles enforced server-side, admin user list, roles & permissions matrix, team invites
- 🔑 **API keys** — hashed, scoped, revocable, managed in settings
- 💳 **Billing** — Polar checkout, customer portal, signature-verified webhooks
- 💾 **Database** — Drizzle ORM + Postgres (Neon, Supabase, RDS, local), versioned migrations
- 📊 **Dashboard** — KPI tiles, charts, data table, kanban, calendar, inbox, activity feed, office map, UI kit browser
- 🎨 **Theming** — light / dark / system with zero flash, 13 colour themes, 5 radius presets, 4 icon packs, command palette (⌘K), product tour
- 🌐 **i18n** — English + Spanish, 500+ keys at full parity, optional i18now CDN sync
- 📈 **Observability** — Sentry, PostHog, Axiom structured logs, audit log
- 🔍 **SEO** — sitemap, robots, OG images, schema.org via `@nuxtjs/seo`
- 🧪 **Quality** — Vitest, Playwright, ESLint, `vue-tsc`, knip, jscpd, Lefthook + commitlint, GitHub Actions CI

```bash
git clone https://github.com/uday-a/nuxt-boilerplate my-app
cd my-app
npm install
echo "NUXT_SESSION_PASSWORD=$(openssl rand -base64 32)" > .env
npm run dev
# → http://localhost:3000
```

That's it. The app runs in **demo mode** with no database, no OAuth app and no API keys. Add env vars when you're ready to enable real services.

---

## 🚀 Features

### Pages and app surface

| Area | Routes | Notes |
|---|---|---|
| **Marketing** | `/`, `/pricing`, `/terms`, `/privacy` | Hero, features, bento, logos, testimonials, FAQ, CTA, contact, header/footer blocks; pricing buttons start a Polar checkout |
| **Auth** | `/login`, `/sign-up`, `/forgot-password`, `/mfa` | GitHub OAuth, magic link, demo sign-in. `/mfa` is a UI screen only (no TOTP backend yet) |
| **Onboarding** | `/onboarding` | Three-step stepper (profile → workspace → invite) |
| **Invites** | `/invite/[token]` | Verifies and accepts a team invite token |
| **Dashboard** | `/dashboard` | KPI stat tiles, bar / funnel / treemap charts, first-run product tour |
| | `/dashboard/messages` | Inbox with folders, search, compose and reply |
| | `/dashboard/kanban` | Drag-and-drop kanban board |
| | `/dashboard/data-table` | TanStack Table: sorting, faceted filters, pagination, column visibility, CSV export, row detail timeline |
| | `/dashboard/calendar` | Month calendar with events |
| | `/dashboard/activity` | Live audit-log feed (falls back to a demo heatmap without a DB) |
| | `/dashboard/locations` | Leaflet office map with markers, arcs and time zones |
| | `/dashboard/forms`, `/dashboard/form-example` | TanStack Form + Zod validated forms |
| | `/dashboard/ui-kit` | Searchable catalog of every installed component and block with live demos |
| **Projects** | `/projects`, `/projects/[slug]` | DB-backed CRUD, scoped to the signed-in owner |
| **Settings** | `/settings/{general,account,security,notifications,team,api-keys,billing,integrations,limits,activity}` | Profile, team members + invites, API keys, subscription + portal, audit log; security / notifications / integrations / limits are UI-only |
| **Admin** | `/admin/users`, `/admin/roles` | Admin-only (route middleware + server guard). Roles page is a demo permissions matrix |
| **Help** | `/support`, `/feedback` | Feedback is emailed to `EMAIL_OPS` and audit-logged |

Pages that use seeded sample data (kanban, data table, calendar, messages, locations, parts of billing / limits / roles) show a `DemoDataBanner` or mark the swap point with a comment, so you know exactly where to plug in your own API.

### Developer experience

- ✅ **Nuxt 4** with the `app/` directory split and `compatibilityDate: 2025-07-15`
- ✅ **TypeScript** project references — root `tsconfig.json` composes the generated app, server, shared and node configs
- ✅ **Auto-imports** for components (`pathPrefix: false`), composables, Vue/Nuxt symbols
- ✅ **ESLint** flat config via `@nuxt/eslint` — 2-space indent, no semicolons, single quotes
- ✅ **Lefthook** git hooks — `eslint --fix` on staged files, `commitlint` (Conventional Commits)
- ✅ **`knip`** dead-code detection and **`jscpd`** copy-paste detection
- ✅ **`zod`-validated env** at boot — partial configs fail loud with friendly errors

### Frontend

- ✅ **Tailwind CSS 4** via the official `@tailwindcss/vite` plugin
- ✅ **[`@uipkge`](https://uipkge.dev) registry** — shadcn-vue-compatible primitives, blocks and charts. See [UI components](#-ui-components--uipkge-registry).
- ✅ **Reka UI** — the headless layer shadcn-vue is built on
- ✅ **TanStack Form**, **TanStack Table**, **vue-echarts**, **Tiptap**, **Leaflet**, **vue-sonner** toasts

### Backend (Nitro)

- ✅ **Typed API envelope** — every `server/api/**` route returns `{ ok: true, data }` or `{ ok: false, error: { code, message, details? } }` via `apiHandler()` + `ok()` / `apiError()`
- ✅ **Structured error codes** — `UNAUTHORIZED` / `FORBIDDEN` / `NOT_FOUND` / `VALIDATION_FAILED` / `RATE_LIMITED` / `INTERNAL`; HTTP status derived from code
- ✅ **`requireAuth()` / `requireRole()`** guards — role re-read from the DB on every call (the session cookie role is never trusted for authorization)
- ✅ **Rate limiting** — `requireRateLimit()` in-memory sliding window (30 req/min/IP by default) on demo sign-in, magic link, team invites and API-key minting
- ✅ **Structured logger** — dot-namespaced events (`auth.github.signin`, `db.query.failed`), optional Axiom shipping
- ✅ **Audit log** — `recordAudit()` writes key events (sign-in, projects, API keys, invites, feedback) to `audit_logs`; surfaced at `/settings/activity` and `/dashboard/activity`
- ✅ **Example routes** — public `/api/ping`, authed `/api/me`, role-gated `/api/protected/stats`

---

## 🛠 Tech stack

| Layer | Library |
|---|---|
| Framework | [Nuxt 4](https://nuxt.com) (Vue 3, TypeScript) |
| Auth | [`nuxt-auth-utils`](https://github.com/atinux/nuxt-auth-utils) — 45+ OAuth providers |
| ORM / DB | [Drizzle ORM](https://orm.drizzle.team) + [postgres-js](https://github.com/porsager/postgres) (Neon serverless driver included) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) via `@tailwindcss/vite` |
| Components | [shadcn-vue](https://www.shadcn-vue.com) (`@uipkge` registry) on [Reka UI](https://reka-ui.com) |
| Forms / Tables | [TanStack Form](https://tanstack.com/form) + [TanStack Table](https://tanstack.com/table) |
| Editor | [Tiptap](https://tiptap.dev) |
| Charts | [vue-echarts](https://vue-echarts.dev) (ECharts) |
| Maps | [Leaflet](https://leafletjs.com) |
| Icons | [Lucide](https://lucide.dev), [Hugeicons](https://hugeicons.com), [Phosphor](https://phosphoricons.com), [Tabler](https://tabler.io/icons) (switchable) |
| Billing | [Polar.sh](https://polar.sh) |
| Email | [Resend](https://resend.com) |
| Errors | [Sentry](https://sentry.io) |
| Analytics | [PostHog](https://posthog.com) |
| Logs | [Axiom](https://axiom.co) + [consola](https://github.com/unjs/consola) |
| i18n | [`@nuxtjs/i18n`](https://i18n.nuxtjs.org) + optional [i18now](https://i18now.com) |
| SEO | [`@nuxtjs/seo`](https://nuxtseo.com) |
| Validation | [Zod](https://zod.dev) |
| Testing | [Vitest](https://vitest.dev) + [Playwright](https://playwright.dev) |

---

## 📋 Requirements

- **Node 22+** (developed on 24)
- **npm** (lockfile is `package-lock.json`)
- *Optional:* a Postgres URL (Neon free tier works) — only needed for persistence

---

## ⚡ Quick start

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

This applies migrations `0000` → `0004` in order. Without `DATABASE_URL`, auth flows still work — the upsert step silently no-ops, and `useDb()` throws only if called.

### 4. Run

```bash
npm run dev        # http://localhost:3000
npm run build      # production build
npm run preview    # preview production build
npm run generate   # static generate (if you want pre-rendered output)
```

---

## 🔐 Authentication

Powered by [`nuxt-auth-utils`](https://github.com/atinux/nuxt-auth-utils). Sessions are encrypted cookies — no Redis, and no Postgres required just to keep a user logged in. Pages opt in with `definePageMeta({ middleware: 'auth' })`.

Wired out of the box:

- ✅ **GitHub OAuth** — `server/routes/auth/github.get.ts`; upserts the user, sends a welcome email on first sign-in, records an audit event
- ✅ **Magic link** — SHA-256-hashed tokens, single-use, 15-minute TTL, delivered via Resend (printed to the dev log without a key); `/forgot-password` reuses the same flow
- ✅ **Demo mode** — one-click sign-in with no OAuth app or DB. Demo sign-in mints an **admin** session, so it is auto-on only in local development (`NODE_ENV=development`, i.e. `npm run dev`) and off everywhere else unless `NUXT_DEMO_MODE=true`
- ✅ **Admin bootstrap** — `NUXT_INITIAL_ADMIN_LOGINS` lists GitHub usernames created as `role='admin'` on first sign-in
- ✅ **Logout** — `GET` and `POST /auth/logout`

### 45+ OAuth providers ready to swap

`nuxt-auth-utils` (0.5.x) ships built-in handlers for **47 named OAuth providers plus a generic OIDC handler**. Swap or add one with a single event-handler file and two env vars.

<details>
<summary><b>Show all providers</b></summary>

| | | | |
|---|---|---|---|
| Apple | Atlassian | Auth0 | Authentik |
| Azure AD B2C | Battle.net | Box | Cognito |
| Discord | Dropbox | Facebook | Gitea |
| GitHub ✓ | GitLab | Google | Heroku |
| HubSpot | Instagram | Keycloak | Kick |
| LINE | Linear | LinkedIn | LiveChat |
| Microsoft | Okta | Ory | osu! |
| PayPal | Polar | Riot Games | Roblox |
| Salesforce | Seznam | Shopify Customer | Slack |
| Spotify | Steam | Strava | TikTok |
| Twitch | VK | WorkOS | X (Twitter) |
| XSUAA | Yandex | Zitadel | Generic OIDC |

</details>

To add Google:

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

> **MFA:** `/mfa` and the TOTP toggle in `/settings/security` are UI only. Wire them to a TOTP library before relying on them.

---

## 🛡 Admin & RBAC

- ✅ **Roles** — `user`, `admin`, `editor`, stored as a Postgres enum so the DB rejects unknown values
- ✅ **Server-side enforcement** — `requireRole(event, 'admin', ...)` re-reads the role from the DB on every call
- ✅ **Route middleware** — `middleware: ['auth', 'role']` + `requiredRole` in page meta keeps non-admins out of `/admin/*` (the server guard is the real gate)
- ✅ **Admin users** — `/admin/users` lists users from `/api/admin/users`
- ✅ **Roles & permissions** — `/admin/roles` is a demo permissions matrix (owner / admin / editor / viewer / billing) backed by `app/lib/rbac-mock.ts`, ready to wire to your own permission model
- ✅ **Team invites** — hashed single-use tokens (7-day TTL), invite email via Resend, role applied on acceptance, admin/editor-only, rate-limited
- ✅ **API keys** — `uipkge_`-prefixed, SHA-256 stored, scoped (`read` / `write`), revocable, managed at `/settings/api-keys`. Use `verifyApiKey()` from `server/utils/api-keys.ts` to authenticate your own routes with them

---

## 💳 Billing (Polar)

- ✅ **Checkout** — `POST /api/billing/checkout` mints a Polar checkout session for the `pro`, `team` or `enterprise` plan
- ✅ **Customer portal** — `POST /api/billing/portal` for self-service plan changes and cancellations
- ✅ **Signature-verified webhook** — `/api/webhooks/polar` validates the raw body with the Polar SDK and is the *only* writer to the `subscriptions` table (Polar is the source of truth)
- ✅ **Subscription status** — `/api/me/subscription` feeds `/settings/billing`
- ✅ Customers linked to internal users via `externalCustomerId = users.id`
- ✅ Sandbox / production toggle via `POLAR_SERVER`

---

## 💾 Database (Drizzle ORM + Postgres)

- ✅ **Drizzle ORM** + **`postgres-js`** with a lazy singleton (HMR-safe)
- ✅ Works against **Neon**, **Supabase pooler**, **Railway**, **RDS**, or local Postgres
- ✅ Schema in `server/db/schema.ts` — `users`, `projects`, `subscriptions`, `magic_link_tokens`, `api_keys`, `audit_logs`, `invites`
- ✅ Five migrations versioned in `server/db/migrations/` (`drizzle-kit generate` + `drizzle-kit migrate`)
- ✅ OAuth handlers no-op DB writes when `DATABASE_URL` is unset — sessions still work

---

## 📧 Email (Resend)

- ✅ **Templates** — `welcomeEmail`, `magicLinkEmail`, `inviteEmail`, `feedbackEmail`
- ✅ **Dev fallback** — without `RESEND_API_KEY`, emails print to the dev server log
- ✅ **Ops inbox** — in-app forms deliver to `EMAIL_OPS` (falls back to `EMAIL_FROM`)
- ✅ **Lazy-imported SDK** — zero weight when disabled

---

## 🌐 Internationalization (i18n)

- ✅ **`@nuxtjs/i18n`** with local JSON locales — English and Spanish, 500+ keys each, at full parity
- ✅ **Locale switcher** in the dashboard header
- ✅ Optional **`@i18now/nuxt`** CDN sync — only registered when `I18NOW_PROJECT_ID` is set
- ✅ `no_prefix` strategy — no `/en/` URL slugs

---

## 🎨 Theming, dark mode & UX

- ✅ **Three-state theme** (`light` / `dark` / `system`) persisted to a cookie and applied by an SSR inline script — **zero flash of the wrong theme**
- ✅ **Theme customizer** — 13 colour themes and 5 corner-radius presets, cookie-backed and applied during SSR
- ✅ **Icon pack switcher** — Lucide, Hugeicons, Phosphor or Tabler, app-wide
- ✅ **Command palette** — ⌘K / Ctrl K to jump to any page or setting
- ✅ **Product tour** — first-run guided tour on `/dashboard`
- ✅ **Dashboard shell** — collapsible sidebar, team switcher, breadcrumbs, notifications popover, profile menu

---

## 📊 Observability & analytics

- ✅ **Sentry** — error monitoring, session replay and tracing (module only registered when a DSN is set)
- ✅ **PostHog** — pageviews + autocapture (client plugin no-ops without a key)
- ✅ **Axiom** — structured log shipping (SDK lazy-imported, never bundled when off)
- ✅ **consola** stdout fallback when nothing is configured

---

## 🔍 SEO

- ✅ **`@nuxtjs/seo`** — sitemap, robots, OG image generation (`satori` + `@resvg/resvg-js`), schema.org, link checker
- ✅ Authenticated routes (`/dashboard`, `/settings`, `/projects`, `/admin`, `/onboarding`, `/invite`, `/mfa`) excluded from the sitemap
- ✅ Per-page `useHead` for title / description / OG meta
- ✅ `site.url` comes from `NUXT_PUBLIC_SITE_URL`

---

## 🧩 UI components — @uipkge registry

This boilerplate is wired to the [**`@uipkge`**](https://uipkge.dev) registry — a shadcn-vue-compatible distribution of primitives, blocks and charts. Everything installs with the standard shadcn-vue CLI, lands in `app/components/`, and is yours to edit (no runtime dependency, no lock-in).

```bash
npx shadcn-vue add @uipkge/<name>
```

### What's installed

| Category | In this repo |
|---|---|
| **Elements** (48 folders) | accordion, avatar, badge, breadcrumb, button, calendar, card, checkbox, collapsible, command, context-menu, dialog, dropdown-menu, empty-state, file-upload, form, input, pin-input, popover, progress, radio-group, range-calendar, select, sheet, sidebar, skeleton, slider, sonner (toasts), switch, table, tabs, textarea, theme-switch, toggle, toggle-group, tooltip, tour, leaflet-map, rich-text-editor, kpi-grid, page, ... |
| **Blocks** | sign-in, sign-up, password reset, MFA, dashboard layout + sidebar, command palette, kanban board, hero, features, bento, logos, testimonials, pricing, FAQ, CTA, contact, header, footer, theme customizer, locale switcher, notifications popover, stat tile, usage bar |
| **Charts** | area, bar, line, pie, radar, scatter, funnel, gauge, heatmap, calendar heatmap, treemap, sparkline, raw ECharts — themed for light and dark |
| **Forms** | TanStack-Form-wrapped, Zod-validated field components |
| **Tables** | TanStack-Table data tables — sorting, faceted filters, pagination, column visibility |
| **Editor** | Tiptap rich-text editor (links, placeholders, task lists, text-align, underline) |

Browse what's installed in the app at `/dashboard/ui-kit`. `npm run catalog:sync` refreshes that catalog from the registry and `npm run catalog:scan` records where each component is used.

### Registry config

Already wired in [`components.json`](./components.json):

```json
{
  "registries": {
    "@uipkge": "https://uipkge.dev/r/nuxt/{name}.json"
  }
}
```

The `.claude/skills/uipkge-first` skill routes Claude Code to `npx shadcn-vue add @uipkge/<name>` instead of hand-rolling a primitive.

> 🔗 Browse the full catalog at **[uipkge.dev](https://uipkge.dev)**

---

## 🎚 Env-gated integrations

Every external integration is optional:

| Env var(s) | Unset behavior | Set behavior |
|---|---|---|
| `NUXT_SESSION_PASSWORD` | **Boot fails** — required (32+ chars) | Sessions encrypted |
| `NUXT_OAUTH_GITHUB_CLIENT_ID` + `_SECRET` | GitHub sign-in unavailable (demo sign-in still works in dev) | GitHub OAuth available |
| `NUXT_DEMO_MODE` | On only when `NODE_ENV=development`; off in every deployment (prod, preview, staging) | `true` / `false` overrides. `true` lets anyone sign in as an **admin** |
| `NUXT_INITIAL_ADMIN_LOGINS` | No auto-admins | Listed GitHub users created as admin |
| `DATABASE_URL` | OAuth handler skips DB upsert silently | Drizzle queries run; user upsert on sign-in |
| `RESEND_API_KEY` + `EMAIL_FROM` (+ `EMAIL_OPS`) | Mailer prints to consola | Real delivery via Resend |
| `POLAR_ACCESS_TOKEN` + `POLAR_WEBHOOK_SECRET` (+ `POLAR_SERVER`, `POLAR_*_PRODUCT_ID`) | `/api/billing/*` returns INTERNAL with an instructive message | Checkout + portal + webhooks |
| `AXIOM_TOKEN` + `AXIOM_DATASET` (+ `AXIOM_ORG_ID`) | Logger stdout only | Structured events shipped |
| `NUXT_PUBLIC_SENTRY_DSN` (+ `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`) | `@sentry/nuxt` module not registered | Server + client init, replay + traces, sourcemap upload |
| `NUXT_PUBLIC_POSTHOG_KEY` (+ `_HOST`) | Client plugin no-ops; chunk never fetched | Pageviews + autocapture |
| `I18NOW_PROJECT_ID` (+ `_API_KEY`) | Local JSON only | CDN sync + dev-time auto-pull |
| `NUXT_PUBLIC_SITE_URL` | Defaults `http://localhost:3000` | SEO, sitemap, OAuth redirects, email links use it |

**Rule when adding a new integration:** optional env, graceful no-op when absent, fail loud when partially configured.

---

## ⚙️ API conventions

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

## 🧪 Testing & quality gates

```bash
npm run test          # Vitest unit tests (jsdom) — composables, lib utils, UI components
npm run test:e2e      # Playwright e2e — landing, auth flow, dashboard (starts `nuxt dev` if BASE_URL is unset)
npm run lint          # ESLint flat config
npm run typecheck     # vue-tsc via nuxi
npm run knip          # unused files / exports / deps
npm run duplicates    # jscpd copy-paste detection
```

- **CI** — `.github/workflows/ci.yml` runs lint, typecheck and build on pushes and PRs to `main`
- **Lefthook** pre-commit runs `eslint --fix` on staged files; commit-msg runs `commitlint` (Conventional Commits)
- **Claude Code** — the `.claude/skills/` directory enforces conventions interactively during edits

---

## 🤖 AI / Claude Code integration

- ✅ **10 project-level skills** at `.claude/skills/` — `response-envelope`, `auth-gating-check`, `secret-exposure-check`, `db-migration`, `i18n-keys`, `logger-conventions`, `shipping-check`, `add-page`, `error-handling`, `uipkge-first`
- ✅ **3 external skills** pinned via `skills-lock.json` — `nuxt`, `vue`, `reka-ui`
- ✅ Skills route Claude to the right primitives, prevent ad-hoc auth bypasses, enforce env-var safety, and verify migrations before commit

---

## 🚀 Deployment

Nitro is hosting-agnostic — anywhere Node, Edge, or Workers runs.

> [!WARNING]
> **Demo mode (`NUXT_DEMO_MODE`) is an auth bypass.** "Continue as demo user" creates an **ADMIN** session for anyone who clicks it. It is auto-on **only in local development** (`npm run dev`); every deployment — production, preview and staging alike — has it off by default. To offer a public demo you must set `NUXT_DEMO_MODE=true` explicitly in that deployment's environment. Otherwise leave it unset or set it to `false`.

### Vercel *(recommended for fastest setup)*

**One-click deploy** — two steps, ~60 seconds:

**Step 1.** Generate a session password in your terminal (the only required env var) and copy the output:

```bash
openssl rand -base64 32
```

**Step 2.** Click the button → paste the value into the `NUXT_SESSION_PASSWORD` prompt → deploy:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/uday-a/nuxt-boilerplate&env=NUXT_SESSION_PASSWORD&envDescription=Paste%20the%20output%20of%3A%20openssl%20rand%20-base64%2032&envLink=https://github.com/uday-a/nuxt-boilerplate%23-quick-start&project-name=nuxt-boilerplate&repository-name=nuxt-boilerplate)

Vercel forks the repo into your GitHub, imports it as a project, prompts for `NUXT_SESSION_PASSWORD`, builds + deploys. Every subsequent `git push` to `main` re-deploys automatically.

**Or via CLI:**

```bash
npm i -g vercel
vercel link
vercel env add NUXT_SESSION_PASSWORD production    # paste a 32+ char value
vercel --prod
```

Either path: zero config — Nitro auto-detects the `vercel` preset. The Node runtime supports `postgres-js` TCP out of the box.

### Cloudflare Workers

Requires swapping the DB driver (Workers has no raw TCP). Two paths:

1. **Neon HTTP** — change `server/db/index.ts` to `drizzle-orm/neon-http` (~10 lines). `@neondatabase/serverless` is already in `package.json`.
2. **Hyperdrive** — keep `postgres-js`, bind Hyperdrive in `wrangler.toml`. No code changes.

Set `nitro.preset = 'cloudflare-module'` in `nuxt.config.ts`.

### Netlify / Bun / Node / self-host

`npm run build` → `node .output/server/index.mjs`. Same Node runtime; same Postgres path. Use the corresponding Nitro preset.

### Production checklist

- [ ] Generate a *fresh* `NUXT_SESSION_PASSWORD` (never reuse dev).
- [ ] Set `NUXT_PUBLIC_SITE_URL` to your real domain.
- [ ] Leave `NUXT_DEMO_MODE` unset or `false` (it's off by default outside dev). Only set `true` on a deliberate public demo — it grants an admin session to anyone.
- [ ] Register OAuth callback URL: `https://<host>/auth/<provider>`.
- [ ] Register Polar webhook: `https://<host>/api/webhooks/polar`.
- [ ] Apply migrations `0000` → `0004` against production `DATABASE_URL`.
- [ ] Verify `EMAIL_FROM` is a verified Resend sender.
- [ ] Rate limits are per-instance and in-memory — move to a shared store if you run many instances.

---

## 📁 Project structure

```
.
├── app/                      # frontend (Vue 3)
│   ├── components/
│   │   ├── ui/               # shadcn-vue primitives + charts from @uipkge
│   │   ├── blocks/           # composed sections (auth, dashboard layout, marketing, ...)
│   │   ├── kanban/           # kanban-specific pieces
│   │   └── ui-kit/           # /dashboard/ui-kit finder + demos
│   ├── composables/          # useTheme, useColorTheme, useIconPack, useKanban, ...
│   ├── data/                 # UI catalog data
│   ├── layouts/              # dashboard (authed shell)
│   ├── middleware/           # auth, role (page-level, opt-in)
│   ├── pages/                # file-based routing
│   ├── plugins/              # posthog.client.ts
│   └── lib/                  # cn(), icon pack, colour themes, mock data helpers
│
├── server/                   # backend (Nitro)
│   ├── api/                  # apiHandler-wrapped routes returning ApiResponse<T>
│   │   └── webhooks/         # Polar (exempt from envelope)
│   ├── routes/auth/          # github, magic-link, demo, logout (not under /api)
│   ├── db/                   # drizzle schema, migrations, lazy singleton
│   ├── plugins/              # theme cookie script, logger flush
│   └── utils/                # env, guards, rate-limit, audit, api-keys, tokens, logger, mailer, response, polar
│
├── i18n/locales/             # en.json, es.json
├── shared/types/             # types shared between app + server
├── e2e/                      # Playwright specs
├── scripts/                  # icon-pack + UI-catalog generators
├── .github/workflows/        # CI
├── .claude/skills/           # project-level Claude Code skills
├── nuxt.config.ts
├── drizzle.config.ts
├── components.json           # shadcn-vue config
└── .env.example
```

Auto-imports use `pathPrefix: false` — `blocks/AuthSignIn.vue` is `<AuthSignIn />` (not `<BlocksAuthSignIn />`). Filename collisions across subfolders **will clash** — rename one.

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

For admin-only pages use `middleware: ['auth', 'role'], requiredRole: 'admin'` and guard the API with `requireRole()`.

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

See [Authentication](#-authentication) — one handler file + two env vars.

---

## 🔗 Related projects

- [**uipkge.dev**](https://uipkge.dev) — the UI registry this boilerplate is built on
- [**next-boilerplate**](https://github.com/uday-a/next-boilerplate) — the Next.js / React sibling of this starter

---

## 📝 Contributing

PRs welcome. Conventional Commits required (`commitlint` runs on commit-msg). For non-trivial changes, open an issue first.

---

## 📄 License

MIT — see [LICENSE](./LICENSE).

---

## 💖 Acknowledgments

- [Nuxt](https://nuxt.com) team for the framework
- [`nuxt-auth-utils`](https://github.com/atinux/nuxt-auth-utils) by [@atinux](https://github.com/atinux) for the auth layer and its OAuth providers
- [shadcn-vue](https://www.shadcn-vue.com) + [`@uipkge`](https://uipkge.dev) for the component system
- [Drizzle](https://orm.drizzle.team) for the ORM
