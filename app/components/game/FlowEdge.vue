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

const badges = computed(() => {
  const m = props.data?.metrics
  if (!m) return []
  const result: { key: string, value: string }[] = []
  if (m.latencyMs !== undefined) result.push({ key: 'latency', value: `${m.latencyMs}ms` })
  if (m.bandwidthRps !== undefined) result.push({ key: 'bandwidth', value: `${m.bandwidthRps}↑` })
  if (m.failRate !== undefined) result.push({ key: 'failRate', value: `${(m.failRate * 100).toFixed(1)}%↯` })
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
      <div class="flex">
        <div
          v-if="data.label"
          class="text-xs font-medium px-1.5 py-0.5 rounded bg-default/90 whitespace-nowrap transition-colors"
          :class="animated ? 'text-primary' : 'text-muted'"
        >
          {{ data.label }}
        </div>

        <UBadge
          v-if="badges.length"
          color="neutral"
          variant="soft"
          size="xs"
        >
          {{ badges.flatMap(badge => badge.value).join(' | ') }}
        </UBadge>
      </div>
    </div>
  </EdgeLabelRenderer>
</template>
