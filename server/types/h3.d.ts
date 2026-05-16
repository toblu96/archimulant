import type { RequestContainer } from '~/server/container'

declare module 'h3' {
  interface H3EventContext { scope: RequestContainer }
}
