import type { ScenarioId, Scenario, ScenarioSummary } from '~~/server/domain/scenario/scenario'

export interface ScenarioRepository {
  findById(id: ScenarioId): Promise<Scenario | null>
  listAll(): Promise<ScenarioSummary[]>
}
