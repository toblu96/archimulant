<template>
  <div class="flex flex-col h-dvh overflow-hidden">
    <UHeader class="flex-none">
      <template #title>
        Archimulant
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
