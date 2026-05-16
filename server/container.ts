import type { ScenarioRepository } from '~~/server/ports/scenario-repository'
import type { RuntimeConfig } from 'nuxt/schema'
import { createJsonFileScenarioRepository } from '~~/server/adapters/json-file-scenario-repository'
import { createLogger } from 'evlog'
import { createEvlogLoggerAdapter } from '~~/server/adapters/evlog-logger'
import type { Logger } from '~~/server/ports/logger'

export interface AppContainer {
  appLogger: Logger // singleton, for lifecycle events
  scenarios: ScenarioRepository
}

export interface RequestContainer extends AppContainer {
  logger: Logger // request-scoped, set in middleware
  currentUser: null // extend later with better-auth session content
}

export const buildAppContainer = (config: RuntimeConfig): AppContainer => {
  const appLogger = createEvlogLoggerAdapter(createLogger({ scope: 'app' }))

  return {
    appLogger,
    scenarios: createJsonFileScenarioRepository(config.scenariosDir)
  }
}
