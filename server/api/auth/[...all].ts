export default defineEventHandler((event) => {
  return useNitroApp().container.authInstance.handler(toWebRequest(event))
})
