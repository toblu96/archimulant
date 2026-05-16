import { getScenario } from '~~/server/application/scenarios/get-scenario.usecase'
import { AppError } from '~~/server/domain/errors'
import { ScenarioIdSchema } from '~~/server/domain/scenario/scenario'
import * as z from 'zod'

const metricsSchema = {
  type: 'object',
  properties: {
    availability: { type: 'number', minimum: 0, maximum: 100 },
    throughputRps: { type: 'number' },
    latencyMs: { type: 'number' }
  }
} as const

defineRouteMeta({
  openAPI: {
    tags: ['Scenarios'],
    description: 'Returns a scenario with its topology and computed baseline metrics.',
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
        description: 'Scenario with nodes, edges, target metrics, and computed baseline metrics.',
        content: {
          'application/json': {
            schema: {
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
                topology: {
                  type: 'object', properties: {
                    nodes: { type: 'array' },
                    edges: { type: 'array' }
                  }
                },
                budget: {
                  type: 'object', properties: {
                    yearlyOperational: {
                      type: 'object', properties: {
                        limit: { type: 'number' },
                        baselineCost: { type: 'number' }
                      }
                    },
                    oneTimeInvestment: {
                      type: 'object', properties: {
                        limit: { type: 'number' },
                        baselineCost: { type: 'number' }
                      }
                    }
                  }
                },
                targetMetrics: metricsSchema,
                actualMetrics: metricsSchema,
                improvements: { type: 'array' }
              }
            }
          }
        }
      },
      400: {
        description: 'Invalid input parameter.',
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
                  detail: 'Invalid scenario id: my scenario',
                  instance: '/api/scenarios/my%20scenario'
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
                  detail: 'Scenario ecommerce-peak-traffic not found',
                  instance: '/api/scenarios/ecommerce-peak-traffic',
                  fix: 'Check the id or call GET /scenarios to list available ones'
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
    data => z.object({ id: ScenarioIdSchema }).parse(data)
  )

  try {
    return await getScenario(event.context.scope, id)
  } catch (err) {
    if (err instanceof AppError && err.code === 'urn:archimulant:scenario-not-found') {
      throw createError({
        statusCode: 404,
        statusMessage: err.message,
        data: { type: err.code, title: 'Scenario Not Found', fix: err.fix }
      })
    }
    throw err
  }
})
