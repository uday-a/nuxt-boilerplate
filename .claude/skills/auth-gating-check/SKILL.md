---
name: auth-gating-check
description: Use this skill when adding, modifying, or reviewing any server route (`server/api/**`, `server/routes/**`), page (`app/pages/**`), or middleware (`app/middleware/**`) in this Nuxt boilerplate. Verifies the auth posture: does the new endpoint require a session? Does an admin route check `requireRole('admin')`? Did a page accidentally ship without `definePageMeta({ middleware: 'auth' })`? Trigger phrases include "add an API route", "new endpoint", "admin page", "protect this route", "is this route public", or any change to files under `server/api/`, `server/routes/`, or `app/pages/`.
---

# auth-gating-check

The boilerplate enforces auth on **every protected surface explicitly**. There is no global "everything-is-private-by-default" wrapper — Nuxt page-level middleware and Nitro per-route guards are opt-in. This is fine if you remember to opt in. It's a vulnerability the moment you don't.

This skill is the "did you remember to opt in" check.

## The auth model

| Layer | Mechanism | Where to wire it |
|---|---|---|
| Pages (`app/pages/**`) | Page-level middleware via `definePageMeta({ middleware: 'auth' })` | Every protected page declares it. |
| Server routes (`server/api/**`, `server/routes/**`) | `await requireUserSession(event)` (auth) + `requireRole(event, 'admin')` for admin (helpers in `server/utils/guards.ts`) | Top of the handler body. |
| Public marketing pages (landing, pricing, terms, privacy) | `definePageMeta({ auth: false, layout: false })` | Explicit opt-out makes intent visible. |
| Login/signup/forgot pages | `auth: false` + redirect to `/dashboard` if already `loggedIn` | Top of the script setup. |

## Routes that MUST be private

Anything under these prefixes is sensitive by default. If you add one, it must be gated:

- `app/pages/dashboard/**`
- `app/pages/settings/**`
- `app/pages/projects/**` (workspace data)
- `app/pages/onboarding/**`
- `server/api/me*`, `server/api/admin/**`, `server/api/protected/**`
- Anything reading `useUserSession`'s `user` and returning it to the client

## Routes that MAY be public

- Landing (`/`), pricing, terms, privacy, support (read-only).
- `/login`, `/sign-up`, `/forgot-password`, `/mfa` — auth entry points.
- `/invite/[token]` — token IS the auth.
- Mock API endpoints under `server/api/mock/**` — but **only in dev**; before shipping, gate or delete.

## The checklist

For every file in the diff that matches one of these patterns, verify:

### `app/pages/**/*.vue`

```
[ ] If the page is under a private prefix (dashboard/, settings/, projects/, onboarding/, admin/),
    `definePageMeta({ middleware: 'auth' })` is present.
[ ] If the page is public, `definePageMeta({ auth: false })` is present (explicit opt-out).
[ ] If the page reads user data (`useUserSession()`), it either gates on `loggedIn` OR
    is protected by middleware.
[ ] No server-only data fetched at the top of script setup without a session check.
```

### `server/api/**/*.ts` and `server/routes/**/*.ts`

```
[ ] First non-import line is `await requireUserSession(event)` (or, for admin endpoints,
    `await requireRole(event, 'admin')`) — unless the route is intentionally public.
[ ] If public, a comment at the top explains why (e.g. "OAuth callback — auth is the act of
    completing this handler").
[ ] No reading of `event.context.session.user` without going through `requireUserSession`.
[ ] Responses use `server/utils/response.ts` envelope (`ok()`, `apiError()`); not raw objects
    that might leak shape changes.
[ ] No `event.context.session` data is logged or returned in error envelopes.
```

### `app/middleware/**/*.ts`

```
[ ] Middleware is named in `app/middleware/<name>.ts` and referenced by string in
    `definePageMeta({ middleware: '<name>' })` — not auto-applied globally.
[ ] No global `auth` middleware in `app/middleware/auth.global.ts` — this boilerplate
    uses opt-in page-level middleware. A `.global.ts` would short-circuit landing/legal.
```

### Demo mode considerations

The demo session (`server/routes/auth/demo.post.ts`) creates a user with `role: 'admin'`. Anything gated on `requireRole(event, 'admin')` is **wide open in demo mode**.

```
[ ] If your route exposes irreversible action (delete user, change billing, send email),
    do NOT rely on role gating alone — also check `event.context.session.demo !== true`
    OR set `NUXT_DEMO_MODE=false` in any environment where these actions are real.
[ ] If your route is read-only (list users, view stats), demo-admin is acceptable.
```

## Verification commands

```bash
# 1. Every private page declares middleware
grep -L "middleware:.*auth" app/pages/dashboard/**/*.vue app/pages/settings/**/*.vue app/pages/projects/**/*.vue

# 2. Every server API handler under protected/admin/me calls a guard
grep -L "requireUserSession\|requireRole" server/api/admin/**/*.ts server/api/protected/**/*.ts server/api/me*.ts

# 3. No global middleware files accidentally created
ls app/middleware/*.global.ts 2>/dev/null   # should be empty
```

Each of those commands should print no filenames. If any does, gating is missing.

## Common ways this goes wrong

1. **Page created via copy-paste from `/login.vue`** — keeps `auth: false`, lands under `/dashboard`, becomes publicly readable.
2. **API route created without `requireUserSession`** — works fine in dev (your cookie is set), serves user data to the open internet in prod.
3. **Admin route created with only `requireUserSession`, not `requireRole`** — any signed-in user (including demo) hits the admin endpoint.
4. **Mock data route shipped to prod** — anything in `server/api/mock/**` is a candidate for leaking seed data. Delete or gate before deploy.
5. **`useFetch` on a public page that pulls from a private endpoint** — the page is public, but the endpoint requires session; SSR will fail. Fix the page, not the endpoint.

## Refusal conditions

If a diff adds a server route or protected page **without** the explicit auth wiring above and the user hasn't said "this is meant to be public", stop and ask. Do not silently let an ungated endpoint ship.

Sample refusal:
> The new route `server/api/admin/users.delete.ts` doesn't call `requireRole(event, 'admin')`. This would let any signed-in user (including demo) delete users. Did you mean to gate it, or is this intentionally public?
