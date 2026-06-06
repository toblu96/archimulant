import { AppError } from '~~/server/domain/errors'

export default defineEventHandler((event) => {
  if (!event.path.startsWith('/api')) return

  const { auth } = getRouteRules(event)
  if (auth === false) return
  if (!event.context.scope?.currentUser) {
    throw new AppError('urn:archimulant:unauthorized', 'Authentication required')
  }
})
