import type { RequestContainer } from '~~/server/container'
import { useLogger } from 'evlog/nitro'
import { createEvlogLoggerAdapter } from '~~/server/adapters/evlog-logger'

export default defineEventHandler((event) => {
  const app = useNitroApp()
  const evlog = useLogger(event)

  event.context.scope = {
    ...app.container,
    currentUser: null, // populated by auth middleware
    logger: createEvlogLoggerAdapter(evlog)
  } satisfies RequestContainer
})
