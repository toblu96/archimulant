import { z } from 'zod'
import { getScenario } from '~~/server/application/scenarios/getScenario'
import { scenarioRepository } from '~~/server/adapters/scenarios/FileScenarioRepository'
import { ApplicationError } from '~~/server/utils/errors'

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
        description: 'Full scenario with computed baseline metrics.',
        content: {
          'application/json': {
            schema: {
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
      },
      400: {
        description: 'The path parameter did not pass validation.',
        content: {
          'application/problem+json': {
            schema: {
              type: 'object',
              allOf: [
                { $ref: '#/components/schemas/ProblemDetails' },
                { type: 'object', properties: { type: { type: 'string', enum: ['urn:archimulant:invalid-input'] } } }
              ]
            },
            examples: {
              'invalid-input': {
                value: {
                  type: 'urn:archimulant:invalid-input',
                  title: 'Invalid Input',
                  status: 400,
                  detail: 'Too small: expected string to have >=1 characters',
                  instance: '/api/scenarios/%20'
                }
              }
            }
          }
        }
      },
      404: {
        description: 'No scenario exists with the given identifier.',
        content: {
          'application/problem+json': {
            schema: {
              type: 'object',
              allOf: [
                { $ref: '#/components/schemas/ProblemDetails' },
                { type: 'object', properties: { type: { type: 'string', enum: ['urn:archimulant:scenario-not-found'] } } }
              ]
            },
            examples: {
              'scenario-not-found': {
                value: {
                  type: 'urn:archimulant:scenario-not-found',
                  title: 'Scenario Not Found',
                  status: 404,
                  detail: 'Scenario not found: ecommerce-peak-traffic',
                  instance: '/api/scenarios/ecommerce-peak-traffic',
                  fix: 'Use GET /api/scenarios to retrieve available scenario identifiers.'
                }
              }
            }
          }
        }
      },
      500: {
        description: 'An unexpected server error occurred.',
        content: {
          'application/problem+json': {
            schema: {
              type: 'object',
              allOf: [
                { $ref: '#/components/schemas/ProblemDetails' },
                { type: 'object', properties: { type: { type: 'string', enum: ['urn:archimulant:internal-error'] } } }
              ]
            }
          }
        }
      }
    }
  }
})

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(
    event,
    data => z.object({ id: z.string().trim().min(1) }).parse(data)
  )

  try {
    const scenario = await getScenario(scenarioRepository, id)
    return { data: scenario }
  } catch (error) {
    if (error instanceof ApplicationError && error.code === 'urn:archimulant:scenario-not-found') {
      throw createError({
        statusCode: 404,
        message: error.message,
        data: {
          type: 'urn:archimulant:scenario-not-found',
          title: 'Scenario Not Found',
          ...(error.fix ? { fix: error.fix } : {})
        }
      })
    }
    throw error
  }
})
