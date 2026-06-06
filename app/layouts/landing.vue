<script setup lang="ts">
import { authClient } from '~~/lib/auth-client'

const { data: session } = await authClient.useSession(useFetch)

const links = [
  { label: 'Play', to: '/play' },
  { label: 'Learn', to: '/learn' }
]
</script>

<template>
  <div>
    <UHeader>
      <template #left>
        <NuxtLink
          to="/"
          class="font-semibold text-base tracking-tight text-highlighted"
        >
          Archimulant
        </NuxtLink>
      </template>

      <template #right>
        <UButton
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          variant="ghost"
          color="neutral"
          size="sm"
        >
          {{ link.label }}
        </UButton>
        <UColorModeButton />
        <ClientOnly>
          <UButton
            v-if="!session"
            to="/login"
            size="sm"
          >
            Sign in
          </UButton>
          <UButton
            v-else
            to="/dashboard"
            size="sm"
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
          v-for="link in links"
          :key="link.to"
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
