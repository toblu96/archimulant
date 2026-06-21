defineRouteMeta({
  openAPI: {
    tags: ['Health'],
    description: 'Liveness/readiness probe for deployment platforms.',
    responses: {
      200: {
        description: 'The server is up.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['ok'] }
              }
            }
          }
        }
      }
    }
  }
})

export default defineEventHandler(() => {
  return { status: 'ok' }
})
