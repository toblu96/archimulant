import type { RequestContainer } from '~~/server/container'
import { useLogger } from 'evlog/nitro'
import { createEvlogLoggerAdapter } from '~~/server/adapters/evlog-logger'

// Paths where session resolution would be wasteful or recursive.
const SKIP_AUTH_PATHS = ['/api/auth/', '/api/health']

export default defineEventHandler(async (event) => {
  const app = useNitroApp()
  const evlog = useLogger(event)

  const path = getRequestURL(event).pathname
  const skipAuth = SKIP_AUTH_PATHS.some(p => path.startsWith(p))
  const currentUser = skipAuth ? null : await app.container.sessionResolver.resolve(event.headers)

  if (currentUser) {
    evlog.set({ user: { id: currentUser.id } })
  }

  event.context.scope = {
    ...app.container,
    currentUser,
    logger: createEvlogLoggerAdapter(evlog)
  } satisfies RequestContainer
})
