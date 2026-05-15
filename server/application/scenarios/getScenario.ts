import type { ScenarioRepository } from '~~/server/adapters/scenarios/port'
import { ApplicationError } from '~~/server/utils/errors'
import type { Scenario } from '~~/server/domain/scenario/schema'

export async function getScenario(
  repo: ScenarioRepository,
  id: string
): Promise<Scenario> {
  let scenario: Scenario | null
  try {
    scenario = await repo.findById(id)
  } catch (cause) {
    throw new ApplicationError(
      'urn:archimulant:internal-error',
      `Failed to retrieve scenario: ${id}`,
      cause
    )
  }

  if (!scenario) {
    throw new ApplicationError(
      'urn:archimulant:scenario-not-found',
      `Scenario not found: ${id}`
    )
  }

  return scenario
}
