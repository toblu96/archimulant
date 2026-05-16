import { AppError } from '~~/server/domain/errors'
import { computeActualMetrics } from '~~/server/domain/scenario/computeMetrics'
import type { Metrics, Scenario, ScenarioId } from '~~/server/domain/scenario/scenario'
import type { Logger } from '~~/server/ports/logger'
import type { ScenarioRepository } from '~~/server/ports/scenario-repository'

export type ScenarioDetail = Scenario & { actualMetrics: Metrics }

export const getScenario = async (
  deps: { scenarios: ScenarioRepository, logger: Logger },
  id: ScenarioId
): Promise<ScenarioDetail> => {
  const scenario = await deps.scenarios.findById(id)
  deps.logger.set({ scenario: { id, found: !!scenario } })
  if (!scenario) {
    throw new AppError(
      'urn:archimulant:scenario-not-found',
      `Scenario ${id} not found`,
      { fix: 'Check the id or call GET /scenarios to list available ones' }
    )
  }
  return { ...scenario, actualMetrics: computeActualMetrics(scenario) }
}
