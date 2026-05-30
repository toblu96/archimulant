import { createAuthMiddleware } from 'evlog/better-auth'

let identify: ReturnType<typeof createAuthMiddleware> | null = null

export default defineEventHandler(async (event) => {
  if (!event.context.log) return
  identify ??= createAuthMiddleware(useNitroApp().container.authInstance, {
    exclude: ['/api/auth/**']
  })
  await identify(event.context.log, event.headers, event.path)
})
