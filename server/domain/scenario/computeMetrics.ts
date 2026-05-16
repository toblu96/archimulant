import type { Scenario, Metrics } from './scenario'

export function computeActualMetrics(scenario: Scenario): Metrics {
  const nonActorNodes = scenario.topology.nodes.filter(n => n.type !== 'person')

  const availability = nonActorNodes.reduce(
    (acc, node) => acc * (node.metrics.availability || 1),
    100
  )

  const latencyMs = nonActorNodes.reduce(
    (acc, node) => acc + (node.metrics.latencyMs || 0),
    0
  )

  const throughputValues = nonActorNodes
    .map(n => n.metrics.throughputRps)
    .filter((v): v is number => v !== undefined && v > 0)
  const throughputRps = throughputValues.length > 0 ? Math.min(...throughputValues) : 0

  return { availability, throughputRps, latencyMs }
}
