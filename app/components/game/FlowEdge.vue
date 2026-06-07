<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { Position } from '@vue-flow/core'
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@vue-flow/core'
import type { GameMetrics } from '~/composables/useGameSimulation'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  id: string
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sourcePosition: typeof Position[keyof typeof Position]
  targetPosition: typeof Position[keyof typeof Position]
  data: {
    label?: string
    metrics?: GameMetrics
  }
  markerEnd?: string
  style?: CSSProperties
  animated?: boolean
}>()

const path = computed(() =>
  getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition
  })
)

const metricIconMap: Record<string, string> = {
  latencyMs: 'i-tabler-stopwatch',
  bandwidthRps: 'i-tabler-activity',
  failRate: 'i-tabler-cross'
}

const badges = computed(() => {
  const m = props.data?.metrics
  if (!m) return []
  const result: { key: string, value: string, icon: string }[] = []
  if (m.latencyMs !== undefined) result.push({ key: 'latency', value: `${m.latencyMs}ms`, icon: metricIconMap.latencyMs || 'i-tabler-box' })
  if (m.bandwidthRps !== undefined) result.push({ key: 'bandwidth', value: `${m.bandwidthRps}↑`, icon: metricIconMap.bandwidthRps || 'i-tabler-box' })
  if (m.failRate !== undefined) result.push({ key: 'failRate', value: `${(m.failRate * 100).toFixed(1)}%`, icon: metricIconMap.failRate || 'i-tabler-box' })
  return result
})
</script>

<template>
  <BaseEdge
    :id="id"
    :path="path[0]"
    :marker-end="markerEnd"
    :style="style"
  />
  <EdgeLabelRenderer>
    <div
      :style="{
        transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
        pointerEvents: 'all'
      }"
      class="absolute text-center"
    >
      <div class="flex flex-col">
        <div
          v-if="data.label"
          class="text-xs font-medium px-1.5 py-0.5 rounded bg-default/90 whitespace-nowrap transition-colors"
          :class="animated ? 'text-primary' : 'text-muted'"
        >
          {{ data.label }}
        </div>

        <div class="flex gap-1">
          <UBadge
            v-for="badge in badges"
            :key="badge.key"
            color="neutral"
            variant="soft"
            size="xs"
            :icon="badge.icon"
          >
            {{ badge.value }}
          </UBadge>
        </div>
      </div>
    </div>
  </EdgeLabelRenderer>
</template>
