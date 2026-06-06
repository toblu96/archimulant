import type { Scenario, Metrics } from './scenario'

export function computeActualMetrics(scenario: Scenario): Metrics {
  const nonActorNodes = scenario.topology.nodes.filter(n => n.type !== 'person')
  const edges = scenario.topology.edges

  const availability = nonActorNodes.reduce(
    (acc, node) => acc * (node.metrics.availability || 1),
    100
  )

  const nodeLatency = nonActorNodes.reduce((acc, node) => acc + (node.metrics.latencyMs || 0), 0)
  const edgeLatency = edges.reduce((acc, edge) => acc + (edge.metrics.latencyMs || 0), 0)
  const latencyMs = nodeLatency + edgeLatency

  const nodeThroughputs = nonActorNodes
    .map(n => n.metrics.throughputRps)
    .filter((v): v is number => v !== undefined && v > 0)
  const edgeThroughputs = edges
    .map(e => e.metrics.throughputRps)
    .filter((v): v is number => v !== undefined && v > 0)
  const throughputRps = Math.min(...nodeThroughputs, ...edgeThroughputs)

  return { availability, throughputRps, latencyMs }
}
