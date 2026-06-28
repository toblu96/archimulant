import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import * as z from 'zod'
import { AppError } from '~~/server/domain/errors'
import { ScenarioId, type ScenarioSummary } from '~~/server/domain/scenario/scenario'
import type { ScenarioRepository } from '~~/server/ports/scenario-repository'

// Wire format schema - describes the JSON file on disk.
// Versioned independently from the domain schema.

const MetricsSchema = z
  .object({
    availability: z.number().min(0).max(100).optional(),
    throughputRps: z.number().positive().optional(),
    bandwidthRps: z.number().positive().optional(),
    latencyMs: z.number().positive().optional(),
    requestsPerSecond: z.number().positive().optional(),
    failRate: z.number().positive().optional()
  })

const NodeFileSchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  type: z.enum(['person', 'service', 'database', 'gateway', 'externalSystem']),
  position: z.object({ x: z.number(), y: z.number() }),
  metrics: MetricsSchema
})

const EdgeFileSchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  source: z.string().min(1),
  target: z.string().min(1),
  protocol: z.string().optional(),
  metrics: MetricsSchema
})

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
      bandwidthRps: z.number().optional(),
      latencyMs: z.number().optional(),
      requestsPerSecond: z.number().optional(),
      failRate: z.number().optional()
    })
  }).array()
})

const ScenarioFileV1Schema = z.object({
  id: z.string().min(1),
  meta: z.object({
    title: z.string().min(1),
    description: z.string(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    tags: z.array(z.string()),
    estimatedMinutes: z.number().int().positive()
  }),
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
    nodes: z.array(NodeFileSchema),
    edges: z.array(EdgeFileSchema)
  }),
  improvements: z.array(ImprovementSchema)
})

type ScenarioFileV1 = z.infer<typeof ScenarioFileV1Schema>

async function loadFile(filePath: string): Promise<ScenarioFileV1 | null> {
  let raw: string
  try {
    raw = await readFile(filePath, 'utf-8')
  } catch (err) {
    if ((err as { code?: string }).code === 'ENOENT') return null
    throw new AppError('urn:archimulant:internal-error', `Failed to read scenario file: ${filePath}`, { cause: err })
  }

  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch (err) {
    throw new AppError('urn:archimulant:internal-error', `Invalid JSON in scenario file: ${filePath}`, { cause: err })
  }

  const result = ScenarioFileV1Schema.safeParse(json)
  if (!result.success) {
    throw new AppError('urn:archimulant:internal-error', `Malformed scenario file: ${filePath}`, { cause: result.error })
  }

  return result.data
}

export const createJsonFileScenarioRepository = (
  scenariosDir: string
): ScenarioRepository => ({
  async findById(id) {
    const file = await loadFile(join(scenariosDir, `${id}.json`))
    if (!file) return null

    return {
      id: ScenarioId(file.id),
      meta: file.meta,
      topology: file.topology,
      budget: file.budget,
      targetMetrics: file.targetMetrics,
      improvements: file.improvements
    }
  },

  async listAll() {
    let entries: string[]
    try {
      entries = await readdir(scenariosDir)
    } catch (err) {
      throw new AppError('urn:archimulant:internal-error', `Failed to read scenarios directory: ${scenariosDir}`, { cause: err })
    }

    const summaries: ScenarioSummary[] = []
    for (const entry of entries.filter(e => e.endsWith('.json'))) {
      const file = await loadFile(join(scenariosDir, entry))
      if (file) summaries.push({
        id: ScenarioId(file.id),
        meta: file.meta,
        targetMetrics: file.targetMetrics
      })
    }
    return summaries
  }
})
