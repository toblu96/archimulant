<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  auth: false
})

const { data: scenarios } = await useFetch('/api/scenarios')

const difficultyColor = (d: string) =>
  d === 'beginner' ? 'success' : d === 'intermediate' ? 'warning' : 'error'
</script>

<template>
  <div>
    <UPageSection>
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-default mb-2">
          Choose a scenario
        </h1>
        <p class="text-muted max-w-2xl">
          Each scenario presents a system with issues like availability gaps, latency spikes, throughput bottlenecks. Apply improvements under a fixed budget and fix it.
        </p>
      </div>
      <div
        v-if="scenarios"
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <NuxtLink
          v-for="s in scenarios"
          :key="s.id"
          :to="`/play/${s.id}`"
          class="flex h-full"
        >
          <UCard
            class="flex flex-col h-full w-full transition-colors hover:bg-elevated/50 hover:ring-primary"
            :ui="{ body: 'flex flex-col flex-1 gap-4' }"
          >
            <div class="flex items-start justify-between gap-3">
              <h3 class="text-lg font-semibold text-default">
                {{ s.meta.title }}
              </h3>
              <UBadge
                :color="difficultyColor(s.meta.difficulty)"
                variant="soft"
                class="shrink-0 capitalize"
              >
                {{ s.meta.difficulty }}
              </UBadge>
            </div>

            <p class="text-muted leading-relaxed flex-1">
              {{ s.meta.description }}
            </p>

            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="tag in s.meta.tags"
                :key="tag"
                color="neutral"
                variant="soft"
              >
                {{ tag }}
              </UBadge>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 text-sm text-muted">
                <UIcon
                  name="i-tabler-clock"
                  class="size-5"
                />
                ~{{ s.meta.estimatedMinutes }} min
              </div>
              <UButton
                trailing-icon="i-tabler-arrow-right"
              >
                Play
              </UButton>
            </div>
          </UCard>
        </NuxtLink>
      </div>

      <div
        v-else
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <USkeleton
          v-for="i in 2"
          :key="i"
          class="h-72 rounded-xl"
        />
      </div>
    </UPageSection>
  </div>
</template>
