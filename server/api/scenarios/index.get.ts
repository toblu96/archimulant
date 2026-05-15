import { listScenarios } from '~~/server/application/scenarios/listScenarios'
import { scenarioRepository } from '~~/server/adapters/scenarios/FileScenarioRepository'

defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        schemas: {
          ProblemDetails: {
            type: 'object',
            required: ['type', 'title', 'status', 'instance'],
            properties: {
              type: { type: 'string', format: 'uri', description: 'URN identifying the problem type' },
              title: { type: 'string', description: 'Short human-readable summary of the problem' },
              status: { type: 'integer', description: 'HTTP status code' },
              detail: { type: 'string', description: 'Human-readable explanation specific to this occurrence' },
              instance: { type: 'string', description: 'URI reference identifying the specific request' },
              why: { type: 'string', description: 'Reason the error occurred' },
              fix: { type: 'string', description: 'Actionable suggestion to resolve the problem' }
            }
          }
        }
      }
    },
    tags: ['Scenarios'],
    description: 'Returns metadata and target metrics for all available scenarios.',
    responses: {
      200: {
        description: 'List of scenario summaries',
        content: {
          'application/json': {
            schema: {
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

export default defineEventHandler(async () => {
  return await listScenarios(scenarioRepository)
})
