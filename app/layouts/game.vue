<template>
  <div class="flex flex-col h-dvh overflow-hidden">
    <UHeader class="flex-none">
      <template #left>
        <NuxtLink
          to="/"
          class="font-semibold text-sm tracking-tight text-highlighted"
        >
          Archimulant
        </NuxtLink>
      </template>

      <template #right>
        <UButton
          to="/play"
          variant="ghost"
          color="neutral"
          size="sm"
          icon="i-lucide-arrow-left"
        >
          Exit
        </UButton>
      </template>
    </UHeader>

    <main class="flex-1 min-h-0 overflow-hidden">
      <slot />
    </main>
  </div>
</template>
