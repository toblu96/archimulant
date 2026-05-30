import type { AppContainer } from '~~/server/container'

declare module 'nitropack/types' {
  interface NitroApp {
    container: AppContainer
  }
  interface NitroRouteRules {
    auth?: boolean
  }
  interface NitroRouteConfig {
    auth?: boolean
  }
}
