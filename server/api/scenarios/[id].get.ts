import { z } from 'zod'
import { getScenario } from '~~/server/application/scenarios/getScenario'
import { scenarioRepository } from '~~/server/adapters/scenarios/FileScenarioRepository'
import { ApplicationError } from '~~/server/utils/errors'
import { logger } from '~~/server/utils/logger'

defineRouteMeta({
  openAPI: {
    tags: ['Scenarios'],
    description: 'Returns the full scenario definition including topology, improvements, and computed baseline metrics.',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'string' },
        description: 'Scenario identifier',
        example: 'ecommerce-peak-traffic'
      }
    ],
    responses: {
      200: {
        description: 'Full scenario with computed baseline metrics',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                data: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    meta: { type: 'object' },
                    budget: { type: 'object' },
                    targetMetrics: { type: 'object' },
                    baselineMetrics: {
                      type: 'object',
                      properties: {
                        availability: { type: 'number' },
                        p99LatencyMillis: { type: 'number' },
                        requestsPerSecond: { type: 'number' }
                      }
                    },
                    topology: { type: 'object' },
                    improvements: { type: 'array' }
                  }
                }
              }
            }
          }
        }
      },
      400: { description: 'Invalid input' },
      404: { description: 'Scenario not found' },
      500: { description: 'Internal server error' }
    }
  }
})

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(
    event,
    data => z.object({ id: z.string().min(1) }).parse(data)
  )

  try {
    const scenario = await getScenario(scenarioRepository, id)
    return { data: scenario }
  } catch (error) {
    if (error instanceof ApplicationError) {
      if (error.code === 'urn:archimulant:scenario-not-found') {
        throw createError({ statusCode: 404, message: error.message, data: { code: error.code } })
      }
      logger.error('GET /api/scenarios/:id failed', { cause: error })
      throw createError({ statusCode: 500, message: error.message, data: { code: error.code } })
    }
    logger.error('GET /api/scenarios/:id unexpected error', { cause: error })
    throw createError({ statusCode: 500, message: 'Internal server error' })
  }
})
