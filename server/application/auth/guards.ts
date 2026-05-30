import { AppError } from '~~/server/domain/errors'
import type { User, UserId } from '~~/server/domain/auth/user'

export function requireAuthentication(currentUser: User | null): User {
  if (!currentUser) {
    throw new AppError('urn:archimulant:unauthorized', 'Authentication required')
  }
  return currentUser // type narrows User | null → User
}

export function requireOwner<T extends { ownerId: UserId }>(resource: T, user: User): T {
  if (resource.ownerId !== user.id) {
    throw new AppError('urn:archimulant:forbidden', 'You do not own this resource')
  }
  return resource
}
