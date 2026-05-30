import { getRequestURL, send, setResponseHeaders, setResponseStatus, type H3Event } from 'h3'
import { findAppError, type ErrorCode } from '~~/server/domain/errors'

/**
 * Catalog for CROSS-CUTTING error codes only.
 * Endpoint-specific codes (e.g. scenario-not-found) are mapped in the
 * respective API route via createError({ data: { type, title, why?, fix? } }).
 */
const GENERIC_CATALOG: Partial<Record<ErrorCode, { title: string, status: number }>> = {
  'urn:archimulant:invalid-input': { title: 'Invalid Input', status: 400 },
  'urn:archimulant:unauthorized': { title: 'Unauthorized', status: 401 },
  'urn:archimulant:forbidden': { title: 'Forbidden', status: 403 },
  'urn:archimulant:internal-error': { title: 'Internal Server Error', status: 500 }
}

const SECURITY_HEADERS = {
  'content-type': 'application/problem+json',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'no-referrer',
  'content-security-policy': 'script-src \'none\'; frame-ancestors \'none\';',
  'cache-control': 'no-cache'
}

function extractDetail(message: string): string {
  try {
    const parsed = JSON.parse(message)
    if (Array.isArray(parsed) && typeof parsed[0]?.message === 'string') {
      return parsed[0].message
    }
  } catch {
    // not JSON — use as-is
  }
  return message
}

function respond(event: H3Event, status: number, body: Record<string, unknown>) {
  setResponseStatus(event, status)
  setResponseHeaders(event, SECURITY_HEADERS)
  return send(event, JSON.stringify(body))
}

export default defineNitroErrorHandler((error, event) => {
  const instance = getRequestURL(event).pathname
  // scope may be undefined if the error fires before middleware/00.context.ts runs.
  const reqId = event.context.scope?.reqId
  const reqIdField = reqId ? { requestId: reqId } : {}

  // 1) Route handler used createError({ data: { type, title?, why?, fix? } }) to
  //    explicitly map an endpoint-specific code. Preferred path.
  const data = error.data as Record<string, unknown> | undefined
  if (typeof data?.type === 'string') {
    return respond(event, error.statusCode, {
      type: data.type,
      title: data.title ?? 'Error',
      status: error.statusCode,
      detail: error.message,
      instance,
      ...reqIdField,
      ...(data.why ? { why: data.why } : {}),
      ...(data.fix ? { fix: data.fix } : {})
    })
  }

  // 2) An AppError reached the global handler without explicit route mapping.
  //    findAppError walks the cause chain so detection is robust to h3 wrapping.
  const appError = findAppError(error)
  if (appError) {
    const entry = GENERIC_CATALOG[appError.code]
    if (entry) {
      return respond(event, entry.status, {
        type: appError.code,
        title: entry.title,
        status: entry.status,
        detail: appError.message,
        instance,
        ...reqIdField,
        ...(appError.why ? { why: appError.why } : {}),
        ...(appError.fix ? { fix: appError.fix } : {})
      })
    }
    // AppError with an endpoint-specific code that escaped route mapping.
    // This is a bug; fall through to the 500 catch-all. Nitro logs the trace.
  }

  // 3) h3 client errors (validation, body parse, missing route, etc.).
  if (error.statusCode >= 400 && error.statusCode < 500) {
    return respond(event, error.statusCode, {
      type: 'urn:archimulant:invalid-input',
      title: 'Invalid Input',
      status: error.statusCode,
      detail: extractDetail(error.message),
      instance,
      ...reqIdField
    })
  }

  // 4) Catch-all for unknown server errors. No internal detail is leaked.
  return respond(event, 500, {
    type: 'urn:archimulant:internal-error',
    title: 'Internal Server Error',
    status: 500,
    detail: extractDetail(error.message),
    instance,
    ...reqIdField
  })
})
