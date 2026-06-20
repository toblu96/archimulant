// server/adapters/outbound/better-auth.ts
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { betterAuth } from 'better-auth'
import type { SessionResolver } from '~~/server/ports/session-resolver'
import { UserId } from '~~/server/domain/auth/user'

export interface AuthAdapterConfig {
  google: { clientId: string, clientSecret: string }
  github: { clientId: string, clientSecret: string }
  database: { filePath: string }
}

export const createAuthInstance = (config: AuthAdapterConfig = { google: { clientId: '', clientSecret: '' }, github: { clientId: '', clientSecret: '' }, database: { filePath: '' } }) => {
  mkdirSync(dirname(config.database.filePath), { recursive: true })
  return betterAuth({
    socialProviders: {
      // google: config.google,
      github: {
        clientId: config.github.clientId,
        clientSecret: config.github.clientSecret
      }
    },
    database: new DatabaseSync(config.database.filePath)
  })
}
export default createAuthInstance

export type AuthInstance = ReturnType<typeof createAuthInstance>

export const createBetterAuthSessionResolver = (auth: AuthInstance): SessionResolver => ({
  async resolve(headers) {
    const session = await auth.api.getSession({ headers })
    if (!session?.user) return null
    // Adapter owns the mapping. Domain shape, not better-auth shape.
    return {
      id: UserId(session.user.id),
      email: session.user.email,
      name: session.user.name,
      emailVerified: session.user.emailVerified ?? false
    }
  }
})
