import type { Scenario, ScenarioSummary } from '~~/server/domain/scenario/schema'

export interface ScenarioRepository {
  findAll(): Promise<ScenarioSummary[]>
  findById(id: string): Promise<Scenario | null>
}
