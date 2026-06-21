<script setup lang="ts">
import type { GameImprovement, GameMetrics } from '~/composables/useGameSimulation'

defineProps<{
  available: GameImprovement[]
  applied: GameImprovement[]
  topologyLabels: Record<string, string>
}>()

const emit = defineEmits<{
  apply: [id: string]
  remove: [id: string]
  reset: []
}>()

function formatEffect(key: keyof GameMetrics, value: number): string {
  const sign = value > 0 ? '+' : ''
  if (key === 'availability') return `${sign}${(value * 100).toFixed(0)}%`
  if (key === 'throughputRps') return `${sign}${value} RPS`
  if (key === 'latencyMs') return `${sign}${value}ms`
  if (key === 'failRate') return `${sign}${(value * 100).toFixed(2)}%`
  return `${sign}${value}`
}

function effectIcon(key: keyof GameMetrics): string {
  if (key === 'availability') return 'i-tabler-shield-check'
  if (key === 'throughputRps' || key === 'requestsPerSecond') return 'i-tabler-gauge'
  if (key === 'latencyMs') return 'i-tabler-stopwatch'
  if (key === 'failRate') return 'i-tabler-cross'
  return 'i-tabler-gauge'
}
function effectDescription(key: keyof GameMetrics): string {
  if (key === 'availability') return 'Availability'
  if (key === 'throughputRps') return 'Throughput RPS'
  if (key === 'bandwidthRps') return 'Bandwidth RPS'
  if (key === 'requestsPerSecond') return 'Requests per Second (RPS)'
  if (key === 'latencyMs') return 'Latency Ms'
  if (key === 'failRate') return 'Fail Rate %'
  return '=)'
}

function effectColor(key: keyof GameMetrics, value: number): 'success' | 'error' {
  const isGood = (['availability', 'throughputRps', 'requestsPerSecond'] as string[]).includes(key)
    ? value > 0
    : value < 0
  return isGood ? 'success' : 'error'
}

function getTargetEffects(improvement: GameImprovement, labels: Record<string, string>) {
  return improvement.appliesTo
    .map(({ targetId, effects }) => {
      const items = (Object.entries(effects) as [keyof GameMetrics, number][])
        .filter(([, v]) => v !== 0)
        .map(([k, v]) => ({ label: formatEffect(k, v), icon: effectIcon(k), color: effectColor(k, v), description: effectDescription(k) }))
      return { name: labels[targetId] ?? targetId, items }
    })
    .filter(t => t.items.length > 0)
}

function formatCost(imp: GameImprovement): string {
  const parts: string[] = []
  if (imp.cost.yearlyOperational !== 0) parts.push(`$${imp.cost.yearlyOperational.toLocaleString('en-US')}/yr`)
  if (imp.cost.oneTimeInvestment !== 0) parts.push(`$${imp.cost.oneTimeInvestment.toLocaleString('en-US')} setup`)
  return parts.length ? parts.join(' + ') : 'Free'
}
</script>

<template>
  <div class="flex flex-col gap-4 p-4 h-full overflow-y-auto">
    <!-- Available improvements -->
    <div>
      <p class="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
        Available ({{ available.length }})
      </p>

      <div
        v-if="available.length === 0"
        class="text-sm text-muted text-center py-6"
      >
        All improvements applied
      </div>

      <div class="flex flex-col gap-3">
        <div
          v-for="imp in available"
          :key="imp.id"
          class="rounded-lg border border-default bg-elevated p-3"
        >
          <div class="flex items-start justify-between gap-2 mb-2">
            <span class="text-sm font-medium text-default leading-snug">{{ imp.title }}</span>
            <UButton
              size="sm"
              icon="i-tabler-plus"
              color="primary"
              variant="soft"
              class="shrink-0"
              @click="emit('apply', imp.id)"
            />
          </div>

          <div class="flex flex-wrap items-center justify-between gap-4">
            <p
              v-if="imp.description"
              class="text-xs text-muted leading-relaxed"
            >
              {{ imp.description }}
            </p>
            <span class="text-xs text-muted font-mono shrink-0 ml-auto">
              {{ formatCost(imp) }}
            </span>
          </div>

          <ULink
            v-if="imp.learnMoreSlug"
            :to="`/learn/${imp.learnMoreSlug}`"
            target="_blank"
            class="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <UIcon
              name="i-tabler-book-2"
              class="size-3.5"
            />
            Learn more
          </ULink>
        </div>
      </div>
    </div>

    <USeparator v-if="applied.length > 0" />

    <!-- Applied improvements -->
    <div v-if="applied.length > 0">
      <div class="flex items-center justify-between mb-3">
        <p class="text-xs font-semibold uppercase tracking-wider text-muted">
          Applied ({{ applied.length }})
        </p>
        <UTooltip text="Reset Scenario">
          <UButton
            size="sm"
            icon="i-tabler-trash"
            color="neutral"
            variant="ghost"
            class="shrink-0"
            @click="emit('reset')"
          />
        </UTooltip>
      </div>

      <div class="flex flex-col gap-3">
        <div
          v-for="imp in applied"
          :key="imp.id"
          class="rounded-lg border border-(--ui-primary)/50 bg-(--ui-primary)/5 p-3"
        >
          <div class="flex items-baseline justify-between gap-2 mb-2">
            <div class="flex items-center gap-2 min-w-0">
              <UIcon
                name="i-tabler-checkbox"
                class="size-5 text-primary shrink-0"
              />
              <span class="text-sm font-medium text-default truncate">{{ imp.title }}</span>
            </div>
            <UButton
              size="sm"
              icon="i-tabler-x"
              color="neutral"
              variant="ghost"
              class="shrink-0"
              @click="emit('remove', imp.id)"
            />
          </div>

          <div class="flex flex-col items-start justify-between gap-4">
            <!-- Per-target effects -->
            <div class="flex flex-col items-start justify-between gap-4">
              <div
                v-for="target in getTargetEffects(imp, topologyLabels)"
                :key="target.name"
              >
                <p class="text-xs text-muted mb-0.5">
                  {{ target.name }}
                </p>
                <div class="flex flex-wrap gap-2">
                  <UTooltip
                    v-for="effect in target.items"
                    :key="effect.label"
                    :text="effect.description"
                  >
                    <UBadge
                      variant="soft"
                      :color="effect.color"
                      :icon="effect.icon"
                      class="select-none"
                    >
                      {{ effect.label }}
                    </UBadge>
                  </UTooltip>
                </div>
              </div>
            </div>
            <span class="text-xs text-muted font-mono shrink-0 ml-auto">
              {{ formatCost(imp) }}
            </span>
            <ULink
              v-if="imp.learnMoreSlug"
              :to="`/learn/${imp.learnMoreSlug}`"
              target="_blank"
              class="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <UIcon
                name="i-tabler-book-2"
                class="size-3.5"
              />
              Learn more
            </ULink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
