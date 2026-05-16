import type { ScenarioSummary } from '~~/server/domain/scenario/scenario'
import type { ScenarioRepository } from '~~/server/ports/scenario-repository'

export const listScenarios = async (
  deps: { scenarios: ScenarioRepository }
): Promise<ScenarioSummary[]> => {
  return deps.scenarios.listAll()
}
