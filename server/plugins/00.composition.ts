import { buildAppContainer } from '~~/server/container'

export default defineNitroPlugin((nitroApp) => {
  const config = useRuntimeConfig()
  const container = buildAppContainer(config)
  nitroApp.container = container
  nitroApp.hooks.hookOnce('close', async () => {
    // await container.dispose?.()
  })
})
