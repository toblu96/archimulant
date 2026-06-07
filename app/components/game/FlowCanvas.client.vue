<script setup lang="ts">
import { VueFlow, Panel, useVueFlow } from '@vue-flow/core'
import type { GameMetrics } from '~/composables/useGameSimulation'
import { useLayout } from '~/composables/useFlowLayout'

type NodeType = 'person' | 'service' | 'database' | 'gateway' | 'externalSystem'

type FlowNode = {
  id: string
  type: NodeType
  position: { x: number, y: number }
  data: {
    label: string
    nodeType: NodeType
    metrics: GameMetrics
    hasActiveImprovement: boolean
  }
  [key: string]: unknown
}

type FlowEdge = {
  id: string
  source: string
  target: string
  data?: {
    label?: string
    metrics?: GameMetrics
  }
  [key: string]: unknown
}

const props = defineProps<{
  nodes: FlowNode[]
  edges: FlowEdge[]
}>()

const { layout } = useLayout()
const { fitView, zoomIn, zoomOut } = useVueFlow()

// VueFlow owns positions via v-model:nodes - only prop data updates flow in from outside
const internalNodes = ref<FlowNode[]>([...props.nodes])

watch(() => props.nodes, (updated) => {
  for (const src of updated) {
    const n = internalNodes.value.find(n => n.id === src.id)
    if (n) n.data = { ...src.data }
  }
}, { deep: true })

async function applyLayout(direction: 'LR' | 'TB') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  internalNodes.value = layout(internalNodes.value as any, props.edges, direction) as unknown as FlowNode[]
  await nextTick()
  fitView()
}

const panelActions = [
  { id: 'zoomIn', icon: 'i-tabler-plus', click: () => { zoomIn() } },
  { id: 'zoomOut', icon: 'i-tabler-minus', click: () => { zoomOut() } },
  { id: 'fitView', icon: 'i-tabler-zoom-scan', click: () => { fitView() } },
  { id: 'layoutLR', icon: 'i-tabler-arrows-move-horizontal', click: () => { applyLayout('LR') } },
  { id: 'layoutTB', icon: 'i-tabler-arrows-move-vertical', click: () => { applyLayout('TB') } }
]
</script>

<template>
  <VueFlow
    v-model:nodes="internalNodes"
    :edges="edges"
    :nodes-connectable="false"
    :edges-updatable="false"
    class="h-full"
    @nodes-initialized="applyLayout('TB')"
  >
    <Panel
      position="top-right"
      class="flex border border-default"
    >
      <UButton
        v-for="action in panelActions"
        :key="action.id"
        :icon="action.icon"
        color="neutral"
        variant="ghost"
        class="shrink-0"
        @click="action.click"
      />
    </Panel>

    <template #edge-metric="edgeProps">
      <GameFlowEdge v-bind="edgeProps" />
    </template>

    <template #node-person="nodeProps">
      <GameFlowNode v-bind="nodeProps" />
    </template>
    <template #node-service="nodeProps">
      <GameFlowNode v-bind="nodeProps" />
    </template>
    <template #node-database="nodeProps">
      <GameFlowNode v-bind="nodeProps" />
    </template>
    <template #node-gateway="nodeProps">
      <GameFlowNode v-bind="nodeProps" />
    </template>
    <template #node-externalSystem="nodeProps">
      <GameFlowNode v-bind="nodeProps" />
    </template>
  </VueFlow>
</template>
