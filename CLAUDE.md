# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Nuxt dev server on http://localhost:3000 (reuse if already running; do not kill).
- `npm run build` — production build.
- `npm run preview` — preview production build locally.
- `npm run generate` — static generate.
- `npm install` runs `nuxt prepare` postinstall (regenerates `.nuxt/tsconfig.*`).
- No `lint` / `test` scripts are defined. Typecheck via `npx nuxi typecheck` if needed.
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
- `app/middleware/auth.ts` is a **page-level** middleware (opt in via `definePageMeta({ middleware: 'auth' })`). It currently has `const BYPASS = true` so auth is short-circuited for previewing protected pages without logging in — flip back to `false` once OAuth is configured. It uses `useUserSession().loggedIn` and redirects to `/login?next=…`.
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

`.env.example` lists required keys: `NUXT_SESSION_PASSWORD`, `NUXT_OAUTH_GITHUB_CLIENT_ID`, `NUXT_OAUTH_GITHUB_CLIENT_SECRET`, `DATABASE_URL`, `NUXT_PUBLIC_SITE_URL`. GitHub OAuth callback URL is `http://localhost:3000/auth/github`. `DATABASE_URL` is optional for the OAuth path but required for everything that calls `useDb()` and for any `drizzle-kit` command.

## Notable gotchas

- `pathPrefix: false` means two components with the same filename in different subfolders **collide** — rename one.
- The auth middleware bypass (`BYPASS = true`) is intentional during boilerplate development; don't "fix" it without checking with the user.
- `.pilot-backup/` holds moved pages awaiting a registry-driven rebuild — ignore unless asked.
- `app/composables/kanbanData.ts` is ~30k of seed data; don't try to read or edit it in full unless needed.
