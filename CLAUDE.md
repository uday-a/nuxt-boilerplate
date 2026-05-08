# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project skills

This repo ships agent skills at `.claude/skills/` that enforce the boilerplate's conventions. They activate automatically based on the trigger phrases in their `description:` frontmatter — invoke them when the trigger matches:

- **`uipkge-first`** — before adding any UI primitive. Routes to `npx shadcn-vue add @uipkge/<name>` over hand-rolling.
- **`add-page`** — when creating any `app/pages/**/*.vue`. Picks layout, middleware, useHead correctly.
- **`auth-gating-check`** — when touching `server/api/**`, `server/routes/**`, `app/pages/**`, or `app/middleware/**`. Verifies auth posture.
- **`secret-exposure-check`** — before commit when env / runtimeConfig / logs changed. Catches the four canonical Nuxt leak vectors.
- **`logger-conventions`** — any log statement in `server/**`. Enforces dot-namespaced event names, structured fields, no PII.
- **`response-envelope`** — any new/modified `server/api/**` handler. Forces `apiHandler` + `ok()` / `apiError()` over raw responses.
- **`error-handling`** — any try/catch, throw, or rethrow. Enforces typed errors, no silent swallow, no leaked stack traces.
- **`i18n-keys`** — any `t('…')` / `$t('…')` call added/modified. Enforces key parity across en.json and es.json.
- **`db-migration`** — when `server/db/schema.ts` changes. Forces `drizzle-kit generate` and surfaces destructive ops.
- **`shipping-check`** — when the user signals "done" / "ready to commit". Runs lint + typecheck + knip + jscpd + boundary check.

See `.claude/skills/README.md` for the rationale and how the skills relate to the tool-side enforcement (lefthook, commitlint, knip, jscpd, zod env).

## Commands

- `npm run dev` — Nuxt dev server on http://localhost:3000 (reuse if already running; do not kill).
- `npm run build` — production build.
- `npm run preview` — preview production build locally.
- `npm run generate` — static generate.
- `npm run lint` / `npm run lint:fix` — ESLint flat config via `@nuxt/eslint`.
- `npm run typecheck` — `vue-tsc --noEmit` via `nuxi typecheck`.
- `npm run knip` — unused files/exports/deps.
- `npm run duplicates` — `jscpd` copy-paste detection. Threshold 2.5%.
- `npm install` runs `nuxt prepare` + `lefthook install` via postinstall.
- Git hooks (lefthook): pre-commit runs `eslint --fix` on staged files; commit-msg runs commitlint (Conventional Commits).
- Drizzle (no npm-script wrappers; invoke directly):
  - `npx drizzle-kit generate` — emit SQL into `server/db/migrations/`.
  - `npx drizzle-kit migrate` — apply migrations against `DATABASE_URL`.
  - `npx drizzle-kit studio` — local schema browser.

## Architecture

**Nuxt 4** with the `app/` directory split. `compatibilityDate: 2025-07-15`. TypeScript via project references — root `tsconfig.json` points at the four generated `.nuxt/tsconfig.*.json` projects (app, server, shared, node). Do not put `compilerOptions` in the root `tsconfig.json`.

### Frontend (`app/`)

- `app/components/` is registered with `pathPrefix: false` — component filenames map directly to PascalCase auto-imports with no directory prefix (e.g. `blocks/AuthSignIn.vue` → `<AuthSignIn />`, not `<BlocksAuthSignIn />`). Rename collisions accordingly.
- Three component buckets:
  - `components/ui/` — shadcn-vue (style `new-york`, base color `neutral`) consumed via the `@uipkge` registry declared in `components.json`. Add components with `npx shadcn-vue add @uipkge/<name>`. Each ui dir exports via `index.ts`.
  - `components/blocks/` — composed page sections (auth forms, dashboard layout, sidebar, hero/cta/pricing variants, kanban, command palette, etc.).
  - `components/kanban/` — kanban-specific pieces.
- `app/layouts/dashboard.vue` wraps content in `<DashboardLayout>` and derives breadcrumbs from `route.path`. It reads `useUserSession()` and dispatches profile-menu / command-palette intents to the router.
- `app/pages/` — file-based routing; nested folders (`dashboard/`, `settings/`, `documentation/`, `projects/`, `playground/`, `models/`, `feedback/`, `support/`) define nested routes.
- `app/middleware/auth.ts` is a **page-level** middleware (opt in via `definePageMeta({ middleware: 'auth' })`). Enforces real auth: unauthenticated requests redirect to `/login?next=…`. Demo mode (see graceful-degradation matrix below) keeps the boilerplate clickable without configuring OAuth.
- `app/lib/utils.ts` exports `cn()` (clsx + tailwind-merge) — the only shared frontend util.
- `app/composables/`:
  - `useTheme.ts` — three-state theme (`light` | `dark` | `system`) persisted to the **cookie** `uipkge-theme` (not localStorage). Cookie chosen so SSR and the inline boot script agree on the initial value and avoid hydration mismatch.
  - `useKanban.ts` + `kanbanData.ts` drive the kanban demo.

### Theme / FOUC

`server/plugins/theme.ts` is a Nitro plugin that injects a synchronous inline `<script>` into the SSR `<head>`. It reads the `uipkge-theme` cookie (and `prefers-color-scheme` for `system`) and toggles `dark` on `<html>` before paint. If you rename the cookie key, change it in **both** `server/plugins/theme.ts` and `app/composables/useTheme.ts`.

### Backend (`server/`)

