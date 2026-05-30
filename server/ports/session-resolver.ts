// server/ports/session-resolver.ts
import type { User } from '~~/server/domain/auth/user'

export interface SessionResolver {
  /**
   * Resolve the authenticated user from incoming request headers.
   * Returns null when no valid session is present.
   */
  resolve(headers: Headers): Promise<User | null>
}
