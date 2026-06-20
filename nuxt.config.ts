declare module 'nitropack/types' {
  interface NitroRouteRules { auth?: boolean }
  interface NitroRouteConfig { auth?: boolean }
}

export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', 'evlog/nuxt'],
  devtools: {
    enabled: true
  },
  css: ['~/assets/css/main.css', '@vue-flow/core/dist/style.css'],
  runtimeConfig: {
    scenariosDir: 'server/data/scenarios',
    auth: {
      autoMigrate: true,
      google: { clientId: '', clientSecret: '' },
      github: { clientId: '', clientSecret: '' },
      database: { filePath: '.data/auth.db' }
    }
  },
  compatibilityDate: '2025-01-15',
  nitro: {
    experimental: {
      openAPI: true,
      asyncContext: true
    },
    errorHandler: '~~/server/error'
  },
  vite: {
    optimizeDeps: {
      include: [
        'better-auth/vue',
        '@vue-flow/core',
        '@dagrejs/dagre'
      ]
    }
  },
  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },
  evlog: {
    exclude: [
      '/api/_**'
    ]
  }
})
