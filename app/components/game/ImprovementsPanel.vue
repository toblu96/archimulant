<script setup lang="ts">
import type { GameImprovement, GameMetrics } from '~/composables/useGameSimulation'

defineProps<{
  available: GameImprovement[]
  applied: GameImprovement[]
}>()

const emit = defineEmits<{
  apply: [id: string]
  remove: [id: string]
}>()

function formatEffect(key: keyof GameMetrics, value: number): string {
  const sign = value > 0 ? '+' : ''
  if (key === 'availability') return `${sign}${(value * 100).toFixed(0)}% avail`
  if (key === 'throughputRps') return `${sign}${value} RPS`
  if (key === 'latencyMs') return `${sign}${value}ms latency`
  if (key === 'failRate') return `${sign}${(value * 100).toFixed(2)}% fail rate`
  return `${sign}${value}`
}

function effectColor(key: keyof GameMetrics, value: number): string {
  const isGood = (['availability', 'throughputRps', 'requestsPerSecond'] as string[]).includes(key)
    ? value > 0
    : value < 0
  return isGood ? 'text-success-500' : 'text-error-500'
}

function getEffects(improvement: GameImprovement) {
  return improvement.appliesTo.flatMap(({ effects }) =>
    (Object.entries(effects) as [keyof GameMetrics, number][])
      .filter(([, v]) => v !== 0)
      .map(([k, v]) => ({ label: formatEffect(k, v), color: effectColor(k, v) }))
  )
}

function formatCost(imp: GameImprovement): string {
  const parts: string[] = []
  if (imp.cost.yearlyOperational > 0) parts.push(`$${imp.cost.yearlyOperational.toLocaleString('en-US')}/yr`)
  if (imp.cost.oneTimeInvestment > 0) parts.push(`$${imp.cost.oneTimeInvestment.toLocaleString('en-US')} setup`)
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

          <p
            v-if="imp.description"
            class="text-xs text-muted leading-relaxed mb-3"
          >
            {{ imp.description }}
          </p>

          <div class="flex flex-wrap items-center gap-2 justify-between">
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="effect in getEffects(imp)"
                :key="effect.label"
                class="text-xs font-mono font-medium"
                :class="effect.color"
              >
                {{ effect.label }}
              </span>
            </div>
            <span class="text-xs text-muted font-mono shrink-0">
              {{ formatCost(imp) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <USeparator v-if="applied.length > 0" />

    <!-- Applied improvements -->
    <div v-if="applied.length > 0">
      <p class="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
        Applied ({{ applied.length }})
      </p>

      <div class="flex flex-col gap-3">
        <div
          v-for="imp in applied"
          :key="imp.id"
          class="rounded-lg border border-(--ui-primary)/50 bg-(--ui-primary)/5 p-3"
        >
          <div class="flex items-center justify-between gap-2 mb-2">
            <div class="flex items-center gap-2 min-w-0">
              <UIcon
                name="i-tabler-checkbox"
                class="size-4 text-primary shrink-0"
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

          <div class="flex flex-wrap items-center gap-2 justify-between">
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="effect in getEffects(imp)"
                :key="effect.label"
                class="text-xs font-mono font-medium"
                :class="effect.color"
              >
                {{ effect.label }}
              </span>
            </div>
            <span class="text-xs text-muted font-mono shrink-0">
              {{ formatCost(imp) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
