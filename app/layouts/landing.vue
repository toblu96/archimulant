<script setup lang="ts">
import { authClient } from '~~/lib/auth-client'
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const { data: session } = await authClient.useSession(useFetch)

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Play',
    to: '/play',
    active: route.path.startsWith('/play')
  },
  {
    label: 'Learn',
    to: '/learn',
    active: route.path.startsWith('/learn')
  }
])
</script>

<template>
  <div>
    <UHeader>
      <template #title>
        Archimulant
      </template>

      <UNavigationMenu :items="items" />

      <template #right>
        <UColorModeButton />
        <UTooltip
          text="Open on GitHub"
        >
          <UButton
            color="neutral"
            variant="ghost"
            to="https://github.com/toblu96/archimulant"
            target="_blank"
            icon="i-simple-icons-github"
            aria-label="GitHub"
          />
        </UTooltip>
        <ClientOnly>
          <UButton
            v-if="!session"
            to="/login"
          >
            Sign in
          </UButton>
          <UButton
            v-else
            to="/dashboard"
            variant="soft"
          >
            Dashboard
          </UButton>
          <template #fallback>
            <div class="w-20 h-8" />
          </template>
        </ClientOnly>
      </template>
    </UHeader>

    <UMain>
      <slot />
    </UMain>

    <USeparator />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          Archimulant &copy; {{ new Date().getFullYear() }}
        </p>
      </template>
      <template #right>
        <UButton
          v-for="link in items"
          :key="String(link.to ?? link.label)"
          :to="link.to"
          variant="ghost"
          color="neutral"
          size="xs"
        >
          {{ link.label }}
        </UButton>
      </template>
    </UFooter>
  </div>
</template>
