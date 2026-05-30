import { buildAppContainer } from '~~/server/container'
import { getMigrations } from 'better-auth/db/migration'

export default defineNitroPlugin(async (nitroApp) => {
  const config = useRuntimeConfig()
  const container = buildAppContainer(config)

  // Apply auth migrations before the server accepts traffic.
  // Idempotent — only creates/alters tables that don't match the auth config.
  if (config.auth.autoMigrate) {
    container.appLogger.info({ event: 'auth.migrations.applying' })
    const { runMigrations, toBeCreated, toBeAdded } = await getMigrations(
      container.authInstance.options
    )
    if (toBeCreated.length || toBeAdded.length) {
      await runMigrations()
      container.appLogger.info({
        event: 'auth.migrations.applied',
        created: toBeCreated.map(t => t.table),
        altered: toBeAdded.length
      })
    } else {
      container.appLogger.info({ event: 'auth.migrations.up_to_date' })
    }
  }

  nitroApp.container = container
  nitroApp.hooks.hookOnce('close', async () => {
    // await container.dispose?.()
  })
})
