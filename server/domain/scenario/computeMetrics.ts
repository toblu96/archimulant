import type { Topology, ComputedMetrics } from '~~/server/domain/scenario/schema'

export function computeBaselineMetrics(topology: Topology): ComputedMetrics {
  const serviceNodes = topology.nodes.filter(n => n.type !== 'person')

  const availability
    = serviceNodes.reduce((acc, node) => {
      return acc * (node.metrics.availability ?? 1)
    }, 1) * 100

  const nodeTotalLatency = serviceNodes.reduce(
    (acc, node) => acc + (node.metrics.baseLatencyMillis ?? 0),
    0
  )
  const edgeTotalLatency = topology.edges.reduce(
    (acc, edge) => acc + edge.metrics.latencyMillis,
    0
  )
  const p99LatencyMillis = nodeTotalLatency + edgeTotalLatency

  const throughputValues = serviceNodes
    .map(n => n.metrics.maxThroughput)
    .filter((v): v is number => v !== undefined)
  const requestsPerSecond
    = throughputValues.length > 0 ? Math.min(...throughputValues) : 0

  return {
    availability: Math.round(availability * 1000) / 1000,
    p99LatencyMillis,
    requestsPerSecond
  }
}
