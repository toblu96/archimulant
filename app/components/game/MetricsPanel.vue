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
  <div class="flex flex-col gap-4 p-4 h-full overflow-y-auto">
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
      <p class="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
        Metrics
      </p>
      <div class="flex flex-col gap-2">
        <div
          v-for="row in metricRows"
          :key="row.label"
          class="flex items-start justify-between gap-2 rounded-lg border border-default bg-elevated p-2.5"
        >
          <div class="flex items-center gap-1.5 min-w-0">
            <UIcon
              :name="row.icon"
              class="size-3.5 shrink-0 text-muted"
            />
            <span class="text-xs text-muted truncate">{{ row.label }}</span>
          </div>
          <div class="flex flex-col items-end gap-0.5 shrink-0">
            <span class="text-xs font-mono font-semibold text-default">{{ row.current }}</span>
            <div class="flex items-center gap-1">
              <span class="text-[10px] text-muted">{{ row.target }}</span>
              <UIcon
                :name="row.met ? 'i-lucide-check-circle' : 'i-lucide-x-circle'"
                class="size-3"
                :class="row.met ? 'text-success-500' : 'text-error-500'"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <USeparator />

    <!-- Budget -->
    <div>
      <p class="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
        Budget
      </p>
      <div class="flex flex-col gap-3">
        <!-- Yearly operational -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs text-muted">Running cost</span>
            <span
              class="text-xs font-mono"
              :class="yearlyOperationalCost > scenario.budget.yearlyOperational.limit ? 'text-error-500 font-semibold' : 'text-default'"
            >
              ${{ yearlyOperationalCost.toLocaleString('en-US') }} / ${{ scenario.budget.yearlyOperational.limit.toLocaleString('en-US') }}/yr
            </span>
          </div>
          <div class="h-1.5 rounded-full bg-elevated overflow-hidden">
            <div
              class="h-full rounded-full transition-all"
              :class="yearlyOperationalCost > scenario.budget.yearlyOperational.limit ? 'bg-error-500' : 'bg-primary'"
              :style="{ width: `${opBudgetPct}%` }"
            />
          </div>
        </div>

        <!-- One-time investment -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs text-muted">Setup cost</span>
            <span
              class="text-xs font-mono"
              :class="oneTimeCost > scenario.budget.oneTimeInvestment.limit ? 'text-error-500 font-semibold' : 'text-default'"
            >
              ${{ oneTimeCost.toLocaleString('en-US') }} / ${{ scenario.budget.oneTimeInvestment.limit.toLocaleString('en-US') }}
            </span>
          </div>
          <div class="h-1.5 rounded-full bg-elevated overflow-hidden">
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
      <p class="text-xs text-muted leading-relaxed">
        {{ scenario.meta.description }}
      </p>
      <div class="flex flex-wrap gap-1 mt-2">
        <UBadge
          v-for="tag in scenario.meta.tags"
          :key="tag"
          size="xs"
          color="neutral"
          variant="soft"
        >
          {{ tag }}
        </UBadge>
      </div>
    </div>
  </div>
</template>
