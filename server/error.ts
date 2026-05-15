import { getRequestURL, isError, send, setResponseHeaders, setResponseStatus } from 'h3'
import type { ErrorCode } from '~~/server/utils/errors'

// Only generic, cross-cutting codes belong here.
// Endpoint-specific codes (e.g. scenario-not-found) must be handled
// in the respective API route handler.
const GENERIC_CATALOG: Partial<Record<ErrorCode, { title: string, status: number }>> = {
  'urn:archimulant:invalid-input': { title: 'Invalid Input', status: 400 },
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

function respond(event: Parameters<typeof setResponseStatus>[0], status: number, body: Record<string, unknown>) {
  setResponseStatus(event, status)
  setResponseHeaders(event, SECURITY_HEADERS)
  return send(event, JSON.stringify(body))
}

export default defineNitroErrorHandler((error, event) => {
  const instance = getRequestURL(event).pathname

  // Route handler explicitly converted a domain error to an h3 error with problem data.
  // This is the preferred path for endpoint-specific error codes.
  const data = error.data as Record<string, unknown> | undefined
  if (isError(error) && typeof data?.type === 'string') {
    return respond(event, error.statusCode, {
      type: data.type,
      title: data.title ?? 'Error',
      status: error.statusCode,
      detail: error.message,
      instance,
      ...(data.why ? { why: data.why } : {}),
      ...(data.fix ? { fix: data.fix } : {})
    })
  }

  // Domain error reached without being explicitly caught by a route handler.
  // Only works when the ApplicationError/AdapterError has no inner cause — h3
  // otherwise unwraps the cause and the domain error reference is lost.
  const rawCause = error.cause
  if (
    typeof rawCause === 'object'
    && rawCause !== null
    && 'name' in rawCause
    && 'code' in rawCause
    && ((rawCause as { name: unknown }).name === 'ApplicationError' || (rawCause as { name: unknown }).name === 'AdapterError')
    && typeof (rawCause as { code: unknown }).code === 'string'
  ) {
    const code = (rawCause as { code: string }).code as ErrorCode
    const entry = GENERIC_CATALOG[code]
    if (entry) {
      const e = rawCause as unknown as { message: string, why?: string, fix?: string }
      return respond(event, entry.status, {
        type: code,
        title: entry.title,
        status: entry.status,
        detail: e.message,
        instance,
        ...(e.why ? { why: e.why } : {}),
        ...(e.fix ? { fix: e.fix } : {})
      })
    }
  }

  // h3 validation/client errors (e.g. from getValidatedRouterParams).
  if (isError(error) && error.statusCode >= 400 && error.statusCode < 500) {
    return respond(event, error.statusCode, {
      type: 'urn:archimulant:invalid-input',
      title: 'Invalid Input',
      status: error.statusCode,
      detail: error.message,
      instance
    })
  }

  // Catch-all: unknown or unhandled server errors. No internal detail is leaked.
  return respond(event, 500, {
    type: 'urn:archimulant:internal-error',
    title: 'Internal Server Error',
    status: 500,
    instance
  })
})
