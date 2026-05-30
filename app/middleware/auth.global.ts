import { authClient } from '~~/lib/auth-client'

declare module '#app' {
  interface PageMeta {
    auth?: boolean
  }
}

declare module 'vue-router' {
  interface RouteMeta {
    auth?: boolean
  }
}

export default defineNuxtRouteMiddleware(async (to) => {
  // If auth is disabled, skip middleware
  if (to.meta.auth === false) return

  const { data: session } = await authClient.useSession(useFetch)
  if (!session.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
