import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ScenarioFileSchema } from '~~/server/domain/scenario/schema'
import { computeBaselineMetrics } from '~~/server/domain/scenario/computeMetrics'
import { AdapterError } from '~~/server/utils/errors'
import type { ScenarioRepository } from './port'
import type { Scenario, ScenarioSummary } from '~~/server/domain/scenario/schema'

const SCENARIOS_DIR = join(process.cwd(), 'server/data/scenarios')

async function loadAll(): Promise<Scenario[]> {
  let files: string[]
  try {
    files = (await readdir(SCENARIOS_DIR)).filter((f: string) => f.endsWith('.json'))
  } catch (cause) {
    throw new AdapterError(
      'urn:archimulant:internal-error',
      `Failed to read scenarios directory: ${SCENARIOS_DIR}`,
      { cause }
    )
  }

  const scenarios: Scenario[] = []

  for (const file of files) {
    const filePath = join(SCENARIOS_DIR, file)
    try {
      const raw = JSON.parse(await readFile(filePath, 'utf-8'))
      const parsed = ScenarioFileSchema.parse(raw)
      scenarios.push({
        ...parsed,
        baselineMetrics: computeBaselineMetrics(parsed.topology)
      })
    } catch (cause) {
      const logger = useLogger(useEvent())
      logger.warn(`Skipping invalid scenario file: ${file}`, { cause })
    }
  }

  return scenarios
}

export function createFileScenarioRepository(): ScenarioRepository {
  return {
    async findAll(): Promise<ScenarioSummary[]> {
      const scenarios = await loadAll()
      return scenarios.map(({ id, meta, targetMetrics }) => ({
        id,
        meta,
        targetMetrics
      }))
    },

    async findById(id: string): Promise<Scenario | null> {
      const scenarios = await loadAll()
      return scenarios.find(s => s.id === id) ?? null
    }
  }
}

export const scenarioRepository: ScenarioRepository
  = createFileScenarioRepository()
