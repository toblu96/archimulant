import type { MaybeRef } from 'vue'

export interface GameMetrics {
  availability?: number
  throughputRps?: number
  bandwidthRps?: number
  latencyMs?: number
  requestsPerSecond?: number
  failRate?: number
}

export interface GameNode {
  id: string
  label: string
  type: 'person' | 'service' | 'database' | 'gateway' | 'externalSystem'
  position: { x: number, y: number }
  metrics: GameMetrics
}

export interface GameEdge {
  id: string
  label: string
  source: string
  target: string
  protocol?: string
  metrics: GameMetrics
}

export interface GameImprovement {
  id: string
  title: string
  description?: string
  learnMoreSlug?: string
  cost: { yearlyOperational: number, oneTimeInvestment: number }
  appliesTo: Array<{ targetId: string, effects: Partial<GameMetrics> }>
}

export interface GameScenario {
  id: string
  meta: {
    title: string
    description: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    tags: string[]
    estimatedMinutes: number
  }
  budget: {
    yearlyOperational: { limit: number, baselineCost: number }
    oneTimeInvestment: { limit: number, baselineCost: number }
  }
  targetMetrics: GameMetrics
  topology: { nodes: GameNode[], edges: GameEdge[] }
  improvements: GameImprovement[]
  actualMetrics: GameMetrics
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function applyEffects(metrics: GameMetrics, effects: Partial<GameMetrics>): GameMetrics {
  return {
    ...metrics,
    availability: effects.availability !== undefined
      ? clamp((metrics.availability ?? 0) + effects.availability, 0, 1)
      : metrics.availability,
    throughputRps: effects.throughputRps !== undefined
      ? Math.max(0, (metrics.throughputRps ?? 0) + effects.throughputRps)
      : metrics.throughputRps,
    latencyMs: effects.latencyMs !== undefined
      ? Math.max(0, (metrics.latencyMs ?? 0) + effects.latencyMs)
      : metrics.latencyMs,
    bandwidthRps: effects.bandwidthRps !== undefined
      ? Math.max(0, (metrics.bandwidthRps ?? 0) + effects.bandwidthRps)
      : metrics.bandwidthRps,
    failRate: effects.failRate !== undefined
      ? clamp((metrics.failRate ?? 0) + effects.failRate, 0, 1)
      : metrics.failRate,
    requestsPerSecond: effects.requestsPerSecond !== undefined
      ? Math.max(0, (metrics.requestsPerSecond ?? 0) + effects.requestsPerSecond)
      : metrics.requestsPerSecond
  }
}

function computeSystemMetrics(nodes: GameNode[], edges: GameEdge[]): GameMetrics {
  const nonPersonNodes = nodes.filter(n => n.type !== 'person')

  const availability = nonPersonNodes.reduce(
    (acc, node) => acc * clamp(node.metrics.availability ?? 1, 0, 1),
    1
  ) * 100

  const nodeLatency = nonPersonNodes.reduce((acc, n) => acc + (n.metrics.latencyMs ?? 0), 0)
  const edgeLatency = edges.reduce((acc, e) => acc + (e.metrics.latencyMs ?? 0), 0)
  const latencyMs = nodeLatency + edgeLatency

  const nodeThroughputs = nonPersonNodes
    .map(n => n.metrics.throughputRps)
    .filter((v): v is number => v !== undefined && v > 0)
  const edgeBandwidths = edges
    .map(e => e.metrics.bandwidthRps)
    .filter((v): v is number => v !== undefined && v > 0)
  const allThroughputs = [...nodeThroughputs, ...edgeBandwidths]
  const throughputRps = allThroughputs.length > 0 ? Math.min(...allThroughputs) : 0

  return { availability, latencyMs, throughputRps }
}

export function useGameSimulation(scenarioRef: MaybeRef<GameScenario | null>) {
  const scenario = isRef(scenarioRef) ? scenarioRef : ref(scenarioRef)

  const appliedIds = ref<string[]>([])

  const appliedImprovements = computed(() =>
    scenario.value?.improvements.filter(i => appliedIds.value.includes(i.id)) ?? []
  )

  const availableImprovements = computed(() =>
    scenario.value?.improvements.filter(i => !appliedIds.value.includes(i.id)) ?? []
  )

  function apply(id: string) {
    if (!appliedIds.value.includes(id)) {
      appliedIds.value = [...appliedIds.value, id]
    }
  }

  function remove(id: string) {
    appliedIds.value = appliedIds.value.filter(x => x !== id)
  }

  function reset() {
    appliedIds.value = []
  }

  const simulatedNodes = computed((): GameNode[] => {
    if (!scenario.value) return []
    return scenario.value.topology.nodes.map(node => ({
      ...node,
      metrics: appliedImprovements.value
        .flatMap(imp => imp.appliesTo.filter(a => a.targetId === node.id))
        .reduce((m, { effects }) => applyEffects(m, effects), { ...node.metrics })
    }))
  })

  const simulatedEdges = computed((): GameEdge[] => {
    if (!scenario.value) return []
    return scenario.value.topology.edges.map(edge => ({
      ...edge,
      metrics: appliedImprovements.value
        .flatMap(imp => imp.appliesTo.filter(a => a.targetId === edge.id))
        .reduce((m, { effects }) => applyEffects(m, effects), { ...edge.metrics })
    }))
  })

  const systemMetrics = computed((): GameMetrics => {
    if (!scenario.value) return {}
    return computeSystemMetrics(simulatedNodes.value, simulatedEdges.value)
  })

  const yearlyOperationalCost = computed(() => {
    const baseline = scenario.value?.budget.yearlyOperational.baselineCost ?? 0
    return baseline + appliedImprovements.value.reduce((s, i) => s + i.cost.yearlyOperational, 0)
  })

  const oneTimeCost = computed(() => {
    const baseline = scenario.value?.budget.oneTimeInvestment.baselineCost ?? 0
    return baseline + appliedImprovements.value.reduce((s, i) => s + i.cost.oneTimeInvestment, 0)
  })

  const isOverBudget = computed(() => {
    if (!scenario.value) return false
    return yearlyOperationalCost.value > scenario.value.budget.yearlyOperational.limit
      || oneTimeCost.value > scenario.value.budget.oneTimeInvestment.limit
  })

  const targetsMet = computed(() => {
    if (!scenario.value) return false
    const { targetMetrics } = scenario.value
    const m = systemMetrics.value
    return (
      (targetMetrics.availability === undefined || (m.availability ?? 0) >= targetMetrics.availability)
      && (targetMetrics.throughputRps === undefined || (m.throughputRps ?? 0) >= targetMetrics.throughputRps)
      && (targetMetrics.latencyMs === undefined || (m.latencyMs ?? Infinity) <= targetMetrics.latencyMs)
    )
  })

  const isWon = computed(() => targetsMet.value && !isOverBudget.value)

  function isTargetedByApplied(targetId: string) {
    return appliedImprovements.value.some(i => i.appliesTo.some(a => a.targetId === targetId))
  }

  return {
    appliedIds,
    appliedImprovements,
    availableImprovements,
    simulatedNodes,
    simulatedEdges,
    systemMetrics,
    yearlyOperationalCost,
    oneTimeCost,
    isOverBudget,
    targetsMet,
    isWon,
    apply,
    remove,
    reset,
    isTargetedByApplied
  }
}
