---
name: logger-conventions
description: Use this skill when adding or modifying any server-side log statement in this Nuxt boilerplate — including `console.log`, `console.warn`, `console.error`, or `logger.*` calls in `server/**`, `app/middleware/**`, or any Nitro plugin. Enforces structured logging via `server/utils/logger.ts`: dot-namespaced event names, no PII / no secrets in context fields, consola for dev-only diagnostic noise. Trigger phrases include "log this", "add logging", "what's logging", "console.log", "console.warn", "logger.info", "track this event".
---

# logger-conventions

The boilerplate has one logger: `server/utils/logger.ts`. Use it for anything you want preserved in production logs. Use `console.*` for ad-hoc dev diagnostics that you'd delete before commit.

## The two-channel rule

| Channel | Use for | Why |
|---|---|---|
| `logger.info / warn / error / debug` from `~~/server/utils/logger` | Anything you want in production logs or Axiom | Goes to consola AND ships to Axiom when configured; structured fields are queryable. |
| `console.log / warn / error` | Temporary debug. Delete before commit. | Doesn't go to Axiom. Doesn't have structured fields. Fine for "what's in this object right now" inside a 5-minute debug loop, terrible for retained logs. |

If you find yourself writing `console.log` in a file you're about to commit, **rewrite it to `logger.*`** or **delete it**.

## Event-name convention

Every log call's first argument is a **dot-namespaced event name**, not a freeform sentence:

```ts
logger.info('auth.github.signin', { login, role })   // ✓
logger.error('db.query.failed', { table: 'users', error: e.message })   // ✓
logger.warn('rate_limit.exceeded', { ip, endpoint })   // ✓
```

Not:

```ts
logger.info('User signed in with GitHub', { login })   // ✗ — not queryable
logger.error(`Failed to query users: ${e.message}`)   // ✗ — string-interpolated, no structured fields
```

**Format:** `<scope>.<sub-scope?>.<action>` — verbs in past tense for completed events (`signin`, `created`), present tense for state (`opened`, `pending`).

Existing namespaces in the codebase:

- `auth.github.*` — GitHub OAuth flow
- `auth.demo.*` — demo mode sign-in
- `db.*` — Drizzle queries
- Add new ones freely, but reuse existing top-level scopes.

## Context-field rules

The second argument is a `Record<string, unknown>` that becomes top-level fields in the Axiom event. **What goes in matters.**

### Always safe

- IDs and short identifiers (`userId`, `login`, `requestId`, `traceId`)
- Enums and counts (`role`, `count`, `attempts`, `tier`)
- Booleans and flags (`success`, `cached`, `firstSignin`)
- Error metadata you control (`error.message`, `error.code`)

### Conditionally safe

- Email addresses — fine for B2B contexts where the email IS the identifier; redact for consumer apps.
- IP addresses — fine for security events (`auth.failed_attempts`, `rate_limit.exceeded`); avoid in normal traffic logs.
- URLs — fine if internal paths only; scrub query strings that may contain tokens.

### Never log

- Passwords (raw or hashed) — never. There is no legitimate "but I need to debug it" reason.
- Session cookies, JWTs, OAuth tokens, API keys — would persist secrets in your log store.
- Full `event.context.session` blob — contains the user object plus internal flags.
- Full request bodies if the endpoint accepts secrets (payment, MFA, password reset).
- Stripe customer IDs / payment intent IDs in plaintext — these are pseudo-secret; OK for tracing if your log store is access-controlled, hash otherwise.

## Levels

| Level | When | Example |
|---|---|---|
| `debug` | Verbose diagnostics, off in prod | `logger.debug('cache.miss', { key })` |
| `info` | Normal operational event worth keeping | `logger.info('auth.signin', { login, role })` |
| `warn` | Recoverable problem, system kept going | `logger.warn('axiom.flush.dropped_batch', { size })` |
| `error` | Failed operation, user-visible or data-integrity impact | `logger.error('db.query.failed', { table, error: e.message })` |

If you're tempted to invent a 5th level: don't. Use the `event` name to express severity granularity (`auth.signin.suspicious` vs `auth.signin`).

## Where to put the log call

- **After the action, with the result.** Not before — that pollutes logs with attempts that never happened.
- **In the catch block** for errors, with `error.message` (and `error.code` for Drizzle / Postgres). Never log a raw `Error` instance — it serialises poorly across the wire.
- **In Nitro plugins / middleware**: import from `~~/server/utils/logger`.
- **In `defineEventHandler` bodies**: same import. The Nitro plugin at `server/plugins/logger.ts` wires the flush-on-shutdown hook automatically.

## Client-side logging

There is no client-side logger in this boilerplate (Axiom from the browser would expose the token). If you need to capture client errors, add Sentry's browser SDK as a separate concern — not via this logger.

For client-side dev diagnostics, use `console.log` and delete before commit. The eslint config doesn't warn on `console.log` because it's useful in `<script setup>` debugging, but it shouldn't survive a feature commit.

## Verification

When reviewing a diff that touches logs:

```bash
# 1. No raw console.log in tracked server code
grep -rn "console\.log" server/ 2>/dev/null   # should be empty for committed code

# 2. logger calls have the dot-namespace pattern
grep -rEn "logger\.(info|warn|error|debug)\(" server/ app/ 2>/dev/null \
  | grep -v "logger\.\(info\|warn\|error\|debug\)([\"']\w\+\(\.\w\+\)\+[\"']"
# any line here is using a freeform string for the event name — fix it

# 3. No banned context fields
grep -rEn "logger\.(info|warn|error|debug).*?(password|secret|token|cookie|jwt)" server/ app/ 2>/dev/null
# should be empty unless explicitly approved (e.g. logging that a token WAS rotated, not the token itself)
```

## Soft refusal

If a diff adds `console.*` calls to `server/**` (other than the bootstrap `console.error` in `env.ts` which fires before the logger exists), refuse and rewrite as `logger.*`. Don't ship `console.log` to prod.
