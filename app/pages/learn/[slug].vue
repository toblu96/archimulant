<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  auth: false
})

const route = useRoute()

const { data: doc } = await useAsyncData(`learn-${route.path}`, () =>
  queryCollection('learn').path(route.path).first()
)

if (!doc.value) {
  throw createError({ statusCode: 404, statusMessage: 'Learn page not found' })
}

useSeoMeta({
  title: () => doc.value?.title,
  description: () => doc.value?.summary
})

const group = computed(() =>
  LEARN_GROUPS.find(g => g.key === doc.value?.group)
)

// Resolve scenario ids in `usedIn` to titles for the "In Archimulant" backlinks.
const { data: scenarios } = await useFetch('/api/scenarios')

const usedIn = computed(() =>
  (doc.value?.usedIn ?? []).map((id) => {
    const match = scenarios.value?.find(s => s.id === id)
    return { id, title: match?.meta.title ?? id }
  })
)
</script>

<template>
  <div>
    <UPageSection
      v-if="doc"
      :ui="{ container: 'max-w-5xl' }"
    >
      <UButton
        to="/learn"
        variant="link"
        color="neutral"
        icon="i-tabler-arrow-left"
        class="mb-6 -ml-2"
      >
        All resources
      </UButton>

      <div class="flex flex-col lg:flex-row lg:gap-12">
        <!-- Main content -->
        <article class="min-w-0 flex-1">
          <div class="mb-8">
            <div
              v-if="group"
              class="flex items-center gap-2 text-sm text-primary mb-3"
            >
              <UIcon
                :name="group.icon"
                class="size-4"
              />
              {{ group.label }}
            </div>
            <h1 class="text-3xl font-bold text-default mb-3">
              {{ doc.title }}
            </h1>
            <p class="text-lg text-muted leading-relaxed">
              {{ doc.summary }}
            </p>
            <div
              v-if="doc.tags?.length"
              class="flex flex-wrap gap-2 mt-4"
            >
              <UBadge
                v-for="tag in doc.tags"
                :key="tag"
                color="neutral"
                variant="soft"
              >
                {{ tag }}
              </UBadge>
            </div>
          </div>

          <USeparator class="mb-8" />

          <ContentRenderer
            :value="doc"
            class="max-w-none"
          />
        </article>

        <!-- Aside: backlinks + further reading -->
        <aside class="lg:w-72 lg:flex-none mt-10 lg:mt-0 space-y-6">
          <UCard
            v-if="usedIn.length"
            :ui="{ body: 'space-y-3' }"
          >
            <div class="flex items-center gap-2 font-semibold text-default">
              <UIcon
                name="i-tabler-device-gamepad-2"
                class="size-5 text-primary"
              />
              In Archimulant
            </div>
            <p class="text-sm text-muted">
              Scenarios that put this into practice:
            </p>
            <UButton
              v-for="s in usedIn"
              :key="s.id"
              :to="`/play/${s.id}`"
              variant="soft"
              block
              trailing-icon="i-tabler-arrow-right"
              :ui="{ trailingIcon: 'ms-auto' }"
            >
              {{ s.title }}
            </UButton>
          </UCard>

          <UCard
            v-if="doc.goDeeper?.length"
            :ui="{ body: 'space-y-3' }"
          >
            <div class="flex items-center gap-2 font-semibold text-default">
              <UIcon
                name="i-tabler-external-link"
                class="size-5 text-primary"
              />
              Go deeper
            </div>
            <ul class="space-y-2">
              <li
                v-for="link in doc.goDeeper"
                :key="link.url"
              >
                <ULink
                  :to="link.url"
                  target="_blank"
                  class="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  {{ link.label }}
                </ULink>
              </li>
            </ul>
          </UCard>
        </aside>
      </div>
    </UPageSection>
  </div>
</template>
