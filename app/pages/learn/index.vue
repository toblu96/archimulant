<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  auth: false
})

// All learn pages, ordered. Grouped into the metric-aligned buckets below.
const { data: pages } = await useAsyncData('learn-index', () =>
  queryCollection('learn').order('order', 'ASC').all()
)

const groups = computed(() =>
  LEARN_GROUPS
    .map(group => ({
      ...group,
      pages: (pages.value ?? []).filter(p => p.group === group.key)
    }))
    .filter(group => group.pages.length > 0)
)
</script>

<template>
  <div>
    <UPageSection>
      <div class="mb-10">
        <h1 class="text-3xl font-bold text-default mb-2">
          Learn architecture
        </h1>
        <p class="text-muted max-w-2xl">
          Short, practical explainers on the patterns behind the game. Each one shows the problem it solves, how it moves availability, latency, throughput and cost, and the trade-offs to watch. Improvements in a scenario link straight here.
        </p>
      </div>

      <div class="space-y-12">
        <section
          v-for="group in groups"
          :key="group.key"
        >
          <div class="flex items-start gap-3 mb-5">
            <UIcon
              :name="group.icon"
              class="size-6 text-primary shrink-0 mt-0.5"
            />
            <div>
              <h2 class="text-xl font-semibold text-default">
                {{ group.label }}
              </h2>
              <p class="text-sm text-muted">
                {{ group.description }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <NuxtLink
              v-for="page in group.pages"
              :key="page.path"
              :to="page.path"
              class="flex h-full"
            >
              <UCard
                class="flex flex-col h-full w-full transition-colors hover:bg-elevated/50 hover:ring-primary"
                :ui="{ body: 'flex flex-col flex-1 gap-3' }"
              >
                <h3 class="text-lg font-semibold text-default">
                  {{ page.title }}
                </h3>
                <p class="text-muted leading-relaxed flex-1">
                  {{ page.summary }}
                </p>

                <div
                  v-if="page.tags?.length"
                  class="flex flex-wrap gap-2"
                >
                  <UBadge
                    v-for="tag in page.tags"
                    :key="tag"
                    color="neutral"
                    variant="soft"
                  >
                    {{ tag }}
                  </UBadge>
                </div>

                <div class="flex justify-end">
                  <UButton
                    variant="soft"
                    trailing-icon="i-tabler-arrow-right"
                  >
                    Read
                  </UButton>
                </div>
              </UCard>
            </NuxtLink>
          </div>
        </section>
      </div>

      <div
        v-if="!groups.length"
        class="text-muted"
      >
        No learning resources published yet.
      </div>
    </UPageSection>
  </div>
</template>
