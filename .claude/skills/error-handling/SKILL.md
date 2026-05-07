---
name: error-handling
description: Use this skill when adding or modifying error-handling logic in this Nuxt boilerplate — try/catch blocks, error rethrows, error suppression, custom error types, error pages, or any `throw` statement. Enforces the project's resolution discipline: typed errors via `apiError`, no silent swallow, no leaked stack traces, no rethrown errors that lose `code`/`message`. Trigger phrases include "try/catch", "handle error", "swallow exception", "rethrow", "error boundary", "error.vue", or any change that touches `catch (`, `throw`, or `error` handling.
---

# error-handling

Most production bugs are not "the code crashed" — they're "the code crashed AND nobody knew" or "the code crashed AND the user got a useless message." This skill is the discipline that prevents both.

## The three-level model

```
[user-visible error]  ← what the client renders
       ▲
       │ shape: { ok: false, error: { code, message, details? } }
       │
[envelope normalisation]  ← apiHandler() in server/utils/response.ts
       ▲
       │ throws apiError(code, message) or createError()
       │
[origin]  ← where the failure actually happens (DB, OAuth, validation, etc.)
```

The job of error-handling code at each level:

1. **At the origin:** detect and throw with the right `ErrorCode`.
2. **In the middle:** decide whether to catch + recover, catch + log + rethrow, or let it propagate.
3. **At the boundary:** `apiHandler` normalises to the envelope; `app/error.vue` renders the user-visible page.

## Patterns by situation

### Pattern A — Validate input

Throw early with a specific code. Never let invalid input reach the database.

```ts
import { z } from 'zod'
import { apiError } from '~~/server/utils/response'

const body = await readBody(event)
const parsed = ProjectSchema.safeParse(body)
if (!parsed.success) {
  throw apiError('VALIDATION_FAILED', 'Invalid input', {
    issues: parsed.error.issues,
  })
}
```

### Pattern B — Look up a resource that might not exist

`NOT_FOUND` is its own concept; don't conflate with `INTERNAL`.

```ts
const project = await db.query.projects.findFirst({ where: eq(schema.projects.id, id) })
if (!project) {
  throw apiError('NOT_FOUND', `Project ${id} does not exist`)
}
```

### Pattern C — Catch, log, rethrow

When you want to capture context for ops but the caller still needs to see the failure.

```ts
import { logger } from '~~/server/utils/logger'

try {
  await db.insert(schema.users).values(...)
}
catch (e: unknown) {
  // Note: postgres-js errors have .code (e.g. '23505' = unique violation).
  logger.error('db.user.insert_failed', {
    error: (e as Error).message,
    code: (e as { code?: string }).code,
  })
  throw apiError('INTERNAL', 'Failed to create user')   // user-facing message
}
```

Two things here:

1. The catch logs technical detail (`error.message`, `error.code`) for the operator.
2. The catch rethrows a user-safe `apiError` — the client never sees the Postgres error.

### Pattern D — Catch + recover

When a failure is non-fatal: the operation can continue without the failed step.

```ts
try {
  await db.insert(schema.users).values(...)
}
catch (e) {
  // OAuth still completes if DB is unreachable; the session is the source
  // of truth for "is this user logged in". We just lose persistent app
  // data until DB comes back. Log so it's not silent.
  logger.warn('auth.github.db_upsert_skipped', {
    login: user.login,
    error: (e as Error).message,
  })
}

// continue with setUserSession, redirect, etc.
```

### Pattern E — Catch + swallow (rare, must be justified)

Only when the error is genuinely "I don't care if this succeeded" — e.g. fire-and-forget telemetry.

```ts
try {
  await trackingPing()
}
catch {
  // intentional: tracking failure should never affect the user flow
}
```

If you write `catch {}` or `catch (_) {}`, **the line above it must be a comment explaining why**.

## Anti-patterns to refuse

### 1. Silent swallow with no comment

```ts
try { await dangerous() } catch {}   // ✗
```

You have either lost an error message that would have helped a future operator, or you're hiding a bug. Add a `logger.warn` or a `// intentional:` comment. If you can't justify the swallow, you shouldn't be swallowing.

### 2. Logging then rethrowing the original

```ts
catch (e) {
  logger.error('db.failed', { error: e })   // ✗ — passes the Error instance
  throw e                                     // ✗ — leaks raw Postgres error message to client
}
```

→ Log `e.message` (string), throw `apiError(code, user-safe-message)`.

### 3. Stack traces in API responses

`apiHandler` already prevents this — but only if you use `apiError`. If you `return { error: e.stack }`, the envelope doesn't help.

```ts
catch (e) {
  return { ok: false, stack: (e as Error).stack }   // ✗
}
```

### 4. Type narrowing via `any`

```ts
catch (e: any) {           // ✗ — loses all safety
  if (e.code === '23505')  // works, but reads worse
}
```

→ `catch (e: unknown)` plus narrow:

```ts
catch (e: unknown) {
  const code = (e as { code?: string }).code
  if (code === '23505') { ... }
}
```

### 5. Rethrowing inside `apiHandler`

```ts
export default apiHandler(async (event) => {
  try {
    await thing()
  }
  catch (e) {
    throw e   // ✗ — pointless; apiHandler already catches the outer scope
  }
})
```

If you have nothing to add in the catch (no log, no recovery, no rewrite), remove the try/catch entirely.

### 6. Promise rejections without await

```ts
sendEmail(user.email)   // ✗ — if this rejects, Nitro will print an UnhandledPromiseRejection at midnight
```

→ Either `await` it, or use a fire-and-forget wrapper:

```ts
sendEmail(user.email).catch((e) => {
  logger.warn('email.send_failed', { error: (e as Error).message })
})
```

## Client-side errors

`app/error.vue` is the universal error page. Two things to know:

1. The Vue component takes a `NuxtError` prop and decides what to render. Don't fork it per error type; switch inside on `error.statusCode`.
2. To trigger it programmatically, use `showError({ statusCode, statusMessage })` from inside any `<script setup>`. Don't `throw` a string — Nuxt's error handling expects a `NuxtError`-shaped object.

For inline UI errors (e.g. form submission failed), use `vue-sonner` toasts or per-field validation, not `error.vue`. The error page is for "the route cannot render at all."

## Verification

When reviewing a diff that touches error handling:

```bash
# 1. Empty catch blocks without an "intentional:" comment
grep -rnB1 "catch (\\(.*\\))? *{}\\|catch (\\(.*\\))? *{[^}]*}" --include="*.ts" --include="*.vue" server/ app/ 2>/dev/null \
  | grep -v "intentional"

# 2. Logging the raw Error instance instead of .message
grep -rEn "logger\\.(error|warn|info).*(\\berror\\b: e\\b|error: e\\))" server/ app/ 2>/dev/null
# every hit should be reviewed — was the operator going to want a string here?

# 3. Re-thrown unknown errors that bypass apiError
grep -rnB3 "throw e\\b" --include="*.ts" server/ 2>/dev/null
# every hit needs context — why not apiError?
```

## When the bug is hard

If you've spent more than 15 minutes on a single failing call, stop adding try/catches and use the `superpowers:systematic-debugging` skill (it's the global Anthropic-shipped one). Wrapping in error handlers is not the same as understanding the bug.
