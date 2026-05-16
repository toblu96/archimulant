export interface Logger {
  /**
   * Accumulate structured context on the current event for emission.
   * Request-scoped instances emit one log line per request.
   * App-scoped instances emit independently per call.
   */
  set(data: Record<string, unknown>): void
}