- **Auth**: `nuxt-auth-utils` module. Session lives in an encrypted cookie (`NUXT_SESSION_PASSWORD`). GitHub OAuth handler at `server/routes/auth/github.get.ts` uses `defineOAuthGitHubEventHandler`; on success it upserts into `users` and stores `{ id, login, name, email, avatar }` in the session. Logout is `POST /auth/logout` (`clearUserSession`). DB upsert is wrapped in try/catch so OAuth still works without `DATABASE_URL` — keep that behavior when extending.
- **DB**: Drizzle + `postgres-js`. `server/db/index.ts` exports `useDb()` as a lazy singleton (HMR-safe). `server/db/schema.ts` defines `users` keyed on `githubId` (the stable GitHub user id) — this row is where app-owned data hangs, since the session itself is client-side. Import from server routes via `~~/server/db`.
- Migrations land in `server/db/migrations/` (config in `drizzle.config.ts`).

### Path aliases

- `@/…` → `app/…` (Nuxt default for the app dir).
- `~~/…` → repo root (use for `server/` imports from server code).
- shadcn-vue aliases in `components.json`: `@/components`, `@/composables`, `@/lib/utils`, `@/components/ui`, `@/lib`.

## Conventions

- Indent: 2 spaces. No semicolons. Single quotes. Match neighbors — formatting is enforced by example, not by a linter.
- Imports: dedupe — most Vue / Nuxt symbols are auto-imported. Don't re-import `ref`, `computed`, `useRoute`, `useRouter`, `useCookie`, `useUserSession`, `navigateTo`, `defineNuxtRouteMiddleware`, `defineNitroPlugin`, `defineEventHandler`, etc.
- Comments in this codebase explain **why** (e.g. why theme uses a cookie, why DB is a lazy singleton). Preserve that style; don't strip them when editing.
- Project conventions when adding UI: prefer adding a shadcn-vue component from the `@uipkge` registry over hand-rolling. Compose blocks from ui primitives.

## Environment

All env vars are zod-validated at boot via `server/utils/env.ts`. Missing/invalid values throw with a friendly error; partial pairs (e.g. `AXIOM_TOKEN` without `AXIOM_DATASET`) also throw. Import `env` from there instead of reading `process.env` directly.

### Graceful degradation matrix

The boilerplate is designed so a fresh `git clone` + `npm run dev` works without signing up for anything. Each external service degrades independently:

| Env var(s) | Unset behavior | Set behavior |
|---|---|---|
| `NUXT_SESSION_PASSWORD` | **Boot fails** — required (32+ chars). Generate via `openssl rand -base64 32`. | Sessions encrypted. |
| `NUXT_OAUTH_GITHUB_CLIENT_ID` + `_SECRET` | Demo mode auto-activates in dev. `/login` shows "Continue as demo user". | GitHub OAuth available; demo button disappears in production. |
| `NUXT_DEMO_MODE` | Auto: on in dev when OAuth unset, off in production. | `true` = always on (public previews). `false` = always off (hardens prod). |
| `DATABASE_URL` | OAuth handler skips DB upsert silently; `useDb()` throws if called. | Drizzle queries run; user upsert on signin. |
| `I18NOW_PROJECT_ID` (+ `I18NOW_API_KEY`) | `@i18now/nuxt` module not registered; `@nuxtjs/i18n` serves local `i18n/locales/*.json` only. | Translations also pulled from CDN, dev-time auto-sync of new keys. |
| `AXIOM_TOKEN` + `AXIOM_DATASET` | Logger prints to consola only (no shipping). | Logger ships structured events; Nitro plugin flushes on shutdown. |
| `NUXT_PUBLIC_SITE_URL` | Defaults to `http://localhost:3000`. | SEO/sitemap/OAuth redirects use the value. |
| `NUXT_INITIAL_ADMIN_LOGINS` | All new GitHub users default to `role='user'`. | Listed logins are created as `admin` on first sign-in (DB is source of truth after that). |

Rule when adding a new external integration: it must follow the same pattern — optional env, graceful no-op when absent, fail-loud when partially configured.

### Gating modules and plugins on env

Any module or plugin tied to an external service must **only activate when its env key is present**. Three concrete patterns are in use; pick the one that fits the integration:

1. **Conditional module registration** in `nuxt.config.ts` — for build-time Nuxt modules whose mere presence has cost (extra build hooks, extra dep loaded).
   ```ts
   modules: [
     '@nuxtjs/i18n',
     ...(process.env.I18NOW_PROJECT_ID ? ['@i18now/nuxt'] : []),
   ]
   ```
2. **Early-return in Nitro plugins** — when the plugin registers a hook that's a no-op without the service. See `server/plugins/logger.ts`: skips `nitroApp.hooks.hook('close', ...)` when `hasAxiom` is false.
3. **Dynamic `import()` of the SDK** — when the cost is bundle weight / cold-start latency. See `server/utils/logger.ts`: `@axiomhq/js` is `import('@axiomhq/js')` inside a lazy `getAxiom()` so it never resolves when the token is absent.

Anti-pattern: registering a module unconditionally and relying on it to "do nothing" without its key. Some modules (e.g. `nuxt-og-image`) crash at boot when their dependencies aren't installed; some bloat the bundle measurably; some inject runtime work even when idle. Gate at registration time, not inside the module.

When adopting Sentry, PostHog, or any future integration: follow pattern (1) at minimum; add (3) if the SDK is heavy.

## Notable gotchas

- `pathPrefix: false` means two components with the same filename in different subfolders **collide** — rename one.
- `.pilot-backup/` holds moved pages awaiting a registry-driven rebuild — ignore unless asked.
- `app/composables/kanbanData.ts` is ~30k of seed data; don't try to read or edit it in full unless needed.
- The demo session sets `role: 'admin'`. Real production should set `NUXT_DEMO_MODE=false`.
