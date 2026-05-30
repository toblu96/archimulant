export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', 'evlog/nuxt'],
  devtools: {
    enabled: true
  },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    scenariosDir: 'server/data/scenarios',
    auth: {
      autoMigrate: true,
      google: { clientId: '', clientSecret: '' },
      github: { clientId: '', clientSecret: '' },
      database: { filePath: '.data/auth.db' }
    }
  },
  routeRules: {
    '/': { prerender: true },
    '/api/auth/**': { auth: false }
  },
  compatibilityDate: '2025-01-15',
  nitro: {
    experimental: {
      openAPI: true,
      asyncContext: true
    },
    errorHandler: '~~/server/error'
  },
  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
