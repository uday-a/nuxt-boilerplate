---
name: secret-exposure-check
description: Use this skill before committing or pushing changes in this Nuxt boilerplate, and any time the diff touches env handling, `runtimeConfig`, server logs, error responses, or client-side fetches. Catches the four ways secrets leak in a Nuxt 4 + Nitro app: process.env in client code, secrets in `runtimeConfig.public`, sensitive context returned to the client in error envelopes, and session/token data printed via console.log or logger. Trigger phrases include "ready to push", "before commit", "leaking secret", "expose", "runtimeConfig", or any change touching `.env`, `server/utils/env.ts`, `nuxt.config.ts`, or `server/utils/logger.ts`.
---

# secret-exposure-check

Nuxt 4 + Nitro gives you four parallel scopes for env data:

| Scope | Visible to | Example |
|---|---|---|
| `process.env.FOO` server-side | Nitro routes, plugins, build | `env.NUXT_SESSION_PASSWORD` |
| `process.env.FOO` client-side | **Bundled into client JS** if referenced in `app/`, `components/`, `composables/` | DANGEROUS |
| `runtimeConfig.foo` (private) | Server only, accessed via `useRuntimeConfig().foo` | API keys for server-only services |
| `runtimeConfig.public.foo` | **Sent to every client** in `window.__NUXT__.config` | Site URL, feature flags |

This skill prevents the two on the right from leaking secrets.

## The four leak vectors

### 1. `process.env` referenced in client code

In a Nuxt 4 `app/` directory, anything client-reachable that reads `process.env.X` will have `X`'s value **inlined into the client bundle at build time**. The value is then in everyone's devtools.

**Check:**

```bash
grep -rn "process\.env\." app/ 2>/dev/null
```

Should print nothing. Any hit is a leak unless the file is server-only (and in `app/` it never is).

**Fix:** Move the read into `server/utils/env.ts` and expose only the necessary derived flag via `runtimeConfig.public`.

### 2. Secrets in `runtimeConfig.public`

`nuxt.config.ts` has a `runtimeConfig` block. Everything under `runtimeConfig.public` is **sent to the client in plaintext**. Only put values there if they're safe to display in the user's HTML source.

**Check:**

```bash
# Grep the public block specifically
grep -A 20 "runtimeConfig:" nuxt.config.ts | grep -A 15 "public:"
```

Compare every key against this allow-list:

- `siteUrl` — public marketing surface; fine.
- `demoMode` — boolean flag; fine.
- Anything ending in `_PUBLIC_KEY`, `_PUBLISHABLE_KEY` (e.g. Stripe, PostHog) — fine, those are designed to be public.

Anything else is suspect. **NEVER** under `public`:

- `*_SECRET`, `*_PRIVATE_KEY`, `*_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `NUXT_SESSION_PASSWORD`
- `*_API_KEY` (unless it's explicitly a public-publishable variant)
- OAuth client SECRET (id is fine)

### 3. Session / sensitive context returned to the client

`event.context.session.user` is sometimes safe to return (e.g. `/api/me`), sometimes not (don't leak the full session blob with internal flags). Error responses are the more common slip.

**Check:**

```bash
# Find places error responses might echo input or context
grep -rn "sendError\|createError\|throw createError" server/ | head
```

For each, ensure:

- Error messages don't include user input verbatim (XSS via reflected error)
- Error messages don't include the path/identifier of the failing record (info leak)
- The response envelope from `server/utils/response.ts` is used; raw `{ message, cause }` is not

**Check console.log of session data:**

```bash
grep -rEn "console\.log.*session|console\.log.*user|console\.log.*token" server/ app/
```

Any hit is a leak in prod logs (and prod logs go to Axiom, then to whoever has the dashboard).

### 4. Logger leaking secrets

`server/utils/logger.ts` ships events to Axiom when configured. If you pass a token, session, password, or full user record into the context object, that data lands in your log store **with no redaction**.

**Check:**

```bash
grep -rEn "logger\.(debug|info|warn|error)" server/ app/ | grep -iE "token|password|secret|session|key"
```

Any hit is a candidate for review. Whitelist patterns:

- `logger.info('auth.signin', { login, role })` — fine; login and role are not secrets.
- `logger.error('db.fail', { error: e.message })` — fine if `e.message` doesn't include the connection string. Drizzle errors sometimes echo SQL with values — scrub or use `e.code`.

**Avoid:**

- `logger.info('auth', { session: event.context.session })` — entire session blob
- `logger.warn('payment', { card: input.card })` — PII
- `logger.debug('axiom', { token: env.AXIOM_TOKEN })` — yes, this happens

## The full sweep

```bash
echo "1. process.env in client code (should be empty):"
grep -rn "process\.env\." app/ 2>/dev/null | grep -v "// SAFE:" || echo "  clean"

echo "2. runtimeConfig.public keys:"
grep -A 20 "runtimeConfig:" nuxt.config.ts | sed -n '/public:/,/}/p'

echo "3. Error responses that might reflect input:"
grep -rEn "createError\(.*\$\{|createError\(.*input\.|createError\(.*body\." server/ 2>/dev/null || echo "  clean"

echo "4. Session/token in console.log:"
grep -rEn "console\.(log|error|warn).*(session|token|password|secret)" server/ app/ 2>/dev/null || echo "  clean"

echo "5. Logger with possibly-sensitive context:"
grep -rEn "logger\.(debug|info|warn|error).*(session|token|password|secret|apiKey)" server/ app/ 2>/dev/null || echo "  clean"

echo "6. .env-style strings in tracked files (hardcoded secrets):"
grep -rEn "(sk_live_|sk_test_|xoxb-|ghp_|github_pat_|AKIA|aws_secret)" --include="*.ts" --include="*.vue" --include="*.js" --include="*.mjs" --exclude-dir=node_modules --exclude-dir=.nuxt . 2>/dev/null || echo "  clean"
```

## .gitignore sanity

Confirm these are ignored:

- `.env`, `.env.*` (except `.env.example`)
- `.output/`, `.nuxt/`, `.data/`, `.nitro/`, `.cache/`
- `.playwright-mcp/` (may contain screenshots of authenticated screens)
- `.jscpd-report/`

```bash
git check-ignore -v .env .env.local .output .nuxt .jscpd-report 2>&1 | head -10
```

If any of those return "::" (not ignored), the .gitignore is wrong — fix before pushing.

## .env.example sanity

Only the `.env.example` file should be tracked. Its values must be **placeholders**, never real:

```bash
git ls-files | grep -E "^\.env" 
# Should list ONLY: .env.example
```

```bash
# Check for accidentally-committed real values in .env.example
grep -E "^[A-Z_]+=[^[:space:]]+$" .env.example | grep -vE "=$|=http://localhost|=changeme|=your-|=demo|=example"
```

Output should be empty (or only the few placeholder defaults that don't end in `=`).

## Refusal conditions

Stop and surface to the user if:

- Row 1 finds any `process.env.X` in `app/`.
- Row 2 has any key matching `_SECRET`, `_PRIVATE`, `DATABASE_URL`, `_SERVICE_ROLE` under `public:`.
- Row 6 finds anything resembling a real-looking token.
- The diff modifies `.env` (the file) — that file should never be committed; only `.env.example` is tracked.

## When this skill is unnecessary

Pure UI changes (no env, no server, no logger) — skip and save the cycles. The trigger is "diff touches env handling, runtimeConfig, server logs, error responses, or client-side fetches."
