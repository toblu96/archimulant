import type { ScenarioRepository } from '~~/server/adapters/scenarios/port'
import { ApplicationError } from '~~/server/utils/errors'
import type { ScenarioSummary } from '~~/server/domain/scenario/schema'

export async function listScenarios(
  repo: ScenarioRepository
): Promise<ScenarioSummary[]> {
  try {
    return await repo.findAll()
  } catch (cause) {
    throw new ApplicationError(
      'urn:archimulant:internal-error',
      'Failed to list scenarios',
      cause
    )
  }
}
