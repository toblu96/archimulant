import type { ScenarioRepository } from '~~/server/ports/scenario-repository'
import type { RuntimeConfig } from 'nuxt/schema'
import { createJsonFileScenarioRepository } from '~~/server/adapters/json-file-scenario-repository'
import { createEvlogAppLoggerAdapter } from '~~/server/adapters/evlog-logger'
import type { AppLogger, Logger } from '~~/server/ports/logger'
import { createBetterAuthSessionResolver, createAuthInstance, type AuthInstance } from '~~/server/adapters/better-auth'
import type { SessionResolver } from '~~/server/ports/session-resolver'
import type { User } from '~~/server/domain/auth/user'

export interface AppContainer {
  appLogger: AppLogger // singleton, for lifecycle events
  authInstance: AuthInstance
  sessionResolver: SessionResolver
  scenarios: ScenarioRepository
}

export interface RequestContainer extends AppContainer {
  logger: Logger // request-scoped, set in middleware
  currentUser: User | null // extend later with better-auth session content
}

export const buildAppContainer = (config: RuntimeConfig): AppContainer => {
  const appLogger = createEvlogAppLoggerAdapter({ scope: 'app' })
  const authInstance = createAuthInstance(config.auth)

  return {
    appLogger,
    authInstance,
    sessionResolver: createBetterAuthSessionResolver(authInstance),
    scenarios: createJsonFileScenarioRepository(config.scenariosDir)
  }
}
