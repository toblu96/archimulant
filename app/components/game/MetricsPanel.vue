<script setup lang="ts">
import type { GameMetrics, GameScenario } from '~/composables/useGameSimulation'

const showInfo = ref(false)

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
      icon: 'i-tabler-shield-check',
      current: `${current.toFixed(2)}%`,
      target: `≥ ${targetMetrics.availability}%`,
      met: current >= targetMetrics.availability
    })
  }

  if (targetMetrics.latencyMs !== undefined) {
    const current = m.latencyMs ?? 0
    rows.push({
      label: 'Latency P95',
      icon: 'i-tabler-stopwatch',
      current: `${current.toFixed(0)}ms`,
      target: `≤ ${targetMetrics.latencyMs}ms`,
      met: current <= targetMetrics.latencyMs
    })
  }

  if (targetMetrics.throughputRps !== undefined) {
    const current = m.throughputRps ?? 0
    rows.push({
      label: 'Throughput',
      icon: 'i-tabler-activity',
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
      icon="i-tabler-trophy"
      color="success"
      variant="soft"
      title="All targets met!"
    />

    <!-- Metrics -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <p class="text-xs font-semibold uppercase tracking-wider text-muted">
          Metrics
        </p>
        <UButton
          icon="i-tabler-info-circle"
          color="neutral"
          variant="ghost"
          size="xs"
          @click="showInfo = true"
        />
      </div>
      <div class="flex flex-col gap-2">
        <div
          v-for="row in metricRows"
          :key="row.label"
          class="rounded-lg border border-default bg-elevated p-3"
        >
          <div class="flex items-center gap-2 mb-2">
            <UIcon
              :name="row.icon"
              class="size-5 shrink-0 text-muted"
            />
            <span class="text-sm font-medium text-default">{{ row.label }}</span>
            <UIcon
              :name="row.met ? 'i-tabler-checkbox' : 'i-tabler-circle-x'"
              class="size-5 ml-auto shrink-0"
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
          <div class="flex flex-col items-start justify-between space-y-2">
            <span class="text-sm text-muted">Running cost</span>
            <UProgress :model-value="opBudgetPct" />
            <span
              class="text-sm font-mono font-medium self-end"
              :class="yearlyOperationalCost > scenario.budget.yearlyOperational.limit ? 'text-error-500' : 'text-default'"
            >
              ${{ yearlyOperationalCost.toLocaleString('en-US') }} / ${{ scenario.budget.yearlyOperational.limit.toLocaleString('en-US') }}/yr
            </span>
          </div>
        </div>

        <!-- One-time investment -->
        <div>
          <div class="flex flex-col items-start justify-between space-y-2">
            <span class="text-sm text-muted">Setup cost</span>
            <UProgress :model-value="setupBudgetPct" />
            <span
              class="text-sm font-mono font-medium self-end"
              :class="oneTimeCost > scenario.budget.oneTimeInvestment.limit ? 'text-error-500' : 'text-default'"
            >
              ${{ oneTimeCost.toLocaleString('en-US') }} / ${{ scenario.budget.oneTimeInvestment.limit.toLocaleString('en-US') }}/yr
            </span>
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

  <UModal
    v-model:open="showInfo"
    title="How metrics are calculated"
  >
    <template #body>
      <div class="space-y-6">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <UIcon
              name="i-tabler-shield-check"
              class="size-4 text-muted shrink-0"
            />
            <span class="text-sm font-semibold text-default">Availability</span>
          </div>
          <p class="text-sm text-muted leading-relaxed">
            Product of every service's uptime. Each dependency that can fail multiplies the risk — one unreliable node pulls the whole chain down.
          </p>
          <div class="font-mono text-xs bg-elevated rounded-md px-3 py-2 text-muted">
            system = API% × DB% × … × 100
          </div>
        </div>

        <USeparator />

        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <UIcon
              name="i-tabler-stopwatch"
              class="size-4 text-muted shrink-0"
            />
            <span class="text-sm font-semibold text-default">Latency</span>
          </div>
          <p class="text-sm text-muted leading-relaxed">
            Sum of all network hops (edges) and processing times (nodes). Every step in the call chain adds delay — end-to-end time is the full round trip.
          </p>
          <div class="font-mono text-xs bg-elevated rounded-md px-3 py-2 text-muted">
            system = Σ edge latencies + Σ node processing
          </div>
        </div>

        <USeparator />

        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <UIcon
              name="i-tabler-activity"
              class="size-4 text-muted shrink-0"
            />
            <span class="text-sm font-semibold text-default">Throughput</span>
          </div>
          <p class="text-sm text-muted leading-relaxed">
            The narrowest bottleneck in your system. Traffic can only flow as fast as the slowest component — node capacity or link bandwidth, whichever is smallest.
          </p>
          <div class="font-mono text-xs bg-elevated rounded-md px-3 py-2 text-muted">
            system = min(node capacities, link bandwidths)
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
