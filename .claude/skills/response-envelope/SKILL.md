---
name: response-envelope
description: Use this skill when adding or modifying any API route handler under `server/api/**` or any Nitro event handler that returns data to the client. Enforces the standard `ApiResponse<T>` envelope from `server/utils/response.ts`: wrap with `apiHandler()`, use `ok()` for success and `apiError(code, message)` for failures, never return raw objects or throw raw `createError()`. Trigger phrases include "new API route", "API endpoint", "return JSON", "defineEventHandler", "createError", "/api/".
---

# response-envelope

Every API handler in this boilerplate returns the same envelope shape so the client code that consumes it doesn't need a custom shape-checker per endpoint.

```ts
// Success
{ ok: true, data: <T> }

// Failure
{ ok: false, error: { code: ErrorCode, message: string, details?: unknown } }
```

The contract lives in `server/utils/response.ts`. The `apiHandler` wrapper produces this shape both on success returns and on thrown errors. Use it.

## The canonical handler

```ts
import { apiHandler } from '~~/server/utils/response'
import { requireAuth } from '~~/server/utils/guards'

export default apiHandler(async (event) => {
  await requireAuth(event)
  const { id } = await readBody<{ id: string }>(event)
  return { fetched: id, at: Date.now() }
})
```

What `apiHandler` gives you:

1. Success returns are wrapped: `return foo` becomes `{ ok: true, data: foo }`.
2. Thrown errors are caught and serialised to `{ ok: false, error: { code, message, details? } }` with the matching HTTP status.
3. Errors from `requireUserSession` / `requireRole` / `requireAuth` are normalised automatically.
4. Stack traces are not leaked — only `code`, `message`, and optional `details` reach the client.

## Throwing errors

Throw with `apiError(code, message, details?)`. The status code is derived from the `ErrorCode`:

```ts
import { apiError } from '~~/server/utils/response'

throw apiError('VALIDATION_FAILED', 'email is required', { field: 'email' })   // 422
throw apiError('NOT_FOUND', `project ${id} does not exist`)                    // 404
throw apiError('FORBIDDEN', 'editor role required for this action')            // 403
```

Available codes (from `ErrorCode`):

| Code | HTTP | When |
|---|---|---|
| `UNAUTHORIZED` | 401 | No session |
| `SESSION_INVALID` | 401 | Session refers to a user that no longer exists |
| `FORBIDDEN` | 403 | Session valid but role/scope insufficient |
| `NOT_FOUND` | 404 | Resource missing |
| `VALIDATION_FAILED` | 422 | Input failed schema check |
| `RATE_LIMITED` | 429 | Throttled |
| `INTERNAL` | 500 | Unexpected; the catch-all when nothing matches |

If you need a code that isn't in the list, add it to `ErrorCode` in `server/utils/response.ts` and update both `CODE_TO_STATUS` and `STATUS_TO_CODE` maps. **Do not** invent ad-hoc codes inline.

## Bad patterns to refuse

### 1. Raw `defineEventHandler` for API routes

```ts
// ✗ Not wrapped — return shape will be raw, errors will leak Nitro's default JSON
export default defineEventHandler(async (event) => {
  return { hello: 'world' }
})
```

→ Wrap with `apiHandler`.

### 2. Raw `createError`

```ts
// ✗ Doesn't set the envelope's typed code; client gets `{ statusCode, statusMessage }` instead of `{ code, message }`
throw createError({ statusCode: 404, message: 'not found' })
```

→ Use `apiError('NOT_FOUND', '…')`. The `apiHandler` wrapper does map raw `createError()` to envelope, but the `code` falls back to `STATUS_TO_CODE[404]` which is fine for status-only failures and lossy for richer ones (a 422 raw `createError` becomes `VALIDATION_FAILED` with the original message — usable, but no `details`).

### 3. Returning errors as success

```ts
// ✗ Client gets { ok: true, data: { error: ... } } — defeats the envelope
return { error: 'something went wrong' }
```

→ Throw `apiError('INTERNAL', 'something went wrong')`.

### 4. Inline `setResponseStatus` plus return

```ts
// ✗ Bypasses envelope normalisation
setResponseStatus(event, 404)
return { error: 'not found' }
```

→ Throw `apiError('NOT_FOUND', '…')`.

### 5. Bare arrays / primitives

```ts
// ✗ Hard to extend later
return [1, 2, 3]
```

→ Always return an object. Single-array returns force a breaking change the moment you need to add metadata (`total`, `cursor`).

```ts
return { items: [1, 2, 3], total: 3 }
```

## Public/auth routes that are NOT API endpoints

Some `server/routes/**` files (NOT `server/api/**`) are full HTTP handlers — OAuth callbacks, webhook receivers, file downloads. These do not return JSON to a client and should NOT use `apiHandler`:

- `server/routes/auth/github.get.ts` — redirects, doesn't return JSON.
- `server/routes/auth/logout.post.ts` — sets cookie, may redirect.
- `server/routes/auth/demo.post.ts` — returns `{ ok: true }` informally (could be wrapped, but the contract here is "did the cookie get set"; clients check `200` not the body).

If you're adding a route that LOOKS LIKE an API (POSTs JSON, returns JSON) but lives under `server/routes/` for routing reasons, **prefer moving it to `server/api/`** and wrapping with `apiHandler`. The split between `routes/` and `api/` is just where it appears in the URL; the envelope discipline should apply to anything JSON-shaped.

## Client consumption

Client-side, `$fetch` returns the unwrapped envelope; check `.ok` before reading `.data`:

```ts
const res = await $fetch('/api/projects')
if (!res.ok) {
  // res.error.code, res.error.message available
  return
}
const projects = res.data
```

If you're writing a wrapper composable, type the return as `ApiResponse<T>`:

```ts
import type { ApiResponse } from '~~/server/utils/response'

export async function fetchProjects(): Promise<ApiResponse<Project[]>> {
  return $fetch('/api/projects')
}
```

## Verification

```bash
# 1. Every server/api/* handler should be wrapped
grep -rL "apiHandler" server/api/ 2>/dev/null
# any file listed is a raw defineEventHandler — fix it

# 2. No raw createError calls inside server/api/ — should be apiError
grep -rn "createError" server/api/ 2>/dev/null
# every hit needs a reason; the standard is apiError(code, msg)

# 3. ErrorCode union is the source of truth — find ad-hoc codes
grep -rEn "apiError\(['\"]" server/api/ 2>/dev/null | grep -oE "apiError\(['\"][^'\"]+" | sort -u
# every value here must appear in server/utils/response.ts → ErrorCode
```

## Refusal

If a diff adds a `server/api/**` handler that doesn't use `apiHandler` and the user hasn't said "this is a webhook / streaming / non-JSON endpoint", stop and rewrite. The envelope is the contract; you don't get to opt out per-route.
