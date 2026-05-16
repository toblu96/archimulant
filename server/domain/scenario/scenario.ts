import * as z from 'zod'
import { AppError } from '~~/server/domain/errors'

// --- ScenarioId ---

export const ScenarioIdSchema = z.string()
  .regex(/^[a-z0-9-]+$/, 'Scenario id must be lowercase alphanumeric with dashes')
  .brand('ScenarioId')

export type ScenarioId = z.infer<typeof ScenarioIdSchema>

export const ScenarioId = (raw: string): ScenarioId => {
  const result = ScenarioIdSchema.safeParse(raw)
  if (!result.success) {
    throw new AppError('urn:archimulant:invalid-scenario-id', `Invalid scenario id: ${raw}`)
  }
  return result.data
}

// --- Metrics ---

const MetricsSchema = z.object({
  availability: z.number().min(0).max(100).optional(),
  throughputRps: z.number().positive().optional(),
  latencyMs: z.number().positive().optional(),
  requestsPerSecond: z.number().positive().optional(),
  failRate: z.number().positive().optional()
})
export type Metrics = z.infer<typeof MetricsSchema>

// --- Difficulty ---

export const DifficultySchema = z.enum(['beginner', 'intermediate', 'advanced'])
export type Difficulty = z.infer<typeof DifficultySchema>

// --- Node ---

export const NodeSchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  type: z.enum(['person', 'service', 'database', 'gateway', 'externalSystem']),
  metrics: MetricsSchema
})
export type Node = z.infer<typeof NodeSchema>

// --- Edge ---

export const EdgeSchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  source: z.string().min(1),
  target: z.string().min(1),
  protocol: z.string().optional(),
  metrics: MetricsSchema
})
export type Edge = z.infer<typeof EdgeSchema>

// --- Improvement ---

const ImprovementSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  description: z.string().optional(),
  learnMoreSlug: z.string().optional(),
  cost: z.object({
    yearlyOperational: z.number(),
    oneTimeInvestment: z.number()
  }),
  appliesTo: z.object({
    targetId: z.string(),
    effects: z.object({
      availability: z.number().min(-100).max(100).optional(),
      throughputRps: z.number().optional(),
      latencyMs: z.number().optional(),
      requestsPerSecond: z.number().optional(),
      failRate: z.number().optional()
    })
  }).array()
})

// --- Scenario ---

export const ScenarioSchema = z.object({
  id: ScenarioIdSchema,
  meta: z.object(({
    title: z.string().min(1),
    description: z.string(),
    difficulty: DifficultySchema,
    tags: z.array(z.string()),
    estimatedMinutes: z.number().int().positive()
  })),
  budget: z.object({
    yearlyOperational: z.object({
      limit: z.number().nonnegative(),
      baselineCost: z.number().nonnegative()
    }),
    oneTimeInvestment: z.object({
      limit: z.number().nonnegative(),
      baselineCost: z.number().nonnegative()
    })
  }),
  targetMetrics: MetricsSchema,
  topology: z.object({
    nodes: z.array(NodeSchema),
    edges: z.array(EdgeSchema)
  }),
  improvements: z.array(ImprovementSchema)
})
export type Scenario = z.infer<typeof ScenarioSchema>

// ScenarioSummary is a domain projection — pick keeps it in sync with Scenario automatically.
export const ScenarioSummarySchema = ScenarioSchema.omit({ budget: true, topology: true, improvements: true })
export type ScenarioSummary = z.infer<typeof ScenarioSummarySchema>
