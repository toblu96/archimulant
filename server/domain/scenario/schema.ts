import * as z from 'zod'

const NodeMetricsSchema = z
  .object({
    requestsPerSecond: z.number().optional(),
    availability: z.number().min(0).max(1).optional(),
    maxThroughput: z.number().optional(),
    baseLatencyMillis: z.number().optional()
  })
  .strict()

export const NodeSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    type: z.enum(['person', 'service', 'database', 'gateway', 'externalSystem']),
    position: z.object({ x: z.number(), y: z.number() }),
    metrics: NodeMetricsSchema
  })
  .strict()

export const EdgeSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    source: z.string(),
    target: z.string(),
    metrics: z
      .object({
        latencyMillis: z.number(),
        maxThroughput: z.number(),
        failRate: z.number().min(0).max(1)
      })
      .strict()
  })
  .strict()

export const ImprovementSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    learnMoreSlug: z.string().optional(),
    appliesTo: z.discriminatedUnion('scope', [
      z.object({
        scope: z.literal('general')
      }),
      z.object({
        scope: z.literal('targeted'),
        targets: z.array(
          z.object({
            type: z.enum(['node', 'edge']),
            id: z.string()
          })
        )
      })
    ]),
    cost: z.object({
      yearlyOperational: z.number().min(0),
      oneTimeInvestment: z.number().min(0)
    }),
    effects: z.object({
      availabilityDelta: z.number(),
      baseLatencyMillisDelta: z.number(),
      throughputMultiplier: z.number().positive(),
      failRateDelta: z.number()
    })
  })
  .strict()

export const TopologySchema = z
  .object({
    nodes: z.array(NodeSchema),
    edges: z.array(EdgeSchema)
  })
  .strict()

export const TargetMetricsSchema = z
  .object({
    availability: z.number().min(0).max(100),
    p99LatencyMillis: z.number().positive(),
    requestsPerSecond: z.number().positive()
  })
  .strict()

export const ComputedMetricsSchema = z
  .object({
    availability: z.number().min(0).max(100),
    p99LatencyMillis: z.number().positive(),
    requestsPerSecond: z.number().positive()
  })
  .strict()

export const ScenarioFileSchema = z
  .object({
    id: z.string(),
    meta: z.object({
      title: z.string(),
      description: z.string(),
      difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
      tags: z.array(z.string()),
      estimatedMinutes: z.number().positive()
    }),
    budget: z.object({
      yearlyOperational: z.object({
        limit: z.number().positive(),
        baselineCost: z.number().min(0)
      }),
      oneTimeInvestment: z.object({
        limit: z.number().positive(),
        baselineCost: z.number().min(0)
      })
    }),
    targetMetrics: TargetMetricsSchema,
    topology: TopologySchema,
    improvements: z.array(ImprovementSchema)
  })
  .strict()

export type Node = z.infer<typeof NodeSchema>
export type Edge = z.infer<typeof EdgeSchema>
export type Improvement = z.infer<typeof ImprovementSchema>
export type Topology = z.infer<typeof TopologySchema>
export type TargetMetrics = z.infer<typeof TargetMetricsSchema>
export type ComputedMetrics = z.infer<typeof ComputedMetricsSchema>
export type ScenarioFile = z.infer<typeof ScenarioFileSchema>

export type ScenarioSummary = {
  id: string
  meta: ScenarioFile['meta']
  targetMetrics: TargetMetrics
}

export type Scenario = ScenarioFile & {
  baselineMetrics: ComputedMetrics
}
