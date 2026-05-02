import { type H3Event, type EventHandler, createError, defineEventHandler, setResponseStatus } from 'h3'

// Standard API response envelope.
//
// Success:  { ok: true,  data:  <T> }
// Failure:  { ok: false, error: { code, message, details? } }
//
// Wrap every /api/* handler with apiHandler() and the envelope is
// applied automatically — both on the success return and on any thrown
// error. Use apiError(code, message) to fail with a typed code; bare
// createError() calls (or errors from third-party guards like
// requireUserSession) get normalised into the envelope too.

export const ErrorCode = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  SESSION_INVALID: 'SESSION_INVALID',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL: 'INTERNAL',
} as const
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode]

const CODE_TO_STATUS: Record<ErrorCode, number> = {
  UNAUTHORIZED: 401,
  SESSION_INVALID: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_FAILED: 422,
  RATE_LIMITED: 429,
  INTERNAL: 500,
}

const STATUS_TO_CODE: Record<number, ErrorCode> = {
  401: ErrorCode.UNAUTHORIZED,
  403: ErrorCode.FORBIDDEN,
  404: ErrorCode.NOT_FOUND,
  422: ErrorCode.VALIDATION_FAILED,
  429: ErrorCode.RATE_LIMITED,
}

export interface ApiSuccess<T> { ok: true; data: T }
export interface ApiFailure { ok: false; error: { code: ErrorCode; message: string; details?: unknown } }
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

export function ok<T>(data: T): ApiSuccess<T> {
  return { ok: true, data }
}

/**
 * Throw a typed API error. statusCode is derived from the code.
 *
 *   throw apiError('FORBIDDEN', `role '${role}' is not permitted`)
 *   throw apiError('VALIDATION_FAILED', 'email is required', { field: 'email' })
 */
export function apiError(code: ErrorCode, message: string, details?: unknown) {
  return createError({
    statusCode: CODE_TO_STATUS[code],
    statusMessage: code,
    data: { code, message, ...(details !== undefined ? { details } : {}) },
  })
}

/**
 * Wrap an event handler so its return value is enveloped as
 * { ok: true, data } and any thrown error is enveloped as
 * { ok: false, error }. The HTTP status code is preserved.
 *
 *   export default apiHandler(async (event) => {
 *     await requireAuth(event)
 *     return { hello: 'world' }
 *   })
 */
export function apiHandler<T>(fn: (event: H3Event) => T | Promise<T>): EventHandler {
  return defineEventHandler(async (event): Promise<ApiResponse<T>> => {
    try {
      const data = await fn(event)
      return ok(data)
    } catch (err: unknown) {
      const e = err as { statusCode?: number; statusMessage?: string; message?: string; data?: { code?: ErrorCode; message?: string; details?: unknown } }
      const statusCode = e.statusCode ?? 500
      const code: ErrorCode = e.data?.code ?? STATUS_TO_CODE[statusCode] ?? ErrorCode.INTERNAL
      const message = e.data?.message ?? e.message ?? 'Internal error'
      const details = e.data?.details
      setResponseStatus(event, statusCode)
      // Don't leak stack/url to clients. The original error is still in
      // server logs via Nitro's default error pipeline.
      return {
        ok: false,
        error: {
          code,
          message,
          ...(details !== undefined ? { details } : {}),
        },
      }
    }
  })
}
