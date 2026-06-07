<script setup lang="ts">
import { VueFlow, MarkerType } from '@vue-flow/core'
import type { GameScenario } from '~/composables/useGameSimulation'

definePageMeta({
  layout: 'game',
  auth: false
})

const route = useRoute()
const slug = route.params.slug as string

const { data, error } = await useFetch<GameScenario>(`/api/scenarios/${slug}`)

if (error.value) {
  throw createError({ statusCode: error.value.statusCode ?? 404, message: 'Scenario not found' })
}

const scenario = computed(() => data.value ?? null)

const {
  appliedImprovements,
  availableImprovements,
  simulatedNodes,
  simulatedEdges,
  systemMetrics,
  yearlyOperationalCost,
  oneTimeCost,
  isOverBudget,
  isWon,
  apply,
  remove,
  isTargetedByApplied
} = useGameSimulation(scenario)

// VueFlow nodes — updated whenever simulated state changes
const flowNodes = computed(() =>
  simulatedNodes.value.map(node => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: {
      label: node.label,
      nodeType: node.type,
      metrics: node.metrics,
      hasActiveImprovement: isTargetedByApplied(node.id)
    }
  }))
)

const flowEdges = computed(() =>
  simulatedEdges.value.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    type: 'smoothstep',
    animated: isTargetedByApplied(edge.id),
    style: { stroke: isTargetedByApplied(edge.id) ? 'var(--ui-primary)' : 'var(--ui-border)' },
    labelStyle: { fill: 'var(--ui-text-muted)', fontSize: '10px', fontFamily: 'inherit' },
    labelBgStyle: { fill: 'var(--ui-bg)', rx: 4, ry: 4 },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--ui-border)' }
  }))
)

// Mobile tab
const activeTab = ref('canvas')
const mobileTabs = [
  { label: 'Canvas', value: 'canvas', icon: 'i-tabler-network' },
  { label: 'Metrics', value: 'metrics', icon: 'i-tabler-activity' },
  { label: 'Improve', value: 'improvements', icon: 'i-tabler-tool' }
]

// Win modal
const showWinModal = ref(false)
watch(isWon, (won) => {
  if (won) showWinModal.value = true
})
</script>

<template>
  <div class="h-full">
    <div
      v-if="scenario"
      class="h-full"
    >
      <!-- Desktop: three-panel layout -->
      <div class="hidden md:flex h-full">
        <!-- Left panel: metrics -->
        <aside class="w-64 flex-none border-r border-default overflow-hidden">
          <GameMetricsPanel
            :scenario="scenario"
            :system-metrics="systemMetrics"
            :yearly-operational-cost="yearlyOperationalCost"
            :one-time-cost="oneTimeCost"
            :is-over-budget="isOverBudget"
            :is-won="isWon"
          />
        </aside>

        <!-- Center: VueFlow canvas -->
        <div class="flex-1 relative min-w-0">
          <ClientOnly>
            <VueFlow
              :nodes="flowNodes"
              :edges="flowEdges"
              :nodes-connectable="false"
              :edges-updatable="false"
              class="h-full"
              @pane-ready="({ fitView }) => fitView()"
            >
              <template #node-person="props">
                <GameFlowNode v-bind="props" />
              </template>
              <template #node-service="props">
                <GameFlowNode v-bind="props" />
              </template>
              <template #node-database="props">
                <GameFlowNode v-bind="props" />
              </template>
              <template #node-gateway="props">
                <GameFlowNode v-bind="props" />
              </template>
              <template #node-externalSystem="props">
                <GameFlowNode v-bind="props" />
              </template>
            </VueFlow>
          </ClientOnly>
        </div>

        <!-- Right panel: improvements -->
        <aside class="w-72 flex-none border-l border-default overflow-hidden">
          <GameImprovementsPanel
            :available="availableImprovements"
            :applied="appliedImprovements"
            @apply="apply"
            @remove="remove"
          />
        </aside>
      </div>

      <!-- Mobile: tabbed layout -->
      <div class="flex flex-col h-full md:hidden">
        <div class="flex-1 min-h-0 overflow-hidden">
          <div
            v-if="activeTab === 'canvas'"
            class="h-full"
          >
            <ClientOnly>
              <VueFlow
                :nodes="flowNodes"
                :edges="flowEdges"
                :nodes-connectable="false"
                :edges-updatable="false"
                class="h-full"
              >
                <template #node-person="props">
                  <GameFlowNode v-bind="props" />
                </template>
                <template #node-service="props">
                  <GameFlowNode v-bind="props" />
                </template>
                <template #node-database="props">
                  <GameFlowNode v-bind="props" />
                </template>
                <template #node-gateway="props">
                  <GameFlowNode v-bind="props" />
                </template>
                <template #node-externalSystem="props">
                  <GameFlowNode v-bind="props" />
                </template>
              </VueFlow>
            </ClientOnly>
          </div>

          <div
            v-show="activeTab === 'metrics'"
            class="h-full overflow-hidden"
          >
            <GameMetricsPanel
              :scenario="scenario"
              :system-metrics="systemMetrics"
              :yearly-operational-cost="yearlyOperationalCost"
              :one-time-cost="oneTimeCost"
              :is-over-budget="isOverBudget"
              :is-won="isWon"
            />
          </div>

          <div
            v-show="activeTab === 'improvements'"
            class="h-full overflow-hidden"
          >
            <GameImprovementsPanel
              :available="availableImprovements"
              :applied="appliedImprovements"
              @apply="apply"
              @remove="remove"
            />
          </div>
        </div>

        <!-- Bottom tab bar -->
        <nav class="flex-none border-t border-default bg-default flex">
          <button
            v-for="tab in mobileTabs"
            :key="tab.value"
            class="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs transition-colors"
            :class="activeTab === tab.value
              ? 'text-primary'
              : 'text-muted'"
            @click="activeTab = tab.value"
          >
            <UIcon
              :name="tab.icon"
              class="size-4"
            />
            {{ tab.label }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Win modal -->
    <UModal
      v-model:open="showWinModal"
      title="All targets met!"
      :ui="{ footer: 'justify-end' }"
    >
      <template #body>
        <div class="space-y-3">
          <p class="text-sm text-muted">
            You improved the system within budget. Here's what you applied:
          </p>
          <ul class="space-y-1">
            <li
              v-for="imp in appliedImprovements"
              :key="imp.id"
              class="flex items-center gap-2 text-sm"
            >
              <UIcon
                name="i-tabler-check"
                class="size-4 text-success-500 shrink-0"
              />
              {{ imp.title }}
            </li>
          </ul>
        </div>
      </template>

      <template #footer>
        <UButton
          color="neutral"
          variant="ghost"
          @click="showWinModal = false"
        >
          Keep exploring
        </UButton>
        <UButton
          to="/play"
          trailing-icon="i-tabler-arrow-right"
        >
          Next scenario
        </UButton>
      </template>
    </UModal>
  </div>
</template>
