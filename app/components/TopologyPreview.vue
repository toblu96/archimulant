<script setup lang="ts">
import { MarkerType } from '@vue-flow/core'

const nodes = [
  {
    id: 'client',
    type: 'person' as const,
    position: { x: 50, y: 120 },
    data: {
      label: 'Browser Client',
      nodeType: 'person' as const,
      metrics: { requestsPerSecond: 800 },
      hasActiveImprovement: false
    }
  },
  {
    id: 'gateway',
    type: 'gateway' as const,
    position: { x: 220, y: 120 },
    data: {
      label: 'API Gateway',
      nodeType: 'gateway' as const,
      metrics: {
        availability: 0.999,
        throughputRps: 800,
        latencyMs: 10
      },
      hasActiveImprovement: false
    }
  },
  {
    id: 'api',
    type: 'service' as const,
    position: { x: 390, y: 120 },
    data: {
      label: 'API Server',
      nodeType: 'service' as const,
      metrics: {
        availability: 0.99,
        throughputRps: 250,
        latencyMs: 150
      },
      hasActiveImprovement: false
    }
  },
  {
    id: 'db',
    type: 'database' as const,
    position: { x: 560, y: 80 },
    data: {
      label: 'PostgreSQL',
      nodeType: 'database' as const,
      metrics: {
        availability: 0.995,
        throughputRps: 150,
        latencyMs: 40
      },
      hasActiveImprovement: false
    }
  },
  {
    id: 'cache',
    type: 'database' as const,
    position: { x: 560, y: 160 },
    data: {
      label: 'Redis Cache',
      nodeType: 'database' as const,
      metrics: {
        availability: 0.99,
        throughputRps: 1000,
        latencyMs: 5
      },
      hasActiveImprovement: true
    }
  },
  {
    id: 'auth',
    type: 'service' as const,
    position: { x: 220, y: 30 },
    data: {
      label: 'Auth Service',
      nodeType: 'service' as const,
      metrics: {
        availability: 0.995,
        throughputRps: 500,
        latencyMs: 30
      },
      hasActiveImprovement: false
    }
  }
]

const edges = [
  {
    id: 'client-gateway',
    source: 'client',
    target: 'gateway',
    type: 'metric',
    data: { label: 'HTTP request', metrics: { latencyMs: 5, failRate: 0.001 } },
    markerEnd: { type: MarkerType.ArrowClosed }
  },
  {
    id: 'gateway-api',
    source: 'gateway',
    target: 'api',
    type: 'metric',
    data: { label: 'route request', metrics: { latencyMs: 5, failRate: 0.001 } },
    markerEnd: { type: MarkerType.ArrowClosed }
  },
  {
    id: 'api-db',
    source: 'api',
    target: 'db',
    type: 'metric',
    data: { label: 'SQL query', metrics: { latencyMs: 20, failRate: 0.002 } },
    markerEnd: { type: MarkerType.ArrowClosed }
  },
  {
    id: 'api-cache',
    source: 'api',
    target: 'cache',
    type: 'metric',
    data: { label: 'cache lookup', metrics: { latencyMs: 3, failRate: 0.0005 } },
    animated: true,
    style: { stroke: 'var(--ui-primary)' },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--ui-primary)' }
  },
  {
    id: 'gateway-auth',
    source: 'gateway',
    target: 'auth',
    type: 'metric',
    data: { label: 'verify token', metrics: { latencyMs: 8, failRate: 0.002 } },
    markerEnd: { type: MarkerType.ArrowClosed }
  }
]
</script>

<template>
  <div class="rounded-xl border border-default bg-elevated overflow-hidden shadow-lg select-none">
    <!-- Mini toolbar -->
    <div class="flex items-center justify-between px-4 py-2.5 border-b border-default bg-default">
      <span class="text-xs font-mono text-muted">E-Commerce Peak Traffic</span>
      <div class="flex items-center gap-2">
        <UBadge
          color="success"
          variant="subtle"
        >
          99.2% avail
        </UBadge>
        <UBadge
          color="warning"
          variant="subtle"
        >
          184ms P95
        </UBadge>
        <UBadge
          color="neutral"
          variant="subtle"
        >
          $2.4k / $3k
        </UBadge>
      </div>
    </div>

    <!-- Canvas -->
    <div class="relative h-100">
      <GameFlowCanvas
        class="w-full h-full"
        :edges="edges"
        :nodes="nodes"
      />

      <!-- Applied improvement label -->
      <div class="absolute bottom-3 left-3">
        <UBadge
          color="primary"
          variant="soft"
          icon="i-tabler-circle-plus"
        >
          Cache added
        </UBadge>
      </div>
    </div>
  </div>
</template>
