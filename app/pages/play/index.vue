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
    <UPageHero
      title="Choose a scenario"
      description="Each scenario presents a system with issues — availability gaps, latency spikes, throughput bottlenecks. Apply improvements under a fixed budget and fix it."
      :ui="{ description: 'max-w-2xl' }"
    />

    <UPageSection>
      <div
        v-if="scenarios"
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <UCard
          v-for="s in scenarios"
          :key="s.id"
          class="flex flex-col"
          :ui="{ body: 'flex flex-col flex-1' }"
        >
          <div class="flex items-start justify-between gap-2 mb-2">
            <h3 class="text-base font-semibold text-default">
              {{ s.meta.title }}
            </h3>
            <UBadge
              :color="difficultyColor(s.meta.difficulty)"
              variant="soft"
              size="sm"
              class="shrink-0 capitalize"
            >
              {{ s.meta.difficulty }}
            </UBadge>
          </div>

          <p class="text-sm text-muted leading-relaxed flex-1 mb-4">
            {{ s.meta.description }}
          </p>

          <div class="flex flex-wrap gap-1 mb-4">
            <UBadge
              v-for="tag in s.meta.tags"
              :key="tag"
              size="xs"
              color="neutral"
              variant="soft"
            >
              {{ tag }}
            </UBadge>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1 text-xs text-muted">
              <UIcon
                name="i-lucide-clock"
                class="size-3.5"
              />
              ~{{ s.meta.estimatedMinutes }} min
            </div>
            <UButton
              :to="`/play/${s.id}`"
              size="sm"
              trailing-icon="i-lucide-arrow-right"
            >
              Play
            </UButton>
          </div>
        </UCard>
      </div>

      <div
        v-else
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <USkeleton
          v-for="i in 2"
          :key="i"
          class="h-64 rounded-xl"
        />
      </div>
    </UPageSection>
  </div>
</template>
