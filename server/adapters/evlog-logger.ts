import type { Logger } from '~~/server/ports/logger'

// Same adapter works for both the request-scoped useLogger(event) and
// the standalone createLogger() — both expose a .set(data) method.
type EvlogLog = { set: (data: Record<string, unknown>) => void }

export const createEvlogLoggerAdapter = (evlog: EvlogLog): Logger => ({
  set: data => evlog.set(data)
})
