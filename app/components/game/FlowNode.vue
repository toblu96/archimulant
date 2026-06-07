<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import type { GameMetrics } from '~/composables/useGameSimulation'

defineOptions({ inheritAttrs: false })

interface FlowNodeData {
  label: string
  nodeType: 'person' | 'service' | 'database' | 'gateway' | 'externalSystem'
  metrics: GameMetrics
  hasActiveImprovement: boolean
}

const props = defineProps<{
  id: string
  data: FlowNodeData
  selected: boolean
}>()

const iconMap: Record<string, string> = {
  person: 'i-tabler-device-desktop',
  service: 'i-tabler-server',
  database: 'i-tabler-database',
  gateway: 'i-tabler-shield',
  externalSystem: 'i-tabler-world'
}

const borderClass = computed(() => {
  if (props.selected) return 'border-(--ui-primary) ring-2 ring-(--ui-primary)/30'
  if (props.data.hasActiveImprovement) return 'border-(--ui-primary)'
  return 'border-(--ui-border)'
})
</script>

<template>
  <Handle
    type="target"
    :position="Position.Top"
    class="opacity-0! w-2! h-2!"
  />
  <Handle
    type="target"
    :position="Position.Left"
    class="opacity-0! w-2! h-2!"
  />

  <div
    class="relative rounded-lg border bg-default px-3 py-2 min-w-32 shadow-sm transition-colors"
    :class="borderClass"
  >
    <div class="flex items-center gap-2 mb-1">
      <UIcon
        :name="iconMap[data.nodeType] ?? 'i-tabler-box'"
        class="size-3.5 shrink-0 text-muted"
        :class="{ 'text-primary!': data.hasActiveImprovement }"
      />
      <span class="text-xs font-medium text-default truncate max-w-28">
        {{ data.label }}
      </span>
    </div>

    <div
      v-if="data.nodeType !== 'person'"
      class="flex flex-wrap gap-1"
    >
      <span
        v-if="data.metrics.availability !== undefined"
        class="text-xs text-muted bg-elevated rounded px-1.5 py-0.5"
      >
        {{ (data.metrics.availability * 100).toFixed(1) }}%
      </span>
      <span
        v-if="data.metrics.throughputRps !== undefined"
        class="text-xs text-muted bg-elevated rounded px-1.5 py-0.5"
      >
        {{ data.metrics.throughputRps }}↑
      </span>
      <span
        v-if="data.metrics.latencyMs !== undefined"
        class="text-xs text-muted bg-elevated rounded px-1.5 py-0.5"
      >
        {{ data.metrics.latencyMs }}ms
      </span>
    </div>

    <div
      v-if="data.hasActiveImprovement"
      class="absolute -top-1.5 -right-1.5 size-3 rounded-full bg-primary"
    />
  </div>

  <Handle
    type="source"
    :position="Position.Bottom"
    class="opacity-0! w-2! h-2!"
  />
  <Handle
    type="source"
    :position="Position.Right"
    class="opacity-0! w-2! h-2!"
  />
</template>
