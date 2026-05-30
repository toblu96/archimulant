/**
 * Request-scoped logger. Accumulates context across the request; the
 * framework emits one log line automatically at request end.
 * Use in handlers, use cases, and adapters called during a request.
 */
export interface Logger {
  set(data: Record<string, unknown>): void
}

/**
 * App-scoped logger. Each call emits one discrete log line immediately.
 * No accumulation, no emission boundary.
 * Use in singletons, lifecycle events, plugin hooks, scheduled jobs,
 * and any callback that fires outside a request.
 */
export interface AppLogger {
  debug(data: Record<string, unknown>): void
  info(data: Record<string, unknown>): void
  warn(data: Record<string, unknown>): void
  error(data: Record<string, unknown>): void
}
