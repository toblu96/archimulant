<template>
  <div class="flex flex-col h-dvh overflow-hidden">
    <UHeader class="flex-none">
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
          to="/play"
          variant="ghost"
          color="neutral"
          icon="i-tabler-door-exit"
        >
          Exit Scenario
        </UButton>
      </template>
    </UHeader>

    <main class="flex-1 min-h-0 overflow-hidden">
      <slot />
    </main>
  </div>
</template>
