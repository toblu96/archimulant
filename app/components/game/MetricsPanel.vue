<script setup lang="ts">
import type { GameMetrics, GameScenario } from '~/composables/useGameSimulation'

const props = defineProps<{
  scenario: GameScenario
  systemMetrics: GameMetrics
  yearlyOperationalCost: number
  oneTimeCost: number
  isOverBudget: boolean
  isWon: boolean
}>()

interface MetricRow {
  label: string
  icon: string
  current: string
  target: string
  met: boolean
}

const metricRows = computed((): MetricRow[] => {
  const { targetMetrics } = props.scenario
  const m = props.systemMetrics
  const rows: MetricRow[] = []

  if (targetMetrics.availability !== undefined) {
    const current = m.availability ?? 0
    rows.push({
      label: 'Availability',
      icon: 'i-lucide-shield-check',
      current: `${current.toFixed(2)}%`,
      target: `≥ ${targetMetrics.availability}%`,
      met: current >= targetMetrics.availability
    })
  }

  if (targetMetrics.latencyMs !== undefined) {
    const current = m.latencyMs ?? 0
    rows.push({
      label: 'Latency P95',
      icon: 'i-lucide-timer',
      current: `${current.toFixed(0)}ms`,
      target: `≤ ${targetMetrics.latencyMs}ms`,
      met: current <= targetMetrics.latencyMs
    })
  }

  if (targetMetrics.throughputRps !== undefined) {
    const current = m.throughputRps ?? 0
    rows.push({
      label: 'Throughput',
      icon: 'i-lucide-activity',
      current: `${current.toFixed(0)} RPS`,
      target: `≥ ${targetMetrics.throughputRps} RPS`,
      met: current >= targetMetrics.throughputRps
    })
  }

  return rows
})

const opBudgetPct = computed(() =>
  Math.min(100, (props.yearlyOperationalCost / props.scenario.budget.yearlyOperational.limit) * 100)
)

const setupBudgetPct = computed(() =>
  Math.min(100, (props.oneTimeCost / props.scenario.budget.oneTimeInvestment.limit) * 100)
)
</script>

<template>
  <div class="flex flex-col gap-5 p-4 h-full overflow-y-auto">
    <!-- Win banner -->
    <UAlert
      v-if="isWon"
      icon="i-lucide-trophy"
      color="success"
      variant="soft"
      title="All targets met!"
      description="You can keep optimizing or exit."
    />

    <!-- Metrics -->
    <div>
      <p class="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
        Metrics
      </p>
      <div class="flex flex-col gap-2">
        <div
          v-for="row in metricRows"
          :key="row.label"
          class="rounded-lg border border-default bg-elevated p-3"
        >
          <div class="flex items-center gap-2 mb-2">
            <UIcon
              :name="row.icon"
              class="size-4 shrink-0 text-muted"
            />
            <span class="text-sm font-medium text-default">{{ row.label }}</span>
            <UIcon
              :name="row.met ? 'i-lucide-check-circle' : 'i-lucide-x-circle'"
              class="size-4 ml-auto shrink-0"
              :class="row.met ? 'text-success-500' : 'text-error-500'"
            />
          </div>
          <div class="flex items-baseline justify-between gap-2">
            <span class="text-xl font-mono font-semibold text-default">{{ row.current }}</span>
            <span class="text-sm text-muted">{{ row.target }}</span>
          </div>
        </div>
      </div>
    </div>

    <USeparator />

    <!-- Budget -->
    <div>
      <p class="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
        Budget
      </p>
      <div class="flex flex-col gap-4">
        <!-- Yearly operational -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-sm text-muted">Running cost</span>
            <span
              class="text-sm font-mono font-medium"
              :class="yearlyOperationalCost > scenario.budget.yearlyOperational.limit ? 'text-error-500' : 'text-default'"
            >
              ${{ yearlyOperationalCost.toLocaleString('en-US') }} / ${{ scenario.budget.yearlyOperational.limit.toLocaleString('en-US') }}/yr
            </span>
          </div>
          <div class="h-2 rounded-full bg-elevated overflow-hidden">
            <div
              class="h-full rounded-full transition-all"
              :class="yearlyOperationalCost > scenario.budget.yearlyOperational.limit ? 'bg-error-500' : 'bg-primary'"
              :style="{ width: `${opBudgetPct}%` }"
            />
          </div>
        </div>

        <!-- One-time investment -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-sm text-muted">Setup cost</span>
            <span
              class="text-sm font-mono font-medium"
              :class="oneTimeCost > scenario.budget.oneTimeInvestment.limit ? 'text-error-500' : 'text-default'"
            >
              ${{ oneTimeCost.toLocaleString('en-US') }} / ${{ scenario.budget.oneTimeInvestment.limit.toLocaleString('en-US') }}
            </span>
          </div>
          <div class="h-2 rounded-full bg-elevated overflow-hidden">
            <div
              class="h-full rounded-full transition-all"
              :class="oneTimeCost > scenario.budget.oneTimeInvestment.limit ? 'bg-error-500' : 'bg-primary'"
              :style="{ width: `${setupBudgetPct}%` }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Scenario info -->
    <USeparator />
    <div>
      <p class="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
        Scenario
      </p>
      <p class="text-sm text-muted leading-relaxed">
        {{ scenario.meta.description }}
      </p>
      <div class="flex flex-wrap gap-1.5 mt-3">
        <UBadge
          v-for="tag in scenario.meta.tags"
          :key="tag"
          color="neutral"
          variant="soft"
        >
          {{ tag }}
        </UBadge>
      </div>
    </div>
  </div>
</template>
