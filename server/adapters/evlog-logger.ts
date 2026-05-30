import type { useLogger } from 'evlog/nitro'
import type { Logger, AppLogger } from '~~/server/ports/logger'
import { log as evlogLog } from 'evlog'

type EvlogRequestLog = ReturnType<typeof useLogger>

// Request-scoped: framework emits the wide event at request end.
export const createEvlogLoggerAdapter = (evlog: EvlogRequestLog): Logger => ({
  set: data => evlog.set(data)
})

// App-scoped: each log() call is a fire-and-forget structured event.
// Uses evlog's simple log API (log.info), NOT createLogger — createLogger is
// for accumulated wide events per unit of work, which is the wrong shape for
// discrete lifecycle events. `defaults` merge into every emitted event.
export const createEvlogAppLoggerAdapter = (
  defaults: Record<string, unknown> = {}
): AppLogger => ({
  debug: data => evlogLog.debug({ ...defaults, ...data }),
  info: data => evlogLog.info({ ...defaults, ...data }),
  warn: data => evlogLog.warn({ ...defaults, ...data }),
  error: data => evlogLog.error({ ...defaults, ...data })
})
