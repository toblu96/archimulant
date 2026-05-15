import { listScenarios } from '~~/server/application/scenarios/listScenarios'
import { scenarioRepository } from '~~/server/adapters/scenarios/FileScenarioRepository'
import { ApplicationError } from '~~/server/utils/errors'
import { logger } from '~~/server/utils/logger'

defineRouteMeta({
  openAPI: {
    tags: ['Scenarios'],
    description: 'Returns metadata and target metrics for all available scenarios.',
    responses: {
      200: {
        description: 'List of scenario summaries',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                data: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      meta: {
                        type: 'object',
                        properties: {
                          title: { type: 'string' },
                          description: { type: 'string' },
                          difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
                          tags: { type: 'array', items: { type: 'string' } },
                          estimatedMinutes: { type: 'number' }
                        }
                      },
                      targetMetrics: {
                        type: 'object',
                        properties: {
                          availability: { type: 'number' },
                          p99LatencyMillis: { type: 'number' },
                          requestsPerSecond: { type: 'number' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      500: { description: 'Internal server error' }
    }
  }
})

export default defineEventHandler(async () => {
  try {
    const scenarios = await listScenarios(scenarioRepository)
    return { data: scenarios }
  } catch (error) {
    logger.error('GET /api/scenarios failed', { cause: error })
    if (error instanceof ApplicationError) {
      throw createError({ statusCode: 500, message: error.message, data: { code: error.code } })
    }
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
